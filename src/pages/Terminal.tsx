import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { useWebSocket } from '../utils/WebContext';

function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xtermInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const ws = useWebSocket();

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const currentLineRef = useRef<string>('');

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
      theme: {
        background: '#09090b',
        foreground: '#e4e4e7',
        cursor: '#38bdf8',
        selectionBackground: '#334155',
        black: '#18181b',
        brightBlack: '#71717a',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#f4f4f5',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;
    xtermInstanceRef.current = terminal;

    terminal.open(terminalRef.current);
    fitAddon.fit();

    if (!ws || ws.status !== 'connected') {
      terminal.writeln('\x1b[33mConnecting to container terminal...\x1b[0m');
    } else {
      setConnected(true);
    }

    // Subscribe to incoming stream data from backend
    let unsubscribe: (() => void) | null = null;
    if (ws) {
      unsubscribe = ws.onTerminalOutput((data: string | ArrayBuffer) => {
        const text =
          typeof data === 'string'
            ? data
            : new TextDecoder().decode(data);
        terminal.write(text);
      });
    }

    // Handle user keyboard inputs in xterm
    const onDataDisposable = terminal.onData((data) => {
      if (!ws) return;

      // Enter key
      if (data === '\r') {
        const command = currentLineRef.current;
        terminal.write('\r\n');
        ws.sendTerminalCommand(command);

        if (command.trim().length > 0) {
          historyRef.current.push(command);
          historyIndexRef.current = historyRef.current.length;
        }

        currentLineRef.current = '';
      }
      // Backspace
      else if (data === '\x7f' || data === '\b') {
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          terminal.write('\b \b');
        }
      }
      // Ctrl+C
      else if (data === '\x03') {
        ws.sendTerminalCommand('\x03');
        terminal.write('^C\r\n');
        currentLineRef.current = '';
      }
      // Up Arrow (History Back)
      else if (data === '\x1b[A') {
        if (historyRef.current.length > 0 && historyIndexRef.current > 0) {
          historyIndexRef.current--;
          const prevCmd = historyRef.current[historyIndexRef.current] || '';
          // Clear current line on terminal
          while (currentLineRef.current.length > 0) {
            terminal.write('\b \b');
            currentLineRef.current = currentLineRef.current.slice(0, -1);
          }
          currentLineRef.current = prevCmd;
          terminal.write(prevCmd);
        }
      }
      // Down Arrow (History Forward)
      else if (data === '\x1b[B') {
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyIndexRef.current++;
          const nextCmd = historyRef.current[historyIndexRef.current] || '';
          while (currentLineRef.current.length > 0) {
            terminal.write('\b \b');
            currentLineRef.current = currentLineRef.current.slice(0, -1);
          }
          currentLineRef.current = nextCmd;
          terminal.write(nextCmd);
        } else if (historyIndexRef.current === historyRef.current.length - 1) {
          historyIndexRef.current = historyRef.current.length;
          while (currentLineRef.current.length > 0) {
            terminal.write('\b \b');
            currentLineRef.current = currentLineRef.current.slice(0, -1);
          }
        }
      }
      // Printable characters
      else if (data >= ' ' || data === '\t') {
        currentLineRef.current += data;
        terminal.write(data);
      }
    });

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      onDataDisposable.dispose();
      if (unsubscribe) unsubscribe();
      terminal.dispose();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      xtermInstanceRef.current = null;
      fitAddonRef.current = null;
    };
  }, [ws]);

  useEffect(() => {
    if (ws?.status === 'connected') {
      setConnected(true);
    } else {
      setConnected(false);
    }
  }, [ws?.status]);

  const clearTerminal = () => {
    if (xtermInstanceRef.current) {
      xtermInstanceRef.current.clear();
      currentLineRef.current = '';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#09090b] select-none">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs select-none flex-shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-zinc-300 text-[11px] tracking-wider uppercase">
            Terminal
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {connected ? 'sh (/app)' : 'connecting...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearTerminal}
            title="Clear Terminal Output"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 w-full p-2 overflow-hidden bg-[#09090b]">
        <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

export default TerminalComponent;
