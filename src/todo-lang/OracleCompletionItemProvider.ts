import * as monaco from "monaco-editor-core";
import { WorkerAccessor } from "./setup";

// export const CompletionItemProvider = {
//     provideCompletionItems:(model, position, context, token) => {
//         // 在这里生成并返回建议列表
//         return {
//             suggestions: [
//                 {
//                     label: '建议1',
//                     kind: monaco.languages.CompletionItemKind.Text,
//                     insertText: '插入的文本1'
//                 },
//                 {
//                     label: '建议2',
//                     kind: monaco.languages.CompletionItemKind.Function,
//                     insertText: '插入的文本2'
//                 },
//                 // 其他建议...
//             ]
//         };
//     }
// }

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
        console.log('currentWord :>> ', currentWord);
        // 在此可以补充更多关键字的自动填充
        const WORD_MAP = {
            'a': ['AS', 'ALL'],
            's': ['SELECT'],
            'd': ['DISTINCT'],
            'u': ['UNIQUE'],
            'f': ['FROM'],
            'w': ['WHERE']
        }
        if (Object.keys(WORD_MAP).indexOf(currentWord) > -1) {
            return {
                suggestions:
                    // 通过map遍历相应的关键字对应关系
                    WORD_MAP[currentWord].map(item => {
                        return {
                            label: item,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: item,
                            range
                        }
                    })
            };
        }

        return { suggestions: [] };
    }
}