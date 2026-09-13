import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Code, Sparkles, Trophy, ArrowRight, Terminal, Flame, Layers } from "lucide-react";
import { API_URL } from "../Constant";

interface Challenge {
    id: number;
    title: string;
    description: string;
    packages?: string;
    difficulty_level: string;
}

const Challenges = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/challenge`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setChallenges(data);
                } else if (data && Array.isArray(data.challenges)) {
                    setChallenges(data.challenges);
                }
            })
            .catch((err) => {
                console.error("Error fetching challenges:", err);
            });
    }, []);

    const getDifficultyBadge = (level: string = "medium") => {
        const normalized = level.toLowerCase();
        if (normalized === "easy") {
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        }
        if (normalized === "hard") {
            return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        }
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">
            {/* Top Navigation / App Header */}
            <header className="h-11 border-b border-zinc-800/90 bg-zinc-900/90 backdrop-blur px-4 flex items-center justify-between flex-shrink-0 select-none sticky top-0 z-50">
                <div className="flex items-center gap-2.5">
                    <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/20">
                            <Code className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold text-sm tracking-tight text-white">
                            DevForces
                        </span>
                    </Link>
                    <span className="text-zinc-600 text-sm">/</span>
                    <span className="text-xs font-medium text-zinc-400">Challenges</span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-[11px] text-zinc-300 font-medium">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Online
                    </span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
                {/* Hero / Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-800/80">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>System Architecture & Backend Challenges</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
                            Coding Challenges
                        </h1>
                        <p className="text-sm text-zinc-400 max-w-xl">
                            Solve hands-on real world engineering challenges, implement production-grade protocols, and test your skills live in the browser workspace.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                            <Layers className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Total Challenges: <strong className="text-zinc-200">{challenges.length}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Challenges List */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-400 px-2 select-none">
                        <span>All Available Challenges</span>
                        <span>{challenges.length} results</span>
                    </div>

                    {challenges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 text-center">
                            <Terminal className="w-8 h-8 text-zinc-600 mb-3" />
                            <h3 className="text-sm font-semibold text-zinc-300">No challenges found</h3>
                            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                                Connecting to challenge server or loading problems...
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {challenges.map((challenge) => (
                                <div
                                    key={challenge.id}
                                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 gap-4"
                                >
                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/40 text-xs font-mono font-semibold text-zinc-300 shrink-0">
                                            #{challenge.id}
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-sm font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
                                                    {challenge.title}
                                                </h2>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide shrink-0 ${getDifficultyBadge(
                                                        challenge.difficulty_level
                                                    )}`}
                                                >
                                                    {challenge.difficulty_level || "Medium"}
                                                </span>
                                            </div>

                                            <p className="text-xs text-zinc-400 line-clamp-1 max-w-2xl font-mono">
                                                {challenge.description
                                                    ? challenge.description.split("\n")[0].replace(/^#+\s*/, "")
                                                    : "Challenge details and requirements"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                        {challenge.packages && (
                                            <span className="hidden md:inline-flex text-[11px] text-zinc-500 font-mono">
                                                {challenge.packages}
                                            </span>
                                        )}
                                        <Link
                                            to={`/challenge/${challenge.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-all duration-150 group-hover:shadow-blue-500/20 cursor-pointer"
                                        >
                                            <span>Solve Challenge</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Challenges;