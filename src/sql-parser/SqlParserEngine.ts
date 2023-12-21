import { OracleSqlParser } from "./oracle/OracleSqlParser";
import { ISqlParserContext } from "./sql/SqlParserContext";
import { ISqlStatement } from "./sql/SqlStatement";

export function SplitSqlStatement(props: ISqlParserContext): ISqlStatement[] {
  let sqls: ISqlStatement[] = [];
  if (props.dataSource === "oracle") {
    const parser = new OracleSqlParser();
    sqls = parser.split(props.sqlContent);
  }
  console.log(sqls);
  return sqls;
}
