// Gas price estimator - provides context about transaction costs

export interface GasEstimate {
  cost: number;
  category: 'very_cheap' | 'cheap' | 'normal' | 'expensive' | 'very_expensive';
  comparison: string;
  tip?: string;
}

// Average gas costs for different transaction types (in SUI)
const AVERAGE_GAS_COSTS: Record<string, number> = {
  'transfer': 0.001,
  'swap': 0.01,
  'liquidity': 0.015,
  'nft_mint': 0.005,
  'nft_transfer': 0.001,
  'flashloan': 0.02,
  'default': 0.01,
};

export function estimateGasCost(cost: number, transactionType: string): GasEstimate {
  const avgCost = AVERAGE_GAS_COSTS[transactionType] || AVERAGE_GAS_COSTS.default;
  const ratio = cost / avgCost;

  let category: GasEstimate['category'];
  let comparison: string;
  let tip: string | undefined;

  if (cost < 0.001) {
    category = 'very_cheap';
    comparison = `Extremely cheap (${(ratio * 100).toFixed(0)}% of average)`;
    tip = 'Great gas efficiency!';
  } else if (cost < 0.01) {
    category = 'cheap';
    comparison = `Cheap (${(ratio * 100).toFixed(0)}% of average)`;
    tip = 'Good gas usage';
  } else if (ratio < 1.5) {
    category = 'normal';
    comparison = `Normal (${(ratio * 100).toFixed(0)}% of average)`;
  } else if (ratio < 3) {
    category = 'expensive';
    comparison = `Expensive (${(ratio * 100).toFixed(0)}% of average)`;
    tip = 'Consider batching transactions to save gas';
  } else {
    category = 'very_expensive';
    comparison = `Very expensive (${(ratio * 100).toFixed(0)}% of average)`;
    tip = 'This transaction used significantly more gas than typical. Check for optimization opportunities.';
  }

  return {
    cost,
    category,
    comparison,
    tip,
  };
}

