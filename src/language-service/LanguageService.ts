import { ExpressionContext, From_clauseContext, Select_statementContext, Selected_listContext } from "../ANTLR/OracleStatementParser";
import { parseAndGetASTRoot, parseAndGetSyntaxErrors } from "./parser";
import { ITodoLangError } from "./TodoLangErrorListener";
import { TABLE_LIST } from '../data';
import { FROM } from '../common';
import { ParseTree } from "antlr4ts/tree/ParseTree";

export default class TodoLangLanguageService {
    validate(code: string): ITodoLangError[] {
        const syntaxErrors: ITodoLangError[] = parseAndGetSyntaxErrors(code);
        const ast: Select_statementContext = parseAndGetASTRoot(code);
        return syntaxErrors.concat(checkSemanticRules(ast));
    }
    format(code: string): string {
        // if the code contains errors, no need to format, because this way of formating the code, will remove some of the code
        // to make things simple, we only allow formatting a valide code
        if (this.validate(code).length > 0)
            return code;
        let formattedCode = "";
        // const ast: ExpressionContext = parseAndGetASTRoot(code);
        // ast.children.forEach(node => {
        //     if (node instanceof AddExpressionContext) {
        //         // if a Add expression : ADD TODO "STRING"
        //         const todo = node.STRING().text;
        //         formattedCode += `ADD TODO ${todo}\n`;
        //     }else if(node instanceof CompleteExpressionContext) {
        //         // If a Complete expression: COMPLETE TODO "STRING"
        //         const todoToComplete = node.STRING().text;
        //         formattedCode += `COMPLETE TODO ${todoToComplete}\n`;
        //     }
        // });
        return formattedCode;
    }
}

function checkSemanticRules(ast: Select_statementContext): ITodoLangError[] {
    const errors: ITodoLangError[] = [];
    const definedTodos: string[] = [];
    if (!ast.children) {
        return errors;
    }
    ast.children.forEach((node) => {
        const { text } = node || {};
        const currentTables = Object.keys(TABLE_LIST);
        const currentColumns = [];
        Object.keys(TABLE_LIST).forEach(item => {
            TABLE_LIST[item].forEach(column => {
                if (currentColumns.indexOf(column) === -1) {
                    currentColumns.push(column);
                }
            })
        })
        console.log('node :>> ', node);
        // console.log('node :>> ', node);
        //t1.column1ASt1_col1,t2.column2ASt2_col2
        if (node instanceof Selected_listContext) {
            const { tables, columns } = splitToGetTable(node);
            const diffTableData = diffTables(tables, currentTables);
            if (diffTableData.length > 0) {
                errors.push({
                    code: "2",
                    endColumn: node.stop.stopIndex + 2,
                    endLineNumber: node.stop.line,
                    message: `table ${diffTableData} is not found`,
                    startColumn: node.start.stopIndex + 3,
                    startLineNumber: node.stop.line
                });
            }
            console.log('splitToGetTable(node) :>> ', splitToGetTable(node));
        } else if (node instanceof From_clauseContext) {
            // 考虑table名写错的情况
            // 考虑table写重复的情况
            const tableArray = splitStringToArray(text, FROM);
            const repetTables = findRepet(tableArray);
            const diffData = diffTables(tableArray, currentTables);
            // 如果和库里的tables对比差异的结果大于0，并且词法分析和词法分析都没出错
            if (diffData.length > 0 && text.startsWith(FROM)) {
                errors.push({
                    code: "2",
                    endColumn: node.stop.stopIndex + 2,
                    endLineNumber: node.stop.line,
                    message: `table ${diffData} is not found`,
                    startColumn: node.start.stopIndex + 3,
                    startLineNumber: node.stop.line
                });
            }
            if (repetTables.length) {
                errors.push({
                    code: "3",
                    endColumn: node.stop.charPositionInLine,
                    endLineNumber: node.stop.line,
                    message: `table ${repetTables} is repeat`,
                    startColumn: node.stop.startIndex,
                    startLineNumber: node.stop.line
                });
            }
        }

        // else if (node instanceof Selected_listContext) {
        //     errors.push({
        //         code: "2",
        //         endColumn: node.stop.charPositionInLine + node.stop.stopIndex - node.stop.stopIndex,
        //         endLineNumber: node.stop.line,
        //         message: `Todo ${666888} is not defined`,
        //         startColumn: node.stop.charPositionInLine,
        //         startLineNumber: node.stop.line
        //     });
        // }
        // if (node instanceof AddExpressionContext) {
        //     // if a Add expression : ADD TODO "STRING"
        //     const todo = node.STRING().text;
        //     // If a TODO is defined using ADD TODO instruction, we can re-add it.
        //     if (definedTodos.some(todo_ => todo_ === todo)) {
        //         // node has everything to know the position of this expression is in the code
        //         errors.push({
        //             code: "2",
        //             endColumn: node.stop.charPositionInLine + node.stop.stopIndex - node.stop.stopIndex,
        //             endLineNumber: node.stop.line,
        //             message: `Todo ${todo} already defined`,
        //             startColumn: node.stop.charPositionInLine,
        //             startLineNumber: node.stop.line
        //         });
        //     } else {
        //         definedTodos.push(todo);
        //     }
        // }else if(node instanceof CompleteExpressionContext) {
        //     const todoToComplete = node.STRING().text;
        //     if(definedTodos.every(todo_ => todo_ !== todoToComplete)){
        //         // if the the todo is not yet defined, here we are only checking the predefined todo until this expression
        //         // which means the order is important
        //         errors.push({
        //             code: "2",
        //             endColumn: node.stop.charPositionInLine + node.stop.stopIndex - node.stop.stopIndex,
        //             endLineNumber: node.stop.line,
        //             message: `Todo ${todoToComplete} is not defined`,
        //             startColumn: node.stop.charPositionInLine,
        //             startLineNumber: node.stop.line
        //         });
        //     }
        // }

    })


    return errors;
}

// fromf,h,b,o => [f,h,b,o]
function splitStringToArray(text: string, splitString: string) {
    let res = text.slice(splitString.length).split(',');
    if (res[res.length - 1] === '') {
        res.pop();
    }
    return res;
}

function diffTables(arrayA: string[], arrayB: string[]) {
    return arrayA.filter(item => arrayB.indexOf(item) === -1);
}

// 找到当前array重复的部分
function findRepet(array: string[]) {
    let set = new Set();
    const res = [];
    array.forEach(item => {
        if (set.has(item)) {
            res.push(item);
        } else {
            !(res.indexOf(item) > 0) && set.add(item)
        }
    })
    return res;
}

// 分割select后出现的表名 t1.column1ASt1_col1,t2.column2ASt2_col2
//ExpressionContext
function splitToGetTable(node: ParseTree) {
    const splitRes = [];
    const tableRes = [];
    const columnRes = [];

    function splitTableName(nodeChild: ParseTree) {
        if (nodeChild instanceof ExpressionContext) {
            splitRes.push(nodeChild.text);
        }
        let count = nodeChild.childCount;
        if (count) {
            for (let i = 0; i < count; i++) {
                splitTableName(nodeChild.getChild(i));
            }
        } else {
            return
        }
    }
    splitTableName(node);
    splitRes.forEach(item => {
        const [tableName, columnName] = item.split('.');
        tableRes.push(tableName);
        columnRes.push(columnName);
    })
    return { tables: tableRes, columns: columnRes };
}