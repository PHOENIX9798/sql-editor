import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { setupLanguage } from "./todo-lang/setup";
import { Editor } from './components/Editor/Editor';
import { languageID } from './todo-lang/config';
import { handleSqlSplit } from './todo-lang/handleSqlSplit';

setupLanguage();
const App = () => <Editor language={languageID} handleSqlSplit={handleSqlSplit}></Editor>;

ReactDOM.render(<App />, document.getElementById('container'));