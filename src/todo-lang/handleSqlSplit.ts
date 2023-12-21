import { SplitSqlStatement } from "../sql-parser/SqlParserEngine";
import { ISqlParserContext } from "../sql-parser/sql/SqlParserContext";
import { ISqlStatement } from "../sql-parser/sql/SqlStatement";

export function handleSqlSplit(
  dataSource: string,
  text: string
): ISqlStatement[] {
  const sqlParserContext: ISqlParserContext = {
    dataSource: dataSource,
    sqlContent: text,
  };
  return SplitSqlStatement(sqlParserContext);
}
