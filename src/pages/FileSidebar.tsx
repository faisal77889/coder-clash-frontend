import React, { useState, useEffect, useRef } from 'react';
import { Tree, type TreeApi, type NodeRendererProps } from 'react-arborist';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  File,
  FilePlus,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  FileCode2,
  FileJson,
  FileText,
  Palette,
  Check,
  X,
} from 'lucide-react';
import { useWebSocket, type TreeNode } from '../utils/WebContext';

interface FileSidebarProps {
  onFileSelect?: (filePath: string) => void;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode2 className="w-4 h-4 text-blue-400" />;
    case 'js':
    case 'jsx':
      return <FileCode2 className="w-4 h-4 text-amber-400" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-emerald-400" />;
    case 'css':
      return <Palette className="w-4 h-4 text-sky-400" />;
    case 'md':
      return <FileText className="w-4 h-4 text-purple-400" />;
    default:
      return <File className="w-4 h-4 text-zinc-400" />;
  }
};

const CustomNode: React.FC<NodeRendererProps<TreeNode>> = ({ node, style }) => {
  const ws = useWebSocket();
  const isFolder = node.data.isFolder;
  const isSelected = ws?.selectedFile === node.data.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    node.select();
    if (isFolder) {
      if (node.isOpen) {
        node.close();
      } else {
        node.open();
        console.log('[FileSidebar] Clicking folder to get structure:', node.data.path);
        ws?.refreshFolder(node.data.path);
      }
    } else {
      console.log('[FileSidebar] Clicking file:', node.data.path);
      ws?.selectFile(node.data.path);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={style}
      className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs font-mono select-none transition-colors duration-100 ${
        isSelected
          ? 'bg-blue-600/20 text-blue-300 font-medium'
          : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
      }`}
    >
      {isFolder ? (
        <span className="text-zinc-500 w-3.5 flex items-center justify-center shrink-0">
          {node.isOpen ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </span>
      ) : (
        <span className="w-3.5 shrink-0" />
      )}

      <span className="shrink-0">
        {isFolder ? (
          node.isOpen ? (
            <FolderOpen className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          ) : (
            <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          )
        ) : (
          getFileIcon(node.data.name)
        )}
      </span>

      <span className="truncate flex-1">{node.data.name}</span>
    </div>
  );
};

const FileSidebar: React.FC<FileSidebarProps> = () => {
  const ws = useWebSocket();
  const treeRef = useRef<TreeApi<TreeNode>>(null);
  const [activeInput, setActiveInput] = useState<'file' | 'folder' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [targetFolder, setTargetFolder] = useState<string>('/app');

  if (!ws) return null;

  const { fileTree, selectFile, createFile, createFolder, refreshFolder, lastFetchedFolder } = ws;

  useEffect(() => {
    refreshFolder('/app');
  }, [refreshFolder]);

  // When a folder's children are loaded from WebSocket, ensure it opens immediately on the first click
  useEffect(() => {
    if (lastFetchedFolder && lastFetchedFolder !== '/app') {
      const normalized = lastFetchedFolder.replace(/\/$/, '');
      console.log('[FileSidebar] Auto-opening folder upon arrival:', normalized);
      treeRef.current?.open(normalized);
    }
  }, [fileTree, lastFetchedFolder]);

  const handleCreateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setActiveInput(null);
      return;
    }

    if (activeInput === 'file') {
      createFile(targetFolder, trimmed);
    } else if (activeInput === 'folder') {
      createFolder(targetFolder, trimmed);
    }

    setActiveInput(null);
    setInputValue('');
  };

  const handleCancelInput = () => {
    setActiveInput(null);
    setInputValue('');
  };

  const startNewFile = () => {
    setActiveInput('file');
    setInputValue('');
  };

  const startNewFolder = () => {
    setActiveInput('folder');
    setInputValue('');
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900/60 text-zinc-200 select-none overflow-hidden">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/80 flex-shrink-0">
        <div
          onClick={() => {
            console.log('[FileSidebar Header] Requesting root folder structure');
            refreshFolder('/app');
          }}
          title="Click to refresh workspace folders"
          className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
            Explorer
          </span>
          <span className="text-[10px] text-zinc-500 font-mono truncate">
            {targetFolder === '/app' ? '/app' : targetFolder.replace('/app', '')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={startNewFile}
            title={`New File in ${targetFolder}`}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={startNewFolder}
            title={`New Folder in ${targetFolder}`}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => refreshFolder('/app')}
            title="Refresh All Files"
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Create Input */}
      {activeInput && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-2 border-b border-zinc-800 bg-zinc-900/90 flex items-center gap-1.5"
        >
          <span className="shrink-0 text-zinc-400">
            {activeInput === 'file' ? (
              <FilePlus className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            )}
          </span>
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancelInput();
            }}
            placeholder={activeInput === 'file' ? 'filename.ts' : 'folder_name'}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="p-1 rounded bg-blue-600/30 text-blue-400 hover:bg-blue-600/50 cursor-pointer"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleCancelInput}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      )}

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto p-2">
        {fileTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-xs text-zinc-500">
            <span>Loading workspace files...</span>
          </div>
        ) : (
          <Tree
            ref={treeRef}
            data={fileTree}
            width="100%"
            indent={14}
            rowHeight={28}
            openByDefault={false}
            disableDrag
            disableDrop
            onSelect={(nodes) => {
              if (nodes && nodes.length > 0) {
                const node = nodes[0];
                if (node.data.isFolder) {
                  setTargetFolder(node.data.path);
                } else {
                  console.log('[Tree onSelect] Selected file:', node.data.path);
                  selectFile(node.data.path);
                  const parts = node.data.path.split('/');
                  parts.pop();
                  setTargetFolder(parts.join('/') || '/app');
                }
              }
            }}
            onActivate={(node) => {
              if (!node.data.isFolder) {
                console.log('[Tree onActivate] Activated file:', node.data.path);
                selectFile(node.data.path);
              }
            }}
          >
            {CustomNode}
          </Tree>
        )}
      </div>
    </div>
  );
};

export default FileSidebar;
