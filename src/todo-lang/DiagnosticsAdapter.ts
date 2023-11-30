import * as monaco from "monaco-editor-core";
import { WorkerAccessor } from "./setup";
import { languageID } from "./config";
import { ITodoLangError } from "../language-service/TodoLangErrorListener";

export default class DiagnosticsAdapter {
    constructor(private worker: WorkerAccessor) {
       
        const onModelAdd = (model: monaco.editor.IModel): void => {
            let handle: any;
             // 监听，在内容发生变化时执行内容验证，debounce 500ms
            model.onDidChangeContent(() => {
                clearTimeout(handle);
                handle = setTimeout(() => this.validate(model.uri), 500);
            });

            this.validate(model.uri);
        };
        monaco.editor.onDidCreateModel(onModelAdd);
        monaco.editor.getModels().forEach(onModelAdd);
    }
    private async validate(resource: monaco.Uri): Promise<void> {
        // 通过worker获取一个工作器（worker）的代理
        const worker = await this.worker(resource)

        // 调用工作器的doValidation方法，该方法可能会返回代码中的错误信息
        const errorMarkers = await worker.doValidation();

        // 获取当前editor模型
        const model = monaco.editor.getModel(resource);

        // 通过monaco.editor.setModelMarkers将错误信息转换为编辑器可识别的标记，并设置错误的严重程度为Error
        monaco.editor.setModelMarkers(model, languageID, errorMarkers.map(toDiagnostics));
    }
}
function toDiagnostics(error: ITodoLangError): monaco.editor.IMarkerData {
    return {
        ...error,
        severity: monaco.MarkerSeverity.Error,
    };
}