import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { API_URL } from "../Constant";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Invalid credentials");
            }

            if (data.access_token) {
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("token", data.access_token);
            }
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            navigate("/challenges");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">
            {/* Header */}
            <header className="h-11 border-b border-zinc-800/90 bg-zinc-900/90 backdrop-blur px-4 flex items-center justify-between flex-shrink-0 select-none">
                <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/20">
                        <Code className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight text-white">
                        DevForces
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        to="/signup"
                        className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1"
                    >
                        Don't have an account? <span className="text-blue-400 font-medium">Sign up</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2">
                            <Code className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                            Welcome back
                        </h1>
                        <p className="text-xs text-zinc-400">
                            Enter your credentials to access your DevForces account
                        </p>
                    </div>

                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-zinc-300">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="developer@example.com"
                                        className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-zinc-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Log In</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-xs text-zinc-400">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-blue-400 hover:underline font-medium">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
