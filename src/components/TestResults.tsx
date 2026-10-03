import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Play,
  FileCode,
} from 'lucide-react';
import { useWebSocket, type TestSuiteResult, type TestAssertion } from '../utils/WebContext';

export const TestResults: React.FC = () => {
  const ws = useWebSocket();
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({});

  if (!ws) return null;

  const { testResults, isSubmitting, submitProblem } = ws;

  const toggleTest = (key: string) => {
    setExpandedTests((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isSubmitting) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-zinc-950">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Play className="w-5 h-5 text-blue-400 absolute inset-0 m-auto" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">
          Running Tests in Container...
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs font-mono">
          Executing Vitest runner on your submission against the challenge test suite.
        </p>
      </div>
    );
  }

  if (!testResults) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-zinc-950">
        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
          <Play className="w-5 h-5 text-zinc-500" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">
          No Test Results Yet
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mb-4">
          Write your solution in the editor and click "Run Tests" to evaluate your code.
        </p>
        <button
          onClick={submitProblem}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-all duration-150 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Tests Now</span>
        </button>
      </div>
    );
  }

  const passedCount = testResults.numPassedTests ?? 0;
  const failedCount = testResults.numFailedTests ?? 0;
  const totalCount = testResults.numTotalTests ?? (passedCount + failedCount);
  const isAllPassed = failedCount === 0 && totalCount > 0;

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-200 select-none overflow-hidden">
      {/* Top Banner / Summary */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between flex-shrink-0 ${
          isAllPassed
            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
            : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isAllPassed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <span>{isAllPassed ? 'All Tests Passed' : 'Tests Failed'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isAllPassed
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {passedCount} / {totalCount} Passed
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isAllPassed
                ? 'Your code passed all automated test specifications!'
                : `${failedCount} assertion(s) failed. Check details below.`}
            </p>
          </div>
        </div>

        <button
          onClick={submitProblem}
          title="Re-run tests"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 text-zinc-400" />
          <span>Rerun</span>
        </button>
      </div>

      {/* Test Suites and Assertions list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {testResults.testResults?.map((suite: TestSuiteResult, sIdx: number) => {
          const suiteName = suite.name.split('/app/').pop() || suite.name;
          return (
            <div
              key={sIdx}
              className="border border-zinc-800/90 rounded-lg bg-zinc-900/40 overflow-hidden"
            >
              {/* Suite Header */}
              <div className="px-3 py-2 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono text-zinc-300">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold">{suiteName}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                    suite.status === 'passed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {suite.status}
                </span>
              </div>

              {/* Assertion items */}
              <div className="divide-y divide-zinc-800/60">
                {suite.assertionResults?.map((assertion: TestAssertion, aIdx: number) => {
                  const key = `${sIdx}-${aIdx}`;
                  const isExpanded = expandedTests[key] ?? assertion.status === 'failed';
                  const hasFailure =
                    assertion.status === 'failed' &&
                    assertion.failureMessages &&
                    assertion.failureMessages.length > 0;

                  return (
                    <div key={aIdx} className="p-2.5 hover:bg-zinc-900/30 transition-colors">
                      <div
                        onClick={() => hasFailure && toggleTest(key)}
                        className={`flex items-start justify-between gap-2 ${
                          hasFailure ? 'cursor-pointer' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          {assertion.status === 'passed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs text-zinc-200 font-medium">
                              {assertion.title || assertion.fullName}
                            </div>
                            {assertion.ancestorTitles && assertion.ancestorTitles.length > 0 && (
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                {assertion.ancestorTitles.join(' > ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {assertion.duration !== undefined && (
                            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {assertion.duration}ms
                            </span>
                          )}
                          {hasFailure && (
                            <span className="text-zinc-500">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Failure Message & Diff View */}
                      {hasFailure && isExpanded && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
                          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-semibold mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Assertion Error / Failure Details:</span>
                          </div>
                          {assertion.failureMessages?.map((msg: string, mIdx: number) => (
                            <pre
                              key={mIdx}
                              className="p-2.5 rounded bg-zinc-950/90 border border-rose-900/30 text-rose-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-text leading-relaxed"
                            >
                              {msg}
                            </pre>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
