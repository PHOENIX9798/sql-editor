import { OracleStatementParser, Select_statementContext } from "../ANTLR/OracleStatementParser";
import { OracleStatementLexer } from "../ANTLR/OracleStatementLexer";
import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import TodoLangErrorListener, { ITodoLangError } from "./TodoLangErrorListener";

function parse(code: string): { ast: Select_statementContext, errors: ITodoLangError[] } {
    // 将输入的字符串转换成ANTLR可识别的流
    const inputStream = new ANTLRInputStream(code);

    // 词法分析器，带着输入的信息
    const lexer = new OracleStatementLexer(inputStream);

    lexer.removeErrorListeners()

    // 错误监听器，用于捕获词法和语法分析过程中的错误
    const todoLangErrorsListner = new TodoLangErrorListener();

    lexer.addErrorListener(todoLangErrorsListner);

    // 创建一个包含所有标记的流token流，以便语法分析器能够使用这些标记来构建语法树
    const tokenStream = new CommonTokenStream(lexer);
    
    // 语法解析器，用于解析标记流并生成语法树
    const parser = new OracleStatementParser(tokenStream);

    parser.removeErrorListeners();
    parser.addErrorListener(todoLangErrorsListner);

    // 生成ast树
    const ast = parser.select_statement();
    const errors: ITodoLangError[] = todoLangErrorsListner.getErrors();
    return { ast, errors };
}
export function parseAndGetASTRoot(code: string): Select_statementContext {
    const { ast } = parse(code);
    return ast;
}
export function parseAndGetSyntaxErrors(code: string): ITodoLangError[] {
    const { errors } = parse(code);
    return errors;
}