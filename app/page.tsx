'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Moon, Sun, History, TrendingUp, Filter } from 'lucide-react';
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0 flex gap-2">
            <button
              onClick={() => {
                setShowRecentFeed(!showRecentFeed);
                if (!showRecentFeed) fetchRecentTransactions();
              }}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition"
              title="Recent transactions"
            >
              <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition"
              title="View history"
            >
              <History className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition"
              title="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sui Transaction Explainer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Understand what happened in any Sui transaction
          </p>
        </div>

        {/* Recent Feed Panel */}
        {showRecentFeed && recentTxs.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Latest on Sui ({recentTxs.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentTxs.map((digest) => (
                <button
                  key={digest}
                  onClick={() => loadFromRecent(digest)}
                  className="text-left p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-lg transition border border-blue-200 dark:border-blue-800"
                >
                  <p className="font-mono text-xs text-blue-600 dark:text-blue-400 mb-1">
                    {digest.slice(0, 12)}...
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    Click to analyze
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Your History ({history.length})
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search..."
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  />
                  <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            {filteredHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredHistory.map((tx) => (
                  <button
                    key={tx.digest}
                    onClick={() => loadFromHistory(tx)}
                    className="text-left p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {tx.digest.slice(0, 12)}...
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2">
                      {tx.summary}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(tx.timestamp || 0).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No transactions found matching "{searchFilter}"
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

        {/* Search Box */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={digest}
                onChange={(e) => setDigest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleExplain()}
                placeholder="Enter transaction digest (hash)..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleExplain}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Explain
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Example hashes */}
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p className="font-semibold mb-2">Try a real example:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDigest('BmvEixM4ku5Rm819NZ1HETkUvZKr8uS45LR6P1DGcPtV')}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Recent Transaction
              </button>
            </div>
            <p className="mt-2 text-xs">Or get one from <a href="https://suiscan.xyz/mainnet/home" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Sui Explorer</a></p>
          </div>
        </div>

        {/* Results */}
        {transaction && (
          <div className="space-y-6">
            <TransactionDetails transaction={transaction} />
            
            <div className="text-center">
              <button
                onClick={handleNewTransaction}
                className="px-8 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-xl transition"
              >
                Explain Another Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

