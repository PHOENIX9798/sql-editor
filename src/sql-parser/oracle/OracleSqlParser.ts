import { ISqlStatement } from "../sql/SqlStatement";
import PlSqlLexer from "../../ANTLR/PlSqlLexer";
import { CharStream, CommonTokenStream, Token } from "antlr4";
import { SqlBlockInfo } from "../sql/SqlBlockInfo";

export class OracleSqlParser {
  split(text: string): ISqlStatement[] {
    const charStream = new CharStream(text);
    const lexer = new PlSqlLexer(charStream);
    lexer.removeErrorListeners();

    let start = -1;
    let startLine = 1;
    let startColumn = 0;
    const delimiter = ";";
    let firstKeyWordType: number | null = null;
    let secondKeyWordType: number | null = null;
    let prevToken: Token | null = null;
    let block: SqlBlockInfo | null = null;
    const sqls: ISqlStatement[] = [];
    for (;;) {
      const token = this.nextToken(lexer);
      console.log("=======>TOKEN:", token);
      if (start == -1) {
        start = token.start;
        startLine = token.line;
        startColumn = token.column;
      }
      try {
        // 处理 '/' 为结束符的情况
        if (
          prevToken !== null &&
          prevToken.type === PlSqlLexer.SOLIDUS &&
          prevToken.column === 0 &&
          token.line !== prevToken.line
        ) {
          if (start < prevToken.start) {
            sqls.push({
              originalText: text.substring(start, prevToken.stop),
              text: text.substring(start, prevToken.stop),
              offset: start,
              length: prevToken.stop - start,
              startLine: startLine,
              startColumn: startColumn,
              stopLine: prevToken.line,
              stopColumn: prevToken.column,
            });
          }
          start = token.start;
          startLine = token.line;
          startColumn = token.column;

          block = null;
          firstKeyWordType = null;
          secondKeyWordType = null;
        }

        if (token.type === Token.EOF) {
          if (start < token.stop) {
            sqls.push({
              originalText: text.substring(start, prevToken.stop + 1),
              text: text.substring(start, prevToken.stop + 1),
              offset: start,
              length: prevToken.stop - start + 1,
              startLine: startLine,
              startColumn: startColumn,
              stopLine: prevToken.line,
              stopColumn:
                prevToken.column + prevToken.stop - prevToken.start + 1,
            });
          }
          break;
        }
        // 处理 ';' 为结束符的情况
        if (token.text === delimiter && block === null) {
          if (start < token.start) {
            sqls.push({
              originalText: text.substring(start, token.stop + 1),
              text: text.substring(start, token.stop + 1),
              offset: start,
              length: token.stop - start + 1,
              startLine: startLine,
              startColumn: startColumn,
              stopLine: token.line,
              stopColumn: token.column + token.stop - token.start + 1,
            });
          }
          start = -1;

          block = null;
          firstKeyWordType = null;
          secondKeyWordType = null;
          continue;
        }

        if (token.type === PlSqlLexer.CREATE) {
          firstKeyWordType = PlSqlLexer.CREATE;
        } else if (token.type === PlSqlLexer.DECLARE) {
          if (
            firstKeyWordType === PlSqlLexer.CREATE &&
            secondKeyWordType === PlSqlLexer.TRIGGER
          ) {
            // create trigger t1 declare ... begin ... end
            block = block.parent;
          }
          firstKeyWordType = PlSqlLexer.DECLARE;
          block = new SqlBlockInfo(block, true);
        } else if (
          token.type === PlSqlLexer.PROCEDURE ||
          token.type === PlSqlLexer.FUNCTION
        ) {
          // CREATE FUNCTION/PROCEDURE
          // DECLARE FUNCTION/PROCEDURE
          // CREATE PACKAGE BODY
          //      FUNCTION/PROCEDURE name()
          // CREATE TYPE BODY
          //      MEMBER FUNCTION/PROCEDURE name()
          if (firstKeyWordType === PlSqlLexer.DECLARE) {
            block = new SqlBlockInfo(block, true);
          } else if (firstKeyWordType === PlSqlLexer.CREATE) {
            if (secondKeyWordType === null) {
              block = new SqlBlockInfo(block, true);
              secondKeyWordType = token.type;
            } else if (secondKeyWordType === PlSqlLexer.BODY) {
              block = new SqlBlockInfo(block, true);
            }
          }
        } else if (token.type === PlSqlLexer.PACKAGE) {
          if (firstKeyWordType === PlSqlLexer.CREATE) {
            secondKeyWordType = PlSqlLexer.PACKAGE;
            block = new SqlBlockInfo(block, false);
          }
        } else if (token.type === PlSqlLexer.BODY) {
          // CREATE PACKAGE BODY, CREATE TYPE BODY
          if (
            firstKeyWordType === PlSqlLexer.CREATE &&
            (secondKeyWordType === PlSqlLexer.PACKAGE ||
              secondKeyWordType === PlSqlLexer.TYPE)
          ) {
            secondKeyWordType = PlSqlLexer.BODY;
          }
        } else if (token.type === PlSqlLexer.TRIGGER) {
          if (
            firstKeyWordType === PlSqlLexer.CREATE &&
            secondKeyWordType === null
          ) {
            secondKeyWordType = PlSqlLexer.TRIGGER;
            block = new SqlBlockInfo(block, true);
          }
        } else if (token.type === PlSqlLexer.COMPOUND) {
          // create trigger t1
          //    compound trigger
          //   after xxx is
          //   begin
          //   end after xxx;
          if (
            firstKeyWordType === PlSqlLexer.CREATE &&
            secondKeyWordType === PlSqlLexer.TRIGGER &&
            block !== null &&
            block.isHeader
          ) {
            block.isHeader = false;
          }
        } else if (token.type === PlSqlLexer.BEGIN) {
          if (block !== null && block.isHeader) {
            block = block.parent;
          }
          block = new SqlBlockInfo(block, false);
        } else if (token.type === PlSqlLexer.END) {
          if (block !== null) {
            block = block.parent;
          }
        } else if (
          token.type === PlSqlLexer.IF ||
          token.type === PlSqlLexer.LOOP ||
          token.type === PlSqlLexer.CASE
        ) {
          if (prevToken !== null && prevToken.type !== PlSqlLexer.END) {
            block = new SqlBlockInfo(block, false);
          }
        }
      } finally {
        prevToken = token;
      }
    }
    return sqls;
  }
  nextToken(lexer: PlSqlLexer): Token {
    while (true) {
      const token = lexer.nextToken();
      if (PlSqlLexer.channelNames[token.channel] === "HIDDEN") {
        continue;
      }
      return token;
    }
  }
}
