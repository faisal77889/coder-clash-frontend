import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

function TerminalComponent() {
  const terminalRef = useRef(null);
  const terminal = useRef(null);
  const fitAddon = useRef(null);

  useEffect(() => {
    // Initialize terminal
    terminal.current = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
      fontSize: 14,
      rows: 20,
      cols: 80,
    });

    // Fit addon for responsive sizing
    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);

    // Mount terminal
    terminal.current.open(terminalRef.current);
    fitAddon.current.fit();

    // Write welcome message
    terminal.current.writeln('Welcome to React Terminal');
    terminal.current.writeln('Type something...');
    terminal.current.write('$ ');

    // Handle user input
    let inputBuffer = '';
    terminal.current.onKey((e) => {
      const char = e.key;
      
      // Enter key
      if (char === '\r') {
        terminal.current.writeln('');
        if (inputBuffer.trim() === 'clear') {
          terminal.current.clear();
        } else if (inputBuffer.trim() === 'help') {
          terminal.current.writeln('Commands: clear, help, echo [text]');
        } else if (inputBuffer.trim().startsWith('echo ')) {
          const message = inputBuffer.trim().substring(5);
          terminal.current.writeln(message);
        } else if (inputBuffer.trim()) {
          terminal.current.writeln(`Command not found: ${inputBuffer}`);
        }
        inputBuffer = '';
        terminal.current.write('$ ');
        return;
      }

      // Backspace
      if (char === '\x7f') {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          terminal.current.write('\b \b');
        }
        return;
      }

      // Regular character
      inputBuffer += char;
      terminal.current.write(char);
    });

    // Cleanup
    return () => {
      terminal.current.dispose();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ padding: '20px', background: '#1e1e1e' }}>
      <div ref={terminalRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
}

export default TerminalComponent;