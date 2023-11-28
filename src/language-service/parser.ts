import { OracleStatementParser, ExpressionContext } from "../ANTLR/OracleStatementParser";
import { OracleStatementLexer } from "../ANTLR/OracleStatementLexer";
import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import TodoLangErrorListener, { ITodoLangError } from "./TodoLangErrorListener";

function parse(code: string): {ast:ExpressionContext, errors: ITodoLangError[]} {
    const inputStream = new ANTLRInputStream(code);
    const lexer = new OracleStatementLexer(inputStream);
    lexer.removeErrorListeners()
    const todoLangErrorsListner = new TodoLangErrorListener();
    lexer.addErrorListener(todoLangErrorsListner);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new OracleStatementParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(todoLangErrorsListner);
    const ast =  parser.expression();
    const errors: ITodoLangError[]  = todoLangErrorsListner.getErrors();
    return {ast, errors};
}
export function parseAndGetASTRoot(code: string): ExpressionContext {
    const {ast} = parse(code);
    return ast;
}
export function parseAndGetSyntaxErrors(code: string): ITodoLangError[] {
    const {errors} = parse(code);
    return errors;
}