import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Terminal as TerminalIcon } from 'lucide-react';
import { useWebSocket } from '../utils/WebContext';

function TerminalComponent() {
  const terminalRef = useRef(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const websocket = useWebSocket(); 
  
  useEffect(() => {
    
    if (!terminalRef.current) return;
    
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
      theme: {
        background: '#121214',
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
    if(!websocket){
      terminal.write("Failed to connect to server");
      console.log("Failed to connect");
      return;
    };
    
    const fitAddon = new FitAddon();
    
    terminal.loadAddon(fitAddon);
    
    fitAddonRef.current = fitAddon;
    
    
    
    
    terminal.open(terminalRef.current)
    fitAddon.fit()
    terminal.write("Type something to get terminal access")
    terminal.writeln("");
    
    
    terminal.write("$ ");
    websocket.binaryType = "arraybuffer";

    websocket.onmessage = (event) => {
      console.log("the type of data is  ", typeof (event.data));
      console.log("event data is ", event.data)
      const text = typeof event.data === 'string'
        ? event.data
        : new TextDecoder().decode(event.data);
      terminal.write(text);
      terminal.writeln("");
      terminal.write("$ ")
    }


    let commandInput = "";

    terminal.onData((data) => {
      if (data == "\r") { // enter
        console.log(commandInput)
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(commandInput);
        }
        terminal.writeln("")

        commandInput = ""
        terminal.write('$ ');
      } else if (data == '\x7f') {  // backspace
        if (commandInput.length > 0) {
          commandInput.slice(0, -1)
          terminal.write('\b \b');
        }
      }
      else {

        terminal.write(data)
        commandInput += data
      }
      // console.log(data)
    })

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }


    return () => {
      terminal.dispose();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      terminalRef.current = null;
      fitAddonRef.current = null;
      fitAddonRef.current = null;
    }

  }, [websocket])





  return (
    <div className="flex flex-col h-full w-full bg-[#121214] select-none">
      {/* Terminal Tab / Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-zinc-300 text-[11px] tracking-wider uppercase">
            Terminal
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            bash
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          <span>node v20.x</span>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 w-full p-2 overflow-hidden bg-[#121214]">
        <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

export default TerminalComponent;
