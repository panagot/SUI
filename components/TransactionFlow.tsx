import { ArrowRight } from 'lucide-react';
import type { TransactionExplanation } from '@/types/transaction';

interface Props {
  transaction: TransactionExplanation;
}

export default function TransactionFlow({ transaction }: Props) {
  const transfers = transaction.objectChanges.filter(c => c.type === 'transferred');
  
  if (transfers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Transaction Flow
      </h3>
      
      <div className="space-y-4">
        {transfers.map((transfer, idx) => {
          const sender = transaction.sender;
          const recipient = transfer.owner || 'Unknown';
          
          return (
            <div key={idx} className="flex items-center gap-4">
              {/* Sender */}
              <div className="flex-1 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                <p className="text-xs opacity-80 mb-1">From</p>
                <p className="font-mono text-sm font-semibold">
                  {sender.slice(0, 6)}...{sender.slice(-4)}
                </p>
              </div>

              {/* Arrow with object info */}
              <div className="flex flex-col items-center gap-2">
                <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                    {transfer.objectType}
                  </p>
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400" />
              </div>

              {/* Recipient */}
              <div className="flex-1 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                <p className="text-xs opacity-80 mb-1">To</p>
                <p className="font-mono text-sm font-semibold">
                  {recipient.length > 10 
                    ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}`
                    : recipient
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Sender</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Recipient</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Object Type</span>
          </div>
        </div>
      </div>
    </div>
  );
}

