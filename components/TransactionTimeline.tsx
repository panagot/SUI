import { CheckCircle } from 'lucide-react';
import { generateTimeline } from '@/lib/transactionTimeline';
import type { TransactionExplanation } from '@/types/transaction';

interface Props {
  transaction: TransactionExplanation;
}

export default function TransactionTimeline({ transaction }: Props) {
  const timeline = generateTimeline(
    transaction.moveCall?.fullName,
    transaction.objectChanges,
    transaction.gasUsed
  );

  if (timeline.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Transaction Timeline
      </h3>
      <div className="space-y-4">
        {timeline.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* Step Number */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                {step.step}
              </div>
              {index < timeline.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{step.icon}</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {step.action}
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {step.description}
              </p>
              {step.details && step.details.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  {step.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

