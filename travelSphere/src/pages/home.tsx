import React, { useEffect, useState } from "react";

const Home: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [draft, setDraft] = useState<string>("");

    useEffect(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem("greet:name") : null;
        if (saved) {
            setName(saved);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed) return;
        setName(trimmed);
        localStorage.setItem("greet:name", trimmed);
    };

    const handleClear = () => {
        setName("");
        setDraft("");
        localStorage.removeItem("greet:name");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-rose-50 flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-8 border border-white/60">
                <header className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-semibold">
                        👋
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {name ? `Welcome back, ${name}!` : "Welcome!"}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {name ? "Glad to see you again. Ready to explore?" : "Tell me your name to get started."}
                        </p>
                    </div>
                </header>

                <main className="mt-6">
                    {name ? (
                        <div className="space-y-4">
                            <p className="text-slate-700">
                                Here's a friendly greeting just for you, {name}. Make yourself at home.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClear}
                                    className="px-4 py-2 rounded-md bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition"
                                >
                                    Clear name
                                </button>
                                <button
                                    onClick={() => alert(`Let's go, ${name}!`)}
                                    className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-3 flex gap-3">
                            <label htmlFor="name" className="sr-only">
                                Your name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Enter your name"
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                            >
                                Greet me
                            </button>
                        </form>
                    )}
                </main>

                <footer className="mt-6 text-xs text-slate-400">
                    Tip: Your name is saved locally in your browser.
                </footer>
            </div>
        </div>
    );
};

export default Home;