import Editor from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';

const filesStructure = [
    {
        "name" : "App.jsx",
        "value" : "// app code"
    },
    {
        "name" : "File.jsx",
        "value" : "// file code"
    }
]

function MonacoEditor() {
    const [allFileCode,setCurrentAllFileCode] = useState(filesStructure)
    const [currentFile,setCurrentFile] = useState("App.jsx")
    const editorRef = useRef(null)
    useEffect(()=>{

    },[currentFile])


    function handleEditorChange(value, event) {
        // here is the current value
        const updatedFileCode = allFileCode.map((fileCode) => {
            if(fileCode.name  == currentFile){
                return {
                    "name" : currentFile,
                    "value" : value
                }
            }
            return fileCode
        })
        setCurrentAllFileCode(updatedFileCode)
        console.log(value)
    }

    function handleEditorDidMount(editor, monaco) {
        // console.log('onMount: the editor instance:', editor);
        // console.log('onMount: the monaco instance:', monaco);
        console.log("print")
        editorRef.current = editor
    }

    function handleEditorWillMount(monaco) {
        // console.log('beforeMount: the monaco instance:', monaco);
    }

    function handleEditorValidation(markers) {
        // model markers
        // markers.forEach(marker => console.log('onValidate:', marker.message));


    }

    console.log(currentFile)

    return (
        <div className='border-blue-300 border-2 flex-col my-3 w-[50%]'>
            <div>
                <select value={currentFile} onChange={(e) => setCurrentFile(e.target.value)}>
                    <option value="App.jsx">App.jsx</option>
                    <option value="File.jsx">File.jsx</option>
                </select>
    
            </div>
            <Editor
                key={currentFile}
                height="40vh"
                // width="20vw"
                defaultLanguage="javascript"
                // defaultValue={currentFile.value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                beforeMount={handleEditorWillMount}
                onValidate={handleEditorValidation}
                theme='vs-dark'
                value={(allFileCode.find((file) => file.name == currentFile))?.value}
            />
        </div>
    );
}

export default MonacoEditor;