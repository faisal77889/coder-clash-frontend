import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { Code2, FileCode } from 'lucide-react';

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




function MonacoEditor({selectedFile} : any) {

    const [allFileCode,setCurrentAllFileCode] = useState(filesStructure)
    const [currentFile,setCurrentFile] = useState("App.jsx")
    // const editorRef = useRef(null)
    useEffect(()=>{

    },[currentFile])


    function handleEditorChange(value : any) {
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

    // function handleEditorDidMount(editor, monaco) {
    //     // console.log('onMount: the editor instance:', editor);
    //     // console.log('onMount: the monaco instance:', monaco);
    //     console.log("print")
    //     editorRef.current = editor
    // }

    // function handleEditorWillMount(monaco) {
    //     // console.log('beforeMount: the monaco instance:', monaco);
    // }

    // function handleEditorValidation(markers) {
    //     // model markers
    //     // markers.forEach(marker => console.log('onValidate:', marker.message));


    // }

    // console.log(currentFile)

    return (
        <div className="flex flex-col h-full w-full bg-[#1e1e1e] overflow-hidden">
            {/* Top Bar / File Tab Bar */}
            <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 select-none">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1e1e1e] border-t-2 border-blue-500 rounded-t text-xs font-mono text-zinc-200">
                        <FileCode className="w-3.5 h-3.5 text-blue-400" />
                        <span>{currentFile}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/40">
                        <Code2 className="w-3 h-3 text-emerald-400" />
                        <span>JavaScript (JSX)</span>
                    </span>
                    <span className="text-zinc-500">UTF-8</span>
                </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 w-full min-h-0">
                <Editor
                    key={selectedFile}
                    height="100%"
                    // width="20vw"
                    defaultLanguage="javascript"
                    // defaultValue={currentFile.value}
                    onChange={handleEditorChange}
                    // onMount={handleEditorDidMount}
                    // beforeMount={handleEditorWillMount}
                    // onValidate={handleEditorValidation}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        padding: { top: 12 }
                    }}
                    value={selectedFile}
                />
            </div>
        </div>
    );
}

export default MonacoEditor;
