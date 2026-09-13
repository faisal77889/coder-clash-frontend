import { useEffect, useRef, useState } from "react";
import FileSidebar from "./FileSidebar";
import MonacoEditor from "./MonacoEditor";
import TerminalComponent from "./Terminal";
import { Code, Sparkles } from "lucide-react";
import RenderProblem from "./RenderProblem";
import { SOCKET_URL } from "../Constant";
import { WebsocketContext } from "../utils/WebContext";

const data = [
    { id: "1", name: "Unread" },
    { id: "2", name: "Threads" },
    {
        id: "3",
        name: "Chat Rooms",
        children: [
            { id: "c1", name: "General" },
            { id: "c2", name: "Random" },
            { id: "c3", name: "Open Source Projects" },
        ],
    },
    {
        id: "4",
        name: "Direct Messages",
        children: [
            { id: "d1", name: "Alice" },
            { id: "d2", name: "Bob" },
            { id: "d3", name: "Charlie" },
        ],
    },
];

const Homepage = () => {

    const [selectedFile, setSelectedFile] = useState("");
    const [fileStructure, setFileStructure] = useState(data);
    const [showProblem, setShowProblem] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);
    const [wsReady, setWsReady] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(SOCKET_URL);
        ws.onopen = () => setWsReady(true);
        wsRef.current = ws;

        return () => ws.close();
    }, [])

    return (
        <WebsocketContext.Provider value={wsReady ? wsRef.current : null}>
        <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
            {/* Top Navigation / App Header */}
            <header className="h-11 border-b border-zinc-800/90 bg-zinc-900/90 backdrop-blur px-4 flex items-center justify-between flex-shrink-0 select-none">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-linear-to-tr from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/20">
                        <Code className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm tracking-tight text-white">
                            DevForces
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-[11px] text-zinc-300 font-medium">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Online
                    </span>
                </div>
            </header>

            {/* Main IDE Workspace */}
            <div className="flex flex-1 min-h-0 w-full overflow-hidden">

                {/* problem and file selector */}
                <div className="w-12 border-r border-zinc-800 h-full bg-zinc-900/80 flex flex-col items-center py-2.5 gap-2 flex-shrink-0 select-none">
                    <button
                        type="button"
                        onClick={() => setShowProblem(true)}
                        aria-label="Code selector"
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${showProblem
                            ? "bg-zinc-800 text-zinc-100 shadow-sm"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"
                            }`}
                    >
                        <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                            <path d="M360.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm64.6 136.1c-12.5 12.5-12.5 32.8 0 45.3l73.4 73.4-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0zm-274.7 0c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 150.6 182.6c12.5-12.5 12.5-32.8 0-45.3z" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowProblem(false)}
                        aria-label="File selector"
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${!showProblem
                            ? "bg-zinc-800 text-zinc-100 shadow-sm"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"
                            }`}
                    >
                        <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <path d="M176 48L64 48c-8.8 0-16 7.2-16 16l0 384c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-240-88 0c-39.8 0-72-32.2-72-72l0-88zM316.1 160L224 67.9 224 136c0 13.3 10.7 24 24 24l68.1 0zM0 64C0 28.7 28.7 0 64 0L197.5 0c17 0 33.3 6.7 45.3 18.7L365.3 141.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64z" />
                        </svg>
                    </button>
                </div>

                {/* File Sidebar (Left) */}
                {!showProblem && (
                    <div className="w-64 min-w-[200px] max-w-[300px] flex-shrink-0 border-r border-zinc-800 bg-zinc-900/40 flex flex-col h-full overflow-hidden">
                        <FileSidebar fileStructure={fileStructure} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
                    </div>
                )}

                {/* Render Problem */}
                {showProblem && (
                    <div className="w-[450px] min-w-[320px] max-w-[550px] flex-shrink-0 border-r border-zinc-800 bg-zinc-900/40 flex flex-col h-full overflow-hidden">
                        <RenderProblem />
                    </div>
                )}

                {/* Editor and Terminal (Right) */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-zinc-950">
                    {/* Monaco Editor Section */}
                    <div className="flex-1 min-h-0 flex flex-col">
                        <MonacoEditor selectedFile={selectedFile} />
                    </div>
                    {/* Terminal Section */}
                    <div className="h-64 min-h-[160px] max-h-[45vh] flex-shrink-0 border-t border-zinc-800 flex flex-col">
                        <TerminalComponent />
                    </div>
                </div>
            </div>
        </div>
        </WebsocketContext.Provider>
    );
};

export default Homepage;
