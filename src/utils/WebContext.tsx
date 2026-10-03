import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { SOCKET_URL } from '../Constant';

export interface TreeNode {
  id: string; // full path, e.g. "/app/src" or "/app/package.json"
  name: string;
  path: string;
  isFolder: boolean;
  children?: TreeNode[];
}

export interface TestAssertion {
  ancestorTitles?: string[];
  fullName: string;
  status: 'passed' | 'failed' | 'pending';
  title: string;
  duration?: number;
  failureMessages?: string[];
}

export interface TestSuiteResult {
  name: string;
  status: string;
  message?: string;
  startTime?: number;
  endTime?: number;
  assertionResults?: TestAssertion[];
}

export interface TestResultData {
  numTotalTestSuites?: number;
  numPassedTestSuites?: number;
  numFailedTestSuites?: number;
  numPendingTestSuites?: number;
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  numPendingTests?: number;
  startTime?: number;
  success?: boolean;
  testResults?: TestSuiteResult[];
}

export interface WebsocketContextType {
  socket: WebSocket | null;
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  
  // File System State
  fileTree: TreeNode[];
  selectedFile: string | null;
  fileContents: Record<string, string>;
  dirtyFiles: Set<string>;
  lastFetchedFolder: string | null;
  
  // File Operations
  selectFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  saveFile: (path?: string) => Promise<void>;
  saveAllFiles: () => Promise<void>;
  createFile: (basePath: string, fileName: string) => void;
  createFolder: (basePath: string, folderName: string) => void;
  refreshFolder: (folderPath: string) => void;
  
  // Terminal Operations
  sendTerminalCommand: (command: string) => void;
  onTerminalOutput: (handler: (data: string | ArrayBuffer) => void) => () => void;
  
  // Problem / Test Operations
  isSubmitting: boolean;
  testResults: TestResultData | null;
  submitProblem: () => void;
  clearTestResults: () => void;
}

export const WebsocketContext = createContext<WebsocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebsocketContext);
  return context;
};

function updateNodeChildren(
  nodes: TreeNode[],
  targetPath: string,
  items: Array<{ name: string; type: string }>
): TreeNode[] {
  const normTarget = targetPath.replace(/\/$/, '');
  return nodes.map((node) => {
    const normNode = node.path.replace(/\/$/, '');
    if (normNode === normTarget) {
      const existingChildrenMap = new Map((node.children || []).map((c) => [c.name, c]));
      const updatedChildren: TreeNode[] = items.map((item) => {
        const childPath = `${normTarget}/${item.name}`;
        const existing = existingChildrenMap.get(item.name);
        return {
          id: childPath,
          name: item.name,
          path: childPath,
          isFolder: item.type === 'folder',
          children: item.type === 'folder' ? existing?.children || [] : undefined,
        };
      });
      return {
        ...node,
        children: updatedChildren,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeChildren(node.children, normTarget, items),
      };
    }
    return node;
  });
}

export const WebsocketProvider: React.FC<{
  challengeId?: string;
  children: React.ReactNode;
}> = ({ challengeId, children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  const [lastFetchedFolder, setLastFetchedFolder] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResultData | null>(null);

  const terminalSubscribersRef = useRef<Set<(data: string | ArrayBuffer) => void>>(new Set());

  const sendWsMessage = useCallback((payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('[WebSocket Client] Sending:', payload);
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn('[WebSocket Client] WebSocket not open! readyState:', wsRef.current?.readyState, payload);
    }
  }, []);

  const refreshFolder = useCallback((folderPath: string) => {
    const normalized = (folderPath || '').replace(/\/$/, '') || '/app';
    sendWsMessage({
      type: 'get_nested_folder',
      message: { folderName: normalized },
    });
  }, [sendWsMessage]);

  const selectFile = useCallback((path: string) => {
    console.log('[WebContext] selectFile triggered for:', path);
    setSelectedFile(path);
    sendWsMessage({
      type: 'file_code',
      message: { filePath: path },
    });
  }, [sendWsMessage]);

  const updateFileContent = useCallback((path: string, content: string) => {
    setFileContents((prev) => ({
      ...prev,
      [path]: content,
    }));
    setDirtyFiles((prev) => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });
  }, []);

  const saveFile = useCallback(async (path?: string) => {
    const targetPath = path || selectedFile;
    if (!targetPath) return;

    setFileContents((currentContents) => {
      const code = currentContents[targetPath] ?? '';
      sendWsMessage({
        type: 'code_write',
        message: [{ filePath: targetPath, code }],
      });
      return currentContents;
    });

    setDirtyFiles((prev) => {
      const next = new Set(prev);
      next.delete(targetPath);
      return next;
    });
  }, [selectedFile, sendWsMessage]);

  const saveAllFiles = useCallback(async () => {
    setFileContents((currentContents) => {
      setDirtyFiles((currentDirty) => {
        if (currentDirty.size === 0) return currentDirty;

        const payload = Array.from(currentDirty).map((fp) => ({
          filePath: fp,
          code: currentContents[fp] ?? '',
        }));

        sendWsMessage({
          type: 'code_write',
          message: payload,
        });

        return new Set();
      });
      return currentContents;
    });
  }, [sendWsMessage]);

  const createFile = useCallback((basePath: string, fileName: string) => {
    sendWsMessage({
      type: 'create_file',
      message: {
        path: basePath,
        name: fileName,
      },
    });
  }, [sendWsMessage]);

  const createFolder = useCallback((basePath: string, folderName: string) => {
    sendWsMessage({
      type: 'create_folder',
      message: {
        path: basePath,
        name: folderName,
      },
    });
  }, [sendWsMessage]);

  const sendTerminalCommand = useCallback((command: string) => {
    sendWsMessage({
      type: 'terminal_command',
      message: command,
    });
  }, [sendWsMessage]);

  const onTerminalOutput = useCallback((handler: (data: string | ArrayBuffer) => void) => {
    terminalSubscribersRef.current.add(handler);
    return () => {
      terminalSubscribersRef.current.delete(handler);
    };
  }, []);

  const submitProblem = useCallback(async () => {
    await saveAllFiles();
    setIsSubmitting(true);
    sendWsMessage({
      type: 'submit_problem',
    });
  }, [saveAllFiles, sendWsMessage]);

  const clearTestResults = useCallback(() => {
    setTestResults(null);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!challengeId) {
      setStatus('idle');
      return;
    }

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      setStatus('error');
      setError('Not authenticated');
      return;
    }

    let socketUrl = `${SOCKET_URL}?token=${encodeURIComponent(token)}&challengeId=${encodeURIComponent(challengeId)}`;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.id) {
          socketUrl += `&userId=${encodeURIComponent(userObj.id)}`;
        }
      } catch {
        // ignore parse error
      }
    }

    setStatus('connecting');
    const ws = new WebSocket(socketUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      setError(null);
      // Request initial root folder contents for /app
      ws.send(
        JSON.stringify({
          type: 'get_nested_folder',
          message: { folderName: '/app' },
        })
      );
    };

    ws.onmessage = (event) => {
      let isControl = false;
      let parsed: any = null;

      try {
        const rawText =
          typeof event.data === 'string'
            ? event.data
            : new TextDecoder().decode(event.data);

        const trimmed = rawText.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          parsed = JSON.parse(trimmed);
          const controlTypes = [
            'nested_folder',
            'file_code',
            'folder_created',
            'file_created',
            'test_result',
            'error',
          ];
          if (parsed && controlTypes.includes(parsed.type)) {
            isControl = true;
          }
        }
      } catch {
        // Not a JSON message
      }

      if (isControl && parsed) {
        switch (parsed.type) {
          case 'nested_folder': {
            const { folderName, items } = parsed;
            const normFolder = (folderName || '').replace(/\/$/, '') || '/app';
            if (normFolder === '/app') {
              setFileTree((prev) => {
                const existingMap = new Map(prev.map((n) => [n.name, n]));
                return (items || []).map((item: any) => {
                  const childPath = `/app/${item.name}`;
                  const existing = existingMap.get(item.name);
                  return {
                    id: childPath,
                    name: item.name,
                    path: childPath,
                    isFolder: item.type === 'folder',
                    children: item.type === 'folder' ? existing?.children || [] : undefined,
                  };
                });
              });
            } else {
              setFileTree((prev) => updateNodeChildren(prev, normFolder, items || []));
            }
            setLastFetchedFolder(normFolder);
            break;
          }

          case 'file_code': {
            const { filePath, content } = parsed;
            setFileContents((prev) => ({
              ...prev,
              [filePath]: content ?? '',
            }));
            break;
          }

          case 'folder_created': {
            const { path } = parsed;
            if (path) {
              refreshFolder(path);
            }
            break;
          }

          case 'file_created': {
            const { path, name } = parsed;
            if (path) {
              refreshFolder(path);
            }
            if (path && name) {
              const fullPath = `${path.replace(/\/$/, '')}/${name}`;
              setSelectedFile(fullPath);
              sendWsMessage({
                type: 'file_code',
                message: { filePath: fullPath },
              });
            }
            break;
          }

          case 'test_result': {
            setIsSubmitting(false);
            setTestResults(parsed.data);
            break;
          }

          case 'error': {
            setIsSubmitting(false);
            setError(parsed.message || 'Error from server');
            setTimeout(() => setError(null), 5000);
            break;
          }
        }
      } else {
        terminalSubscribersRef.current.forEach((subscriber) => {
          try {
            subscriber(event.data);
          } catch (e) {
            console.error('Error in terminal subscriber:', e);
          }
        });
      }
    };

    ws.onerror = (e) => {
      console.error('WebSocket encountered an error:', e);
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [challengeId, refreshFolder, sendWsMessage]);

  const value: WebsocketContextType = {
    socket: wsRef.current,
    status,
    error,
    fileTree,
    selectedFile,
    fileContents,
    dirtyFiles,
    lastFetchedFolder,
    selectFile,
    updateFileContent,
    saveFile,
    saveAllFiles,
    createFile,
    createFolder,
    refreshFolder,
    sendTerminalCommand,
    onTerminalOutput,
    isSubmitting,
    testResults,
    submitProblem,
    clearTestResults,
  };

  return <WebsocketContext.Provider value={value}>{children}</WebsocketContext.Provider>;
};
