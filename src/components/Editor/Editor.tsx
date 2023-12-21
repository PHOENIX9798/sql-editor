import * as React from 'react';
import * as monaco from 'monaco-editor-core';
import { ISqlStatement } from "../../sql-parser/sql/SqlStatement";

interface IEditorPorps {
    language: string;
    handleSqlSplit?: (dataSource: string, text: string) => ISqlStatement[];
}

const Editor: React.FC<IEditorPorps> = (props: IEditorPorps) => {
    let divNode;
    const assignRef = React.useCallback((node) => {
        // On mount get the ref of the div and assign it the divNode
        divNode = node;
    }, []);

    React.useEffect(() => {
        if (divNode) {
            const editor = monaco.editor.create(divNode, {
                language: props.language,
                minimap: { enabled: false },
                autoIndent: true
            });
            editor.addAction({
              id: "split_sql_statement",
              label: "split_sql_statement",
              contextMenuGroupId: "navigation",
              contextMenuOrder: 1,
              run: function (ed) {
                if (props.handleSqlSplit) {
                  props.handleSqlSplit(props.language, ed.getValue());
                }
              },
            });
            // Assuming you have a reference to your Monaco Editor instance called 'editor'
      
            editor.onMouseDown((e) => {
              if (!e.event.ctrlKey) {
                return;
              }
              console.log("cursor target type:", e.target.type);
              if (e.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT) {
                const position = e.target.position;
                console.log("cursor:", position.lineNumber, position.column);
                const sqls = props.handleSqlSplit(props.language, editor.getValue());
                let selectionRange: monaco.Range | null = null;
                for (let i = 0; i < sqls.length; i++) {
                  // antlr4和monaco的坐标有差异，antlr4.column+1=monaco.column
                  const monacoRange = new monaco.Range(
                    sqls[i].startLine,
                    sqls[i].startColumn + 1,
                    sqls[i].stopLine,
                    sqls[i].stopColumn + 1
                  );
                  if (monacoRange.containsPosition(position)) {
                    selectionRange = monacoRange;
                  }
                }
                if (selectionRange) {
                  // Create a selection range for the word
                  // Set the selection to the word
                  editor.setSelection(selectionRange);
                }
              }
            });
        }
    }, [assignRef])

    return <div ref={assignRef} style={{ height: '90vh' }}></div>;
}

export { Editor };