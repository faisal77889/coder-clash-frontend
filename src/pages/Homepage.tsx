import { useEffect, useState } from "react";
import FileSidebar from "./FileSidebar";
import MonacoEditor from "./MonacoEditor";
import TerminalComponent from "./Terminal";
import { Code, Sparkles } from "lucide-react";

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

    const [selectedFile,setSelectedFile] = useState("");
    const [fileStructure,setFileStructure] = useState(data)

    return (
        <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
            {/* Top Navigation / App Header */}
            <header className="h-11 border-b border-zinc-800/90 bg-zinc-900/90 backdrop-blur px-4 flex items-center justify-between flex-shrink-0 select-none">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/20">
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
                {/* File Sidebar (Left) */}
                <div className="w-64 min-w-[200px] max-w-[300px] flex-shrink-0 border-r border-zinc-800 bg-zinc-900/40 flex flex-col h-full overflow-hidden">
                    <FileSidebar fileStructure={fileStructure}  setSelectedFile={setSelectedFile} />
                </div>

                {/* Editor and Terminal (Right) */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-zinc-950">
                    {/* Monaco Editor Section */}
                    <div className="flex-1 min-h-0 flex flex-col">
                        <MonacoEditor selectedFile = {selectedFile} />
                    </div>
                    {/* Terminal Section */}
                    <div className="h-64 min-h-[160px] max-h-[45vh] flex-shrink-0 border-t border-zinc-800 flex flex-col">
                        <TerminalComponent />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
