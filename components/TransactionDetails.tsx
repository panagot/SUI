import { Clock, User, Package, Coins, CheckCircle, XCircle, ArrowRight, Sparkles, RotateCw, Trash2, Archive, Copy, Download, Share2, Moon, Sun, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { TransactionExplanation } from '@/types/transaction';
import TransactionFlow from './TransactionFlow';
import TransactionTimeline from './TransactionTimeline';
import TransactionCategory from './TransactionCategory';
import GasEstimator from './GasEstimator';
import { useState } from 'react';

interface Props {
  transaction: TransactionExplanation;
}

export default function TransactionDetails({ transaction }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(transaction, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-${transaction.digest.slice(0, 8)}.json`;
    link.click();
  };

  const shareTransaction = () => {
    const url = `${window.location.origin}?tx=${transaction.digest}`;
    if (navigator.share) {
      navigator.share({
        title: 'Sui Transaction',
        text: `Check out this Sui transaction: ${transaction.digest.slice(0, 8)}...`,
        url: url,
      });
    } else {
      copyToClipboard(url, 'share');
    }
  };

  const getTransactionType = () => {
    if (transaction.objectChanges.some(c => c.type === 'transferred')) return 'Transfer';
    if (transaction.objectChanges.some(c => c.type === 'created')) return 'Create';
    if (transaction.objectChanges.some(c => c.type === 'mutated')) return 'Mutate';
    if (transaction.moveCall) return 'Move Call';
    return 'Transaction';
  };

  const getGasContext = () => {
    const total = parseFloat(transaction.gasUsed.totalCostSUI);
    if (total < 0.001) return { label: 'Very Cheap', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (total < 0.01) return { label: 'Cheap', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/20' };
    if (total < 0.1) return { label: 'Normal', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (total < 1) return { label: 'Expensive', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    return { label: 'Very Expensive', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  const openInExplorer = () => {
    const url = `https://suiscan.xyz/mainnet/tx/${transaction.digest}`;
    window.open(url, '_blank');
  };

  const toggleObjectExpansion = (objectId: string) => {
    const newExpanded = new Set(expandedObjects);
    if (newExpanded.has(objectId)) {
      newExpanded.delete(objectId);
    } else {
      newExpanded.add(objectId);
    }
    setExpandedObjects(newExpanded);
  };

  const exportToCSV = () => {
    const headers = ['Digest', 'Sender', 'Type', 'Summary', 'Gas Cost (SUI)', 'Timestamp'];
    const row = [
      transaction.digest,
      transaction.sender,
      getTransactionType(),
      transaction.summary,
      transaction.gasUsed.totalCostSUI,
      transaction.timestamp ? new Date(transaction.timestamp).toISOString() : '',
    ];
    
    const csv = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-${transaction.digest.slice(0, 8)}.csv`;
    link.click();
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'transferred': return <ArrowRight className="w-5 h-5" />;
      case 'created': return <Sparkles className="w-5 h-5" />;
      case 'mutated': return <RotateCw className="w-5 h-5" />;
      case 'deleted': return <Trash2 className="w-5 h-5" />;
      case 'wrapped': return <Archive className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-start gap-4 mb-6">
          {transaction.success ? (
            <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Transaction Summary
              </h2>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                {getTransactionType()}
              </span>
              <TransactionCategory transaction={transaction} />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {transaction.summary}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => copyToClipboard(transaction.digest, 'digest')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
          >
            <Copy className="w-4 h-4" />
            {copied === 'digest' ? 'Copied!' : 'Copy Digest'}
          </button>
          <button
            onClick={() => copyToClipboard(transaction.sender, 'sender')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
          >
            <Copy className="w-4 h-4" />
            {copied === 'sender' ? 'Copied!' : 'Copy Sender'}
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={shareTransaction}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg transition"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={openInExplorer}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition"
          >
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <User className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Sender</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {transaction.sender.slice(0, 8)}...{transaction.sender.slice(-6)}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(transaction.sender, 'sender-addr')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
              title="Copy full address"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {transaction.timestamp && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(transaction.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Timeline */}
      <TransactionTimeline transaction={transaction} />

      {/* Transaction Flow Visualization */}
      <TransactionFlow transaction={transaction} />

      {/* Actions */}
      {transaction.actions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            What Happened
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transaction.actions.map((action, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="p-2 bg-blue-500 rounded-lg text-white">
                  {getActionIcon(action.type)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {action.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description.split(' ').slice(1).join(' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Object Changes */}
      {transaction.objectChanges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Object Changes ({transaction.objectChanges.length})
          </h3>
          <div className="space-y-3">
            {transaction.objectChanges.map((change, idx) => {
              const isExpanded = expandedObjects.has(change.objectId || idx.toString());
              return (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      change.type === 'created' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      change.type === 'transferred' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      change.type === 'mutated' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {change.type}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {change.description}
                      </p>
                      {change.objectId && (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {change.objectId.slice(0, 8)}...{change.objectId.slice(-6)}
                          </p>
                          <button
                            onClick={() => copyToClipboard(change.objectId!, `obj-${idx}`)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                            title="Copy object ID"
                          >
                            <Copy className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    {change.objectId && (
                      <button
                        onClick={() => toggleObjectExpansion(change.objectId || idx.toString())}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>
                  {isExpanded && change.objectId && (
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Object ID:</span>
                          <p className="font-mono text-gray-900 dark:text-white break-all">{change.objectId}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Type:</span>
                          <p className="text-gray-900 dark:text-white">{change.objectType}</p>
                        </div>
                        {change.owner && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                            <p className="font-mono text-gray-900 dark:text-white">{change.owner}</p>
                          </div>
                        )}
                        <button
                          onClick={() => window.open(`https://suiscan.xyz/mainnet/object/${change.objectId}`, '_blank')}
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on Explorer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Move Call */}
      {transaction.moveCall && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-500" />
            Move Call
          </h3>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <p className="font-mono text-sm text-gray-900 dark:text-white mb-2">
              {transaction.moveCall.fullName}
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Package:</span>{' '}
                <span className="text-gray-900 dark:text-white">{transaction.moveCall.package}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Module:</span>{' '}
                <span className="text-gray-900 dark:text-white">{transaction.moveCall.module}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Function:</span>{' '}
                <span className="text-gray-900 dark:text-white">{transaction.moveCall.function}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gas Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            Gas Usage
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGasContext().bg} ${getGasContext().color}`}>
            {getGasContext().label}
          </span>
        </div>

        {/* Gas Estimator */}
        <div className="mb-6">
          <GasEstimator 
            cost={transaction.gasUsed.totalCostSUI} 
            transactionType={transaction.moveCall?.function || 'default'} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Computation</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {(Number(transaction.gasUsed.computationCost) / 1_000_000_000).toFixed(6)} SUI
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Storage Cost</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {(Number(transaction.gasUsed.storageCost) / 1_000_000_000).toFixed(6)} SUI
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Storage Rebate</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {(Number(transaction.gasUsed.storageRebate) / 1_000_000_000).toFixed(6)} SUI
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {transaction.gasUsed.totalCostSUI} SUI
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Digest */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Digest</p>
          <button
            onClick={() => copyToClipboard(transaction.digest, 'digest-full')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
        <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
          {transaction.digest}
        </p>
      </div>
    </div>
  );
}

