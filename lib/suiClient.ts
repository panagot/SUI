import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import type { TransactionExplanation } from '@/types/transaction';
import { parseTransactionBlock } from './transactionParser';

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

export async function fetchTransactionDetails(digest: string): Promise<TransactionExplanation> {
  try {
    const txn = await client.getTransactionBlock({
      digest,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    return parseTransactionBlock(txn);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw new Error('Transaction not found. Please check the digest and try again.');
  }
}

export { client };

