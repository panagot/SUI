'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Moon, Sun, History } from 'lucide-react';
import TransactionDetails from '@/components/TransactionDetails';
import { fetchTransactionDetails } from '@/lib/suiClient';
import type { TransactionExplanation } from '@/types/transaction';

export default function Home() {
  const [digest, setDigest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<TransactionExplanation | null>(null);
  const [history, setHistory] = useState<TransactionExplanation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
  }, []);

  useEffect(() => {
    // Apply dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sui-dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sui-dark-mode', 'false');
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

  const handleNewTransaction = () => {
    setDigest('');
    setTransaction(null);
    setError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0 flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition"
              title="View history"
            >
              <History className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
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

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Transactions ({history.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((tx) => (
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
            <button
              onClick={() => {
                localStorage.removeItem('sui-tx-history');
                setHistory([]);
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

