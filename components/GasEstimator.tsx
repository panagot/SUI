import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { estimateGasCost } from '@/lib/gasEstimator';

interface Props {
  cost: string;
  transactionType: string;
}

export default function GasEstimator({ cost, transactionType }: Props) {
  const estimate = estimateGasCost(parseFloat(cost), transactionType);

  const getIcon = () => {
    switch (estimate.category) {
      case 'very_cheap':
      case 'cheap':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      case 'very_expensive':
      case 'expensive':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (estimate.category) {
      case 'very_cheap':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'cheap':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'normal':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'expensive':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'very_expensive':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getBgColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            Gas Efficiency Analysis
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {estimate.comparison}
          </p>
          {estimate.tip && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
              💡 {estimate.tip}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

