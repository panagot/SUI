import { categorizeTransaction } from '@/lib/transactionCategorizer';
import type { TransactionExplanation } from '@/types/transaction';

interface Props {
  transaction: TransactionExplanation;
}

export default function TransactionCategory({ transaction }: Props) {
  const categoryInfo = categorizeTransaction(
    transaction.moveCall?.fullName,
    transaction.objectChanges
  );

  const getColorClass = () => {
    switch (categoryInfo.category) {
      case 'Swap':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'Transfer':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'Liquidity':
        return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700';
      case 'NFT Transfer':
      case 'NFT Mint':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700';
      case 'Flashloan':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'Staking':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'Governance':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getColorClass()}`}>
      <span className="text-lg">{categoryInfo.icon}</span>
      <div>
        <p className="font-semibold text-sm">{categoryInfo.category}</p>
        <p className="text-xs opacity-80">{categoryInfo.description}</p>
      </div>
    </div>
  );
}

