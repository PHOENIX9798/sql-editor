import * as monaco from "monaco-editor-core";
import { WorkerAccessor } from "./setup";
import { TABLE_LIST } from '../data';

export default class OracleCompletionItemProvider implements monaco.languages.CompletionItemProvider {

    constructor(private worker: WorkerAccessor) {

    }

    provideCompletionItems(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        context: monaco.languages.CompletionContext,
        token: monaco.CancellationToken
    ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
        const currentValue = model.getWordUntilPosition(position);
        // 自动填充的位置
        const range = {
            startColumn: position.column - 1,
            startLineNumber: position.lineNumber,
            endColumn: position.column,
            endLineNumber: position.lineNumber
        }
        const currentWord = currentValue.word.toLocaleLowerCase();
        // 在此可以补充更多关键字的自动填充
        const WORD_MAP = {
            'a': [{ 'Keyword': 'AS' }, { 'Keyword': 'ALL' }],
            's': [{ 'Keyword': 'SELECT' }],
            'd': [{ 'Keyword': 'DISTINCT' }],
            'u': [{ 'Keyword': 'UNIQUE' }],
            'f': [{ 'Keyword': 'FROM' }],
            'w': [{ 'Keyword': 'WHERE' }]
        }
        Object.keys(TABLE_LIST).forEach(item => {
            const firstChar = item.slice(0, 1).toLocaleLowerCase();
            insertValue(firstChar, item);
            TABLE_LIST[item].forEach(column => {
                const firstChar = column.slice(0, 1).toLocaleLowerCase();
                insertValue(firstChar, column);
            })
        })

        function insertValue(firstChar: string, value: string) {
            if (WORD_MAP[firstChar]) {
                if (WORD_MAP[firstChar].indexOf(value) > -1) return;
                WORD_MAP[firstChar].push({ 'Class': value });
            } else {
                WORD_MAP[firstChar] = [{ 'Class': value }]
            }
        }

        if (Object.keys(WORD_MAP).indexOf(currentWord) > -1) {
            return {
                suggestions:
                    // 通过map遍历相应的关键字对应关系
                    WORD_MAP[currentWord].map(item => {
                        const key = Object.keys(item)[0];
                        const value = item[key];
                        return {
                            label: value,
                            kind: monaco.languages.CompletionItemKind[key],
                            insertText: value,
                            range
                        }
                    })
            };
        }

        return { suggestions: [] };
    }
}