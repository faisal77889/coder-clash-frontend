import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Markdown from 'react-markdown';
import { BookOpen } from "lucide-react";
import { API_URL } from "../Constant";


const RenderProblem = () => {
    const { challengeId } = useParams();
    const [problem, setProblem] = useState<any>(null);

    useEffect(() => {
        fetch(`${API_URL}/challenge?challengeId=${challengeId}`)
            .then((res) => res.json())
            .then((data) => {
                setProblem(data);
            })
            .catch((err) => {
                console.error("Error fetching challenge:", err);
            });
    }, []);

    const getDifficultyBadge = (level: string = "medium") => {
        const normalized = level?.toLowerCase();
        if (normalized === "easy") {
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        }
        if (normalized === "hard") {
            return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        }
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    };

    return (
        <div className="h-full flex flex-col bg-zinc-900/60 text-zinc-200 select-none overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/80 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase truncate">
                        {problem?.title || "Description"}
                    </span>
                </div>
                {problem?.difficulty_level && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide shrink-0 ${getDifficultyBadge(problem.difficulty_level)}`}>
                        {problem.difficulty_level}
                    </span>
                )}
            </div>

            {/* Markdown Content Area */}
            <div className="flex-1 overflow-y-auto p-4 select-text">
                {problem?.description ? (
                    <Markdown
                        components={{
                            h1: ({ children }) => (
                                <h1 className="text-base font-bold text-zinc-100 pb-2 border-b border-zinc-800 mb-3">
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-4 mb-2 pb-1 border-b border-zinc-800/60">
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-xs font-semibold text-zinc-200 mt-3 mb-1.5">
                                    {children}
                                </h3>
                            ),
                            p: ({ children }) => (
                                <p className="text-xs text-zinc-300 leading-relaxed mb-2.5">
                                    {children}
                                </p>
                            ),
                            ul: ({ children }) => (
                                <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300 mb-3 pl-1">
                                    {children}
                                </ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-300 mb-3 pl-1">
                                    {children}
                                </ol>
                            ),
                            li: ({ children }) => (
                                <li className="text-xs text-zinc-300 leading-relaxed">
                                    {children}
                                </li>
                            ),
                            pre: ({ children }) => (
                                <pre className="bg-zinc-950/90 border border-zinc-800 rounded-md p-3 overflow-x-auto my-2.5 text-xs font-mono text-zinc-200">
                                    {children}
                                </pre>
                            ),
                            code: ({ className, children, ...props }: any) => {
                                const isBlock = className || (typeof children === 'string' && children.includes('\n'));
                                if (!isBlock) {
                                    return (
                                        <code className="bg-zinc-800/90 text-blue-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-zinc-700/40" {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                                return (
                                    <code className="text-xs font-mono text-zinc-200" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            strong: ({ children }) => (
                                <strong className="font-semibold text-zinc-100">
                                    {children}
                                </strong>
                            ),
                            hr: () => <hr className="border-zinc-800 my-3" />,
                        }}
                    >
                        {problem.description}
                    </Markdown>
                ) : (
                    <div className="text-xs text-zinc-500">Loading challenge...</div>
                )}
            </div>
        </div>
    );
};

export default RenderProblem;