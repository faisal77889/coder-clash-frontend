import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Code,
  Search,
  Shuffle,
  Terminal,
  ArrowRight,
  X,
  User,
  LogOut,
  Layers,
} from "lucide-react";
import { API_URL } from "../Constant";

interface Challenge {
  id: number;
  title: string;
  description: string;
  packages?: string;
  difficulty_level: string;
}

type DifficultyFilter = "all" | "easy" | "medium" | "hard";

const Challenges = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>("all");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserEmail(parsed.email || parsed.username || null);
      }
    } catch {
      // Ignore json parse error
    }

    setLoading(true);
    fetch(`${API_URL}/challenge`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data)) {
          setChallenges(data);
        } else if (data && Array.isArray(data.challenges)) {
          setChallenges(data.challenges);
        }
      })
      .catch((err) => {
        console.error("Error fetching challenges:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getPackageTags = (pkgStr?: string): string[] => {
    if (!pkgStr) return [];
    try {
      const parsed = JSON.parse(pkgStr);
      if (parsed.dependencies && typeof parsed.dependencies === "object") {
        return Object.keys(parsed.dependencies).slice(0, 4);
      }
    } catch {
      if (typeof pkgStr === "string" && !pkgStr.trim().startsWith("{")) {
        return pkgStr
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 4);
      }
    }
    return [];
  };

  const getCleanDescription = (desc?: string) => {
    if (!desc) return "Complete the challenge requirements and make all test suites pass.";
    // Clean markdown headings, bullets, code fences
    const cleaned = desc
      .replace(/```[\s\S]*?```/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => l.replace(/^[-*]\s*/, ""))
      .join(" ");

    return cleaned || "Complete the challenge requirements and make all test suites pass.";
  };

  // Difficulty counts
  const counts = useMemo(() => {
    const easy = challenges.filter(
      (c) => (c.difficulty_level || "").toLowerCase() === "easy"
    ).length;
    const medium = challenges.filter(
      (c) => (c.difficulty_level || "").toLowerCase() === "medium"
    ).length;
    const hard = challenges.filter(
      (c) => (c.difficulty_level || "").toLowerCase() === "hard"
    ).length;
    return {
      all: challenges.length,
      easy,
      medium,
      hard,
    };
  }, [challenges]);

  // Filtered challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchesDifficulty =
        selectedDifficulty === "all" ||
        (c.difficulty_level || "medium").toLowerCase() === selectedDifficulty;

      if (!matchesDifficulty) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = c.title.toLowerCase().includes(q);
      const inDesc = c.description.toLowerCase().includes(q);
      const inPkg = (c.packages || "").toLowerCase().includes(q);

      return inTitle || inDesc || inPkg;
    });
  }, [challenges, selectedDifficulty, searchQuery]);

  // Pick random challenge
  const handlePickRandom = () => {
    const pool = filteredChallenges.length > 0 ? filteredChallenges : challenges;
    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    navigate(`/challenge/${pool[randomIndex].id}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="h-14 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Code className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              DevForces
            </span>
          </Link>
          <span className="text-zinc-600 text-sm">/</span>
          <span className="text-xs font-medium text-zinc-400">Challenges</span>
        </div>

        <div className="flex items-center gap-3">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-xs text-zinc-300">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-[11px] truncate max-w-[180px]">
                {userEmail}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-lg hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/60 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Problem Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Coding Challenges
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Solve hands-on backend and system design problems. Write code in the
              integrated editor and run automated test suites in isolated sandboxes.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Total:</span>
              <span className="font-mono font-semibold text-zinc-100">{counts.all}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-emerald-400">{counts.easy}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-mono text-amber-400">{counts.medium}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="font-mono text-rose-400">{counts.hard}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Difficulty Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
            <button
              onClick={() => setSelectedDifficulty("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDifficulty === "all"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setSelectedDifficulty("easy")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDifficulty === "easy"
                  ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-emerald-400"
              }`}
            >
              Easy ({counts.easy})
            </button>
            <button
              onClick={() => setSelectedDifficulty("medium")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDifficulty === "medium"
                  ? "bg-amber-950/70 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-amber-400"
              }`}
            >
              Medium ({counts.medium})
            </button>
            <button
              onClick={() => setSelectedDifficulty("hard")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                selectedDifficulty === "hard"
                  ? "bg-rose-950/70 text-rose-300 border border-rose-500/30"
                  : "text-zinc-400 hover:text-rose-400"
              }`}
            >
              Hard ({counts.hard})
            </button>
          </div>

          {/* Search Box & Random Action */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-md sm:justify-end">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by title, description, or stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-12 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700/60">
                  /
                </kbd>
              )}
            </div>

            <button
              onClick={handlePickRandom}
              title="Pick a random challenge"
              disabled={challenges.length === 0}
              className="h-9 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shuffle className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Random</span>
            </button>
          </div>
        </div>

        {/* Challenges List */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-5 bg-zinc-800 rounded-md" />
                    <div className="w-48 h-5 bg-zinc-800 rounded-md" />
                    <div className="w-16 h-5 bg-zinc-800 rounded-full" />
                  </div>
                  <div className="w-3/4 h-4 bg-zinc-850 rounded" />
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 h-5 bg-zinc-800/60 rounded" />
                    <div className="w-16 h-5 bg-zinc-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 text-center">
              <Terminal className="w-9 h-9 text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300">No challenges found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                {searchQuery || selectedDifficulty !== "all"
                  ? "No challenges match your current search criteria or difficulty filter."
                  : "Connecting to server or no challenges are currently in the database."}
              </p>
              {(searchQuery || selectedDifficulty !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDifficulty("all");
                  }}
                  className="mt-4 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredChallenges.map((challenge) => {
                const packageTags = getPackageTags(challenge.packages);
                const diff = (challenge.difficulty_level || "medium").toLowerCase();

                let diffBadge = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                let diffDot = "bg-amber-400";
                if (diff === "easy") {
                  diffBadge = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                  diffDot = "bg-emerald-400";
                } else if (diff === "hard") {
                  diffBadge = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                  diffDot = "bg-rose-400";
                }

                return (
                  <div
                    key={challenge.id}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200 gap-4 shadow-sm"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Top Meta Line: ID, Difficulty, Stack Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                          #{challenge.id.toString().padStart(2, "0")}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${diffBadge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${diffDot}`} />
                          {challenge.difficulty_level || "Medium"}
                        </span>

                        {packageTags.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            {packageTags.map((pkg) => (
                              <span
                                key={pkg}
                                className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/40 text-[11px] font-mono text-zinc-400"
                              >
                                {pkg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                        <Link to={`/challenge/${challenge.id}`}>
                          {challenge.title}
                        </Link>
                      </h2>

                      {/* Description Preview */}
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 max-w-3xl">
                        {getCleanDescription(challenge.description)}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                      <Link
                        to={`/challenge/${challenge.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 group-hover:shadow-blue-600/30 transition-all cursor-pointer"
                      >
                        <span>Solve Challenge</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <div className="flex items-center gap-2">
            <span>DevForces</span>
            <span>•</span>
            <span>Interactive Web Workspace & Test Engine</span>
          </div>
          <div>
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-[10px] font-mono text-zinc-300">/</kbd> to focus search
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Challenges;