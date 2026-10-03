import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FileSidebar from "./FileSidebar";
import MonacoEditor from "./MonacoEditor";
import TerminalComponent from "./Terminal";
import RenderProblem from "./RenderProblem";
import { TestResults } from "../components/TestResults";
import { WebsocketProvider, useWebSocket } from "../utils/WebContext";
import {
  Code,
  BookOpen,
  FolderTree,
  CheckCircle2,
  XCircle,
  Play,
  Save,
  AlertCircle,
  Terminal as TerminalIcon,
  Layers,
} from "lucide-react";

type SidebarTab = "problem" | "files" | "tests";
type BottomTab = "terminal" | "tests";

const WorkspaceView = () => {
  const ws = useWebSocket();
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("problem");
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal");

  // Keyboard shortcut Ctrl+Enter to run tests
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (ws && !ws.isSubmitting) {
          ws.submitProblem();
          setBottomTab("tests");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ws]);

  // When test results come in, auto switch bottom tab to tests if wanted
  useEffect(() => {
    if (ws?.testResults) {
      setBottomTab("tests");
    }
  }, [ws?.testResults]);

  const handleRunTests = () => {
    if (!ws || ws.isSubmitting) return;
    ws.submitProblem();
    setBottomTab("tests");
  };

  const isConnected = ws?.status === "connected";
  const isConnecting = ws?.status === "connecting";
  const isDirty = (ws?.dirtyFiles?.size ?? 0) > 0;

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* Top Navigation / App Header */}
      <header className="h-12 border-b border-zinc-800/90 bg-zinc-900/90 backdrop-blur px-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/20">
              <Code className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              DevForces
            </span>
          </Link>
          <span className="text-zinc-600 text-sm">/</span>
          <Link
            to="/challenges"
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Challenges</span>
          </Link>
        </div>

        {/* Center / Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Save All Button */}
          <button
            onClick={() => ws?.saveAllFiles()}
            disabled={!isDirty}
            title="Save all changes (Ctrl+S)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isDirty
                ? "bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 cursor-pointer shadow-sm"
                : "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Run Tests / Submit Button */}
          <button
            onClick={handleRunTests}
            disabled={ws?.isSubmitting || !isConnected}
            title="Run challenge test suite (Ctrl+Enter)"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              ws?.isSubmitting
                ? "bg-blue-600/50 text-blue-200 cursor-wait"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
            }`}
          >
            {ws?.isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{ws?.isSubmitting ? "Running Tests..." : "Run Tests"}</span>
          </button>

          {/* Test Status Pill if results exist */}
          {ws?.testResults && (
            <div
              onClick={() => setBottomTab("tests")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                ws.testResults.numFailedTests === 0
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {ws.testResults.numFailedTests === 0 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              <span>
                {ws.testResults.numPassedTests}/
                {ws.testResults.numTotalTests} Passed
              </span>
            </div>
          )}
        </div>

        {/* Right Status & Profile */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status Indicator */}
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              isConnected
                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                : isConnecting
                ? "bg-amber-950/40 border-amber-800/40 text-amber-400"
                : "bg-rose-950/40 border-rose-800/40 text-rose-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? "bg-emerald-400 animate-pulse"
                  : isConnecting
                  ? "bg-amber-400 animate-ping"
                  : "bg-rose-400"
              }`}
            />
            {isConnected
              ? "Container Ready"
              : isConnecting
              ? "Spinning Container..."
              : "Disconnected"}
          </span>

          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.reload();
            }}
            className="text-xs text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Error Banner if any */}
      {ws?.error && (
        <div className="px-4 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{ws.error}</span>
        </div>
      )}

      {/* Main IDE Workspace */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Icon Rail */}
        <div className="w-12 border-r border-zinc-800/80 h-full bg-zinc-900/80 flex flex-col items-center py-3 gap-2.5 flex-shrink-0 select-none">
          <button
            type="button"
            onClick={() => setSidebarTab("problem")}
            title="Problem Description"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              sidebarTab === "problem"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSidebarTab("files");
              ws?.refreshFolder("/app");
            }}
            title="File Explorer"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              sidebarTab === "files"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <FolderTree className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSidebarTab("tests")}
            title="Test Results"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              sidebarTab === "tests"
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {ws?.testResults && (
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  ws.testResults.numFailedTests === 0
                    ? "bg-emerald-400"
                    : "bg-rose-400"
                }`}
              />
            )}
          </button>
        </div>

        {/* Left Drawer Content */}
        <div className="w-[420px] min-w-[280px] max-w-[500px] flex-shrink-0 border-r border-zinc-800/80 bg-zinc-900/40 flex flex-col h-full overflow-hidden">
          {sidebarTab === "problem" && <RenderProblem />}
          {sidebarTab === "files" && <FileSidebar />}
          {sidebarTab === "tests" && <TestResults />}
        </div>

        {/* Right Area: Monaco Editor (Top) & Terminal/Tests (Bottom) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-zinc-950">
          {/* Monaco Editor Section */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <MonacoEditor />
          </div>

          {/* Bottom Pane (Terminal & Test Results Tabs) */}
          <div className="h-64 min-h-[160px] max-h-[48vh] flex-shrink-0 border-t border-zinc-800/90 flex flex-col bg-zinc-950">
            {/* Bottom Tab Bar */}
            <div className="flex items-center justify-between px-3 bg-zinc-900 border-b border-zinc-800 text-xs select-none flex-shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBottomTab("terminal")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors border-b-2 cursor-pointer ${
                    bottomTab === "terminal"
                      ? "border-blue-500 text-zinc-100 bg-zinc-950/40"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terminal</span>
                </button>

                <button
                  onClick={() => setBottomTab("tests")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors border-b-2 cursor-pointer ${
                    bottomTab === "tests"
                      ? "border-blue-500 text-zinc-100 bg-zinc-950/40"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Test Results</span>
                  {ws?.testResults && (
                    <span
                      className={`text-[10px] px-1 rounded ${
                        ws.testResults.numFailedTests === 0
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {ws.testResults.numPassedTests}/
                      {ws.testResults.numTotalTests}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="flex-1 min-h-0 w-full overflow-hidden">
              {bottomTab === "terminal" ? (
                <TerminalComponent />
              ) : (
                <TestResults />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Homepage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!challengeId) {
      navigate("/challenges");
      return;
    }
  }, [challengeId, navigate]);

  if (!challengeId) {
    return null;
  }

  return (
    <WebsocketProvider challengeId={challengeId}>
      <WorkspaceView />
    </WebsocketProvider>
  );
};

export default Homepage;
