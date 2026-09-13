import { Tree } from 'react-arborist';
import { Folder, FolderPlus, File, FilePlus, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';


function FileSidebar({fileStructure,selectedFile,setSelectedFile} : any) {
  const [selectedNode,setSelectedNode] = useState("");
  console.log("the selected File is ",selectedNode);

  const addFolder = () => {

  };
  const addFile = () => {

  };

  function Node({ node, style, tree }: any) {
    // console.log("Node is : ",node)
    const isFolder = node.children && node.children.length > 0;
    const isSelected = node.isSelected;
    
    const handleClick = () => {
    if (!isFolder) {
      setSelectedFile(node.data.name);
    }
  };

    return (
      <div
        onClick={handleClick}
        style={style}
        className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-[13px] font-mono select-none transition-colors duration-100 ${
          isSelected
            ? 'bg-blue-600/20 text-blue-300 font-medium'
            : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
        }`}
      >
        {/* Folder expand/collapse chevron if folder */}
        {isFolder ? (
          <span className="text-zinc-500">
            {node.isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5" />
        )}

        {/* Icon */}
        <span className="shrink-0">
          {isFolder ? (
            <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          ) : (
            <File className="w-4 h-4 text-sky-400" />
          )}
        </span>

        {/* File/Folder name */}
        <span className="truncate">{node.data.name}</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900/60 text-zinc-200 select-none overflow-hidden">
      {/* Explorer Header & Actions */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/80">
        <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          {/* create folder icon */}
          <button
            onClick={addFolder}
            title="New Folder"
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          {/* create file icon */}
          <button
            onClick={addFile}
            title="New File"
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree container */}
      <div className="flex-1 overflow-y-auto p-2">
        <Tree
          data={fileStructure}
          width="100%"
          indent={14}
          rowHeight={28}
        >
          {Node}
        </Tree>
      </div>
    </div>
  );
}

export default FileSidebar;
