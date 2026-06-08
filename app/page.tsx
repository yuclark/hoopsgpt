"use client";

import { useChat, type UIMessage } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = [
    { text: "Shai Gilgeous-Alexander Profile", prompt: "Show me details about Shai Gilgeous-Alexander" },
    { text: "Nikola Jokic Advanced Stats", prompt: "Show me Nikola Jokic's advanced metrics" },
    { text: "Luka Doncic Seasons List", prompt: "Show me Luka Doncic's season by season metrics" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  // Helper to format simple markdown-like double stars and line breaks
  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 last:mb-0 leading-relaxed text-sm text-zinc-300">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={j} className="text-emerald-400 font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  const getPositionBadge = (pos: string | null) => {
    if (!pos) return null;
    const baseClass = "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-mono border ";
    switch (pos.toUpperCase()) {
      case 'PG':
        return <span className={`${baseClass} bg-sky-500/10 text-sky-400 border-sky-500/20`}>PG</span>;
      case 'SG':
        return <span className={`${baseClass} bg-indigo-500/10 text-indigo-400 border-indigo-500/20`}>SG</span>;
      case 'SF':
        return <span className={`${baseClass} bg-purple-500/10 text-purple-400 border-purple-500/20`}>SF</span>;
      case 'PF':
        return <span className={`${baseClass} bg-amber-500/10 text-amber-400 border-amber-500/20`}>PF</span>;
      case 'C':
        return <span className={`${baseClass} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>C</span>;
      default:
        return <span className={`${baseClass} bg-zinc-500/10 text-zinc-400 border-zinc-500/20`}>{pos}</span>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0d14] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Decorative Grid and Ambient Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-zinc-900 bg-[#0c101a]/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              hoopsgpt
            </h1>
            <p className="text-[11px] text-zinc-400 font-mono tracking-wider uppercase">
              AI Basketball-Reference Agent
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-400 font-mono">Neon DB Connected</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-5xl w-full mx-auto space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 pt-16">
            <div className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800/80 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-zinc-100">Welcome to hoopsgpt</h2>
              <p className="text-sm text-zinc-400">
                Ask about historical player metrics, regular season box scores, or advanced stats mapped from Basketball-Reference.
              </p>
            </div>

            <div className="w-full space-y-2.5 pt-4">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage({ text: s.prompt })}
                  className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl transition text-left group"
                >
                  <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100">{s.text}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {messages.map((message: UIMessage) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                  message.role === 'user'
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100'
                    : 'bg-[#0d121f]/90 border-zinc-900 text-zinc-300'
                }`}>
                  {/* Sender Label */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      {message.role === 'user' ? 'User' : 'hoopsgpt'}
                    </span>
                    {message.role !== 'user' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  {/* Message Parts Rendering */}
                  {message.parts.map((part, partIdx) => {
                    if (part.type === 'text') {
                      return (
                        <div key={partIdx} className="space-y-1">
                          {formatMessageText(part.text)}
                        </div>
                      );
                    }

                    if (part.type === 'tool-queryPlayerStats') {
                      const toolPart = part as any;
                      const { state, input: toolInput, output, errorText, toolCallId } = toolPart;

                      if (state === 'output-available') {
                        if (typeof output === 'string') {
                          return (
                            <div key={toolCallId} className="mt-3 p-3 bg-red-950/20 border border-red-800/40 rounded-xl text-red-400 text-xs font-mono">
                              ⚠️ {output}
                            </div>
                          );
                        }

                        const { player, seasons, advancedStats } = output;

                        return (
                          <div key={toolCallId} className="mt-4 p-4.5 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-4 shadow-inner">
                            {/* Profile Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-3 gap-2">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-sm font-bold text-zinc-50">{player.name}</h3>
                                  {getPositionBadge(player.position)}
                                </div>
                                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                                  Age: {player.age || 'N/A'} | Current Team: {player.currentTeam || 'N/A'}
                                </p>
                              </div>
                              <span className="self-start sm:self-auto px-2.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 rounded-full font-mono border border-emerald-500/20">
                                DB_FETCH_OK
                              </span>
                            </div>

                            {/* Regular Seasons Stats Table */}
                            {seasons && seasons.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">Regular Season History</span>
                                <div className="overflow-x-auto border border-zinc-900/60 rounded-lg">
                                  <table className="min-w-full text-[11px] text-zinc-300 font-mono">
                                    <thead>
                                      <tr className="bg-zinc-900/30 border-b border-zinc-900 text-zinc-500">
                                        <th className="py-1.5 px-3 text-left">Year</th>
                                        <th className="py-1.5 px-2 text-center">GP</th>
                                        <th className="py-1.5 px-2 text-center">MPG</th>
                                        <th className="py-1.5 px-2 text-center text-zinc-200 font-bold">PPG</th>
                                        <th className="py-1.5 px-2 text-center">APG</th>
                                        <th className="py-1.5 px-2 text-center">RPG</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900/50">
                                      {seasons.map((s: any) => (
                                        <tr key={s.id} className="hover:bg-zinc-900/40 transition-colors">
                                          <td className="py-1.5 px-3 font-semibold text-zinc-200">{s.seasonYear}</td>
                                          <td className="py-1.5 px-2 text-center text-zinc-400">{s.gamesPlayed ?? '-'}</td>
                                          <td className="py-1.5 px-2 text-center text-zinc-400">{s.minutesPerGame ? s.minutesPerGame.toFixed(1) : '-'}</td>
                                          <td className="py-1.5 px-2 text-center font-bold text-sky-400">{s.pointsPerGame ? s.pointsPerGame.toFixed(1) : '-'}</td>
                                          <td className="py-1.5 px-2 text-center text-zinc-300">{s.assistsPerGame ? s.assistsPerGame.toFixed(1) : '-'}</td>
                                          <td className="py-1.5 px-2 text-center text-zinc-300">{s.reboundsPerGame ? s.reboundsPerGame.toFixed(1) : '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Advanced Stats Metrics */}
                            {advancedStats && advancedStats.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Advanced Metrics</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {advancedStats.map((adv: any) => (
                                    <div key={adv.id} className="p-3 bg-zinc-900/30 border border-zinc-900/50 rounded-lg space-y-1.5 relative overflow-hidden group">
                                      {/* MVP Alert overlay for high PER */}
                                      {adv.playerEfficiencyRating && adv.playerEfficiencyRating >= 25 && (
                                        <div className="absolute -right-1.5 -top-1.5 text-amber-500/20 font-bold text-xs font-mono uppercase tracking-widest scale-75 group-hover:scale-95 transition-all">
                                          ★ ELITE
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                                        <span className="text-[10px] font-bold text-zinc-200 font-mono">{adv.seasonYear} Metrics</span>
                                        {adv.playerEfficiencyRating && adv.playerEfficiencyRating >= 25 && (
                                          <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded font-bold uppercase font-mono">
                                            MVP Tier
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono text-zinc-400">
                                        <div className="flex justify-between">
                                          <span>TS%:</span>
                                          <span className="text-zinc-200 font-bold">
                                            {adv.trueShootingPercentage ? `${(adv.trueShootingPercentage * 100).toFixed(1)}%` : '-'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>USG%:</span>
                                          <span className="text-zinc-200 font-bold">{adv.usagePercentage ? `${adv.usagePercentage}%` : '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>PER:</span>
                                          <span className="text-amber-400 font-bold">{adv.playerEfficiencyRating ?? '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>WS:</span>
                                          <span className="text-emerald-400 font-bold">{adv.winShares ?? '-'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } else if (state === 'output-error' || state === 'output-denied') {
                        return (
                          <div key={toolCallId} className="mt-3 p-3 bg-red-950/20 border border-red-800/40 rounded-xl text-red-400 text-xs font-mono">
                            ⚠️ {errorText || 'Database query failed.'}
                          </div>
                        );
                      } else {
                        return (
                          <div key={toolCallId} className="mt-3 p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl flex items-center space-x-2 text-zinc-400 text-xs font-mono">
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-emerald-400 animate-spin" />
                            <span>Database query: looking up "{toolInput?.playerName}" stats...</span>
                          </div>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Form at Bottom */}
      <div className="relative z-10 border-t border-zinc-900 bg-[#0c101a] py-4 px-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Quick Stats Pills above input (only shown when conversation has started) */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1 justify-center sm:justify-start">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage({ text: s.prompt })}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-[10px] text-zinc-400 hover:text-zinc-200 rounded-full transition font-medium"
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Ask hoopsgpt about player stats, shooting percentage, PER, win shares..."
              className="w-full bg-zinc-950 hover:bg-zinc-950/80 focus:bg-zinc-950 border border-zinc-800/80 focus:border-emerald-500/60 rounded-xl py-3.5 pl-4 pr-12 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 disabled:opacity-40 disabled:hover:bg-transparent disabled:border-transparent disabled:text-zinc-600 transition"
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-emerald-400 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7v11z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
