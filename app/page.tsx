'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Moon, Sun, History, TrendingUp, Filter, XCircle, ArrowRight, Lightbulb } from 'lucide-react';
import TransactionDetails from '@/components/TransactionDetails';
import { fetchTransactionDetails, client } from '@/lib/suiClient';
import type { TransactionExplanation } from '@/types/transaction';

export default function Home() {
  const [digest, setDigest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<TransactionExplanation | null>(null);
  const [history, setHistory] = useState<TransactionExplanation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [recentTxs, setRecentTxs] = useState<string[]>([]);
  const [showRecentFeed, setShowRecentFeed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [showWhySection, setShowWhySection] = useState(false);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('sui-tx-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('sui-dark-mode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Fetch recent transactions
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      const result = await client.queryTransactionBlocks({
        limit: 10,
        order: 'descending',
      });
      setRecentTxs(result.data.map(tx => tx.digest));
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error);
    }
  };

  useEffect(() => {
    // Apply dark mode class
    console.log('Dark mode changed to:', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sui-dark-mode', 'true');
      console.log('Added dark class to html element');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sui-dark-mode', 'false');
      console.log('Removed dark class from html element');
    }
  }, [darkMode]);

  const handleExplain = async () => {
    if (!digest.trim()) {
      setError('Please enter a transaction digest');
      return;
    }

    setLoading(true);
    setError('');
    setTransaction(null);

    try {
      const result = await fetchTransactionDetails(digest.trim());
      setTransaction(result);
      
      // Save to history
      const newHistory = [result, ...history.filter(h => h.digest !== result.digest)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('sui-tx-history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (tx: TransactionExplanation) => {
    setDigest(tx.digest);
    setTransaction(tx);
    setShowHistory(false);
  };

  const loadFromRecent = async (digest: string) => {
    setDigest(digest);
    setLoading(true);
    setError('');
    setTransaction(null);

    try {
      const result = await fetchTransactionDetails(digest);
      setTransaction(result);
      
      // Save to history
      const newHistory = [result, ...history.filter(h => h.digest !== result.digest)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('sui-tx-history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
    } finally {
      setLoading(false);
      setShowRecentFeed(false);
    }
  };

  const filteredHistory = history.filter(tx => 
    tx.digest.toLowerCase().includes(searchFilter.toLowerCase()) ||
    tx.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
    tx.sender.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleNewTransaction = () => {
    setDigest('');
    setTransaction(null);
    setError('');
  };

  const toggleDarkMode = () => {
    console.log('Toggling dark mode, current:', darkMode);
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      {/* Professional Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4DA2FF] to-[#011829] rounded-xl flex items-center justify-center shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Sui droplet-inspired design */}
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" opacity="0.1"/>
                    <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" fill="white" opacity="0.2"/>
                    <path d="M12 6C8.69 6 6 8.69 6 12s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="white" opacity="0.3"/>
                    <path d="M12 8C9.79 8 8 9.79 8 12s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="white" opacity="0.4"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                    <circle cx="12" cy="12" r="1.5" fill="#4DA2FF"/>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  SUI Explorer
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Making Transactions Easy to Read
                </p>
              </div>
            </div>
            
            {/* Premium Search in Header */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={digest}
                    onChange={(e) => setDigest(e.target.value)}
                    placeholder="Enter transaction digest..."
                    className="w-full p-4 pl-12 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:border-slate-300 dark:group-hover:border-slate-500"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <button
                  onClick={handleExplain}
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span className="font-semibold">Analyze</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowRecentFeed(!showRecentFeed);
                  if (!showRecentFeed) fetchRecentTransactions();
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
                title="Recent transactions"
              >
                <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent</span>
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
                title="View history"
              >
                <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">History</span>
              </button>
              <button
                onClick={() => setShowWhySection(!showWhySection)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/40 dark:to-indigo-900/40 hover:from-blue-200 dark:hover:from-blue-900/60 rounded-xl transition-all duration-200 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md"
                title="Why we built this"
              >
                <span className="text-blue-600 dark:text-blue-400 text-lg">💡</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-3 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
                title="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Why We Built This Section */}
          {showWhySection && (
            <div className="mb-8 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/50 dark:border-blue-800/50 shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
                    💡
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Why We Built This
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Making SUI transactions accessible to everyone
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWhySection(false)}
                  className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50 dark:border-red-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 text-lg">❌</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">The Problem</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Current SUI explorers show raw blockchain data that&apos;s overwhelming and technical. New users struggle to understand what their transactions actually do, creating a barrier to ecosystem adoption.
                  </p>
                </div>
                
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Our Solution</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    We built SUI Explorer to make transactions easy to read and understand for everyone. Our platform translates complex blockchain data into plain English explanations with visual flows and educational content.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Feed Panel */}
          {showRecentFeed && recentTxs.length > 0 && (
            <div className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                Latest on SUI ({recentTxs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTxs.map((digest) => (
                  <button
                    key={digest}
                    onClick={() => loadFromRecent(digest)}
                    className="text-left p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100/80 hover:to-indigo-100/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-2xl transition-all duration-300 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:scale-105"
                  >
                    <p className="font-mono text-xs text-blue-600 dark:text-blue-400 mb-2">
                      {digest.slice(0, 12)}...
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                      Click to analyze
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History Panel */}
          {showHistory && history.length > 0 && (
            <div className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <History className="w-6 h-6 text-blue-500" />
                  Your History ({history.length})
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search..."
                      className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-slate-700 dark:text-white"
                    />
                    <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
              {filteredHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHistory.map((tx) => (
                    <button
                      key={tx.digest}
                      onClick={() => loadFromHistory(tx)}
                      className="text-left p-4 bg-slate-50/80 dark:bg-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-700 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {tx.digest.slice(0, 12)}...
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white font-medium line-clamp-2">
                        {tx.summary}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {new Date(tx.timestamp || 0).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No transactions found matching &ldquo;{searchFilter}&rdquo;
                </p>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem('sui-tx-history');
                  setHistory([]);
                  setSearchFilter('');
                }}
                className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Clear History
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Example Section */}
          {!transaction && (
            <div className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Try these examples to see how it works:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setDigest('BmvEixM4ku5Rm819NZ1HETkUvZKr8uS45LR6P1DGcPtV')}
                  className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100/80 hover:to-indigo-100/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-2xl transition-all duration-300 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                      🔄
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">Recent Transaction</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Click to analyze a real SUI transaction
                  </p>
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Or get one from <a href="https://suiscan.xyz/mainnet/home" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Sui Explorer</a>
              </p>
            </div>
          )}

          {/* Results */}
          {transaction && (
            <div className="space-y-8">
              <TransactionDetails transaction={transaction} />
              
              <div className="text-center">
                <button
                  onClick={handleNewTransaction}
                  className="px-8 py-4 bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300/80 dark:hover:bg-slate-600/80 text-slate-800 dark:text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 backdrop-blur-sm"
                >
                  Analyze Another Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Made with ❤️ for the SUI community
          </p>
        </div>
      </footer>
    </div>
  );
}

