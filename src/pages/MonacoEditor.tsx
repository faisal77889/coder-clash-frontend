import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  FileCode,
  Save,
  Check,
  Code2,
  FileQuestion,
} from 'lucide-react';
import { useWebSocket } from '../utils/WebContext';

interface MonacoEditorProps {
  selectedFile?: string | null;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'js':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    case 'sh':
      return 'shell';
    case 'py':
      return 'python';
    default:
      return 'plaintext';
  }
};

const getLanguageLabel = (lang: string): string => {
  switch (lang) {
    case 'typescript':
      return 'TypeScript';
    case 'javascript':
      return 'JavaScript';
    case 'json':
      return 'JSON';
    case 'css':
      return 'CSS';
    case 'html':
      return 'HTML';
    case 'markdown':
      return 'Markdown';
    case 'shell':
      return 'Shell Script';
    default:
      return 'Plain Text';
  }
};

const MonacoEditor: React.FC<MonacoEditorProps> = () => {
  const ws = useWebSocket();
  const [justSaved, setJustSaved] = useState(false);

  if (!ws) return null;

  const { selectedFile, fileContents, updateFileContent, saveFile, dirtyFiles } = ws;

  const activeFilePath = selectedFile;
  const activeFileName = activeFilePath ? activeFilePath.split('/').pop() : '';
  const isDirty = activeFilePath ? dirtyFiles.has(activeFilePath) : false;
  const currentCode = activeFilePath ? fileContents[activeFilePath] ?? '' : '';
  const language = activeFilePath ? getLanguageFromPath(activeFilePath) : 'plaintext';

  const handleEditorChange = (value: string | undefined) => {
    if (activeFilePath && value !== undefined) {
      updateFileContent(activeFilePath, value);
    }
  };

  const handleManualSave = async () => {
    if (!activeFilePath) return;
    await saveFile(activeFilePath);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFilePath, fileContents]);

  if (!activeFilePath) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#1e1e1e] text-zinc-400 select-none p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <FileQuestion className="w-6 h-6 text-zinc-500" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">
          No File Selected
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm mb-4">
          Click on any file from the explorer on the left to view and edit code, or create a new file.
        </p>
        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
          <span>Ctrl + S: Save file</span>
          <span>•</span>
          <span>Ctrl + Enter: Run tests</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] overflow-hidden select-none">
      {/* Top File Tab Bar */}
      <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] border-t-2 border-blue-500 rounded-t text-xs font-mono text-zinc-200 min-w-0">
            <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate max-w-[200px]">{activeFileName}</span>
            {isDirty && (
              <span
                title="Unsaved changes"
                className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Button */}
          <button
            onClick={handleManualSave}
            title="Save File (Ctrl+S)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              justSaved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : isDirty
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
            }`}
          >
            {justSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isDirty ? 'Save *' : 'Save'}</span>
              </>
            )}
          </button>

          {/* Language / Encoding Meta */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/40">
              <Code2 className="w-3 h-3 text-emerald-400" />
              <span>{getLanguageLabel(language)}</span>
            </span>
            <span className="text-zinc-500">UTF-8</span>
          </div>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full min-h-0">
        <Editor
          height="100%"
          language={language}
          value={currentCode}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12 },
            wordWrap: 'on',
            lineNumbers: 'on',
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditor;
