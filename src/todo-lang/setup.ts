import * as monaco from "monaco-editor-core";
import { languageExtensionPoint, languageID } from "./config";
import { richLanguageConfiguration, monarchLanguage } from "./TodoLang";
import { TodoLangWorker } from "./todoLangWorker";
import { WorkerManager } from "./WorkerManager";
import DiagnosticsAdapter from "./DiagnosticsAdapter";
import TodoLangFormattingProvider from "./TodoLangFormattingProvider";
import OracleCompletionItemProvider from './OracleCompletionItemProvider';

export function setupLanguage() {
    (window as any).MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
            if (label === languageID)
                return "./todoLangWorker.js";
            return './editor.worker.js';
        }
    }
    monaco.languages.register(languageExtensionPoint);
    monaco.languages.onLanguage(languageID, () => {
        // 配置了语法高亮
        monaco.languages.setMonarchTokensProvider(languageID, monarchLanguage);
        // 配置了代码折叠打开,todo
        monaco.languages.setLanguageConfiguration(languageID, richLanguageConfiguration);
        const client = new WorkerManager();

        const worker: WorkerAccessor = (...uris: monaco.Uri[]): Promise<TodoLangWorker> => {
            return client.getLanguageServiceWorker(...uris);
        };
        new DiagnosticsAdapter(worker);
        monaco.languages.registerCompletionItemProvider(languageID, new OracleCompletionItemProvider(worker));
        monaco.languages.registerDocumentFormattingEditProvider(languageID, new TodoLangFormattingProvider(worker));
    });
    console.log(' 自动填充:>> ', `
    两种，表的提示，关键字提示，
    优点：表名的提示和列名的提示，
    缺点：表名和列名提示跟关键字提示做一起了，数据量大的时候难找`);
    console.log(' 语义分析:>> ', `
    select 后面的所选表是否存在，from后面所选表是否存在、是否重复；
    错误例子：SELECT t1.column1 AS t1_col1, t2.column2 t2_col2 FROM table1
    正确表名：Classes
    正确列名：ClassID
    `);
}

export type WorkerAccessor = (...uris: monaco.Uri[]) => Promise<TodoLangWorker>;