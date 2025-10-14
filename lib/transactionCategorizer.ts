// Transaction categorizer - automatically categorizes transactions

export type TransactionCategory = 
  | 'Transfer'
  | 'Swap'
  | 'Liquidity'
  | 'NFT Transfer'
  | 'NFT Mint'
  | 'Flashloan'
  | 'Staking'
  | 'Governance'
  | 'Custom Move Call'
  | 'Other';

export interface TransactionCategoryInfo {
  category: TransactionCategory;
  confidence: number;
  description: string;
  icon: string;
}

export function categorizeTransaction(
  moveCall?: string,
  objectChanges?: Array<{ type: string; objectType: string }>
): TransactionCategoryInfo {
  const moveCallLower = moveCall?.toLowerCase() || '';
  const objectTypes = objectChanges?.map(c => c.objectType.toLowerCase()).join(' ') || '';

  // Check for specific patterns
  if (moveCallLower.includes('swap') || moveCallLower.includes('trade')) {
    return {
      category: 'Swap',
      confidence: 0.9,
      description: 'Token swap or trade',
      icon: '🔄',
    };
  }

  if (moveCallLower.includes('flashloan') || moveCallLower.includes('borrow_flashloan')) {
    return {
      category: 'Flashloan',
      confidence: 0.95,
      description: 'Flashloan transaction',
      icon: '⚡',
    };
  }

  if (moveCallLower.includes('liquidity') || moveCallLower.includes('add_liquidity') || moveCallLower.includes('remove_liquidity')) {
    return {
      category: 'Liquidity',
      confidence: 0.9,
      description: 'Liquidity pool operation',
      icon: '💧',
    };
  }

  if (objectTypes.includes('nft') || moveCallLower.includes('nft')) {
    if (moveCallLower.includes('mint') || moveCallLower.includes('create')) {
      return {
        category: 'NFT Mint',
        confidence: 0.85,
        description: 'NFT minting',
        icon: '✨',
      };
    }
    return {
      category: 'NFT Transfer',
      confidence: 0.85,
      description: 'NFT transfer',
      icon: '🖼️',
    };
  }

  if (moveCallLower.includes('stake') || moveCallLower.includes('unstake')) {
    return {
      category: 'Staking',
      confidence: 0.85,
      description: 'Staking operation',
      icon: '🔒',
    };
  }

  if (moveCallLower.includes('vote') || moveCallLower.includes('proposal')) {
    return {
      category: 'Governance',
      confidence: 0.85,
      description: 'Governance action',
      icon: '🗳️',
    };
  }

  const hasTransfer = objectChanges?.some(c => c.type === 'transferred');
  if (hasTransfer && objectChanges && objectChanges.length <= 3) {
    return {
      category: 'Transfer',
      confidence: 0.8,
      description: 'Simple token transfer',
      icon: '➡️',
    };
  }

  if (moveCall) {
    return {
      category: 'Custom Move Call',
      confidence: 0.7,
      description: 'Custom Move function call',
      icon: '⚙️',
    };
  }

  return {
    category: 'Other',
    confidence: 0.5,
    description: 'Unknown transaction type',
    icon: '📦',
  };
}

