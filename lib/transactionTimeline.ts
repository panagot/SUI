// Transaction timeline generator - creates step-by-step breakdown

export interface TimelineStep {
  step: number;
  action: string;
  description: string;
  icon: string;
  details?: string[];
}

export function generateTimeline(
  moveCall?: string,
  objectChanges?: Array<{ type: string; objectType: string; description: string }>,
  gasUsed?: { totalCostSUI: string }
): TimelineStep[] {
  const steps: TimelineStep[] = [];
  let stepNum = 1;

  // Parse Move call for steps
  if (moveCall) {
    const moveCallLower = moveCall.toLowerCase();
    
    // Flashloan pattern
    if (moveCallLower.includes('flashloan') || moveCallLower.includes('borrow')) {
      steps.push({
        step: stepNum++,
        action: 'Borrow Flashloan',
        description: 'Borrowed assets for flashloan',
        icon: '⚡',
        details: ['Temporary borrowing without collateral'],
      });
    }

    // Swap pattern
    if (moveCallLower.includes('swap') || moveCallLower.includes('trade')) {
      steps.push({
        step: stepNum++,
        action: 'Execute Swap',
        description: 'Swapped tokens',
        icon: '🔄',
      });
    }

    // Liquidity operations
    if (moveCallLower.includes('liquidity') || moveCallLower.includes('add_liquidity')) {
      steps.push({
        step: stepNum++,
        action: 'Add Liquidity',
        description: 'Added liquidity to pool',
        icon: '💧',
      });
    }
    if (moveCallLower.includes('remove_liquidity')) {
      steps.push({
        step: stepNum++,
        action: 'Remove Liquidity',
        description: 'Removed liquidity from pool',
        icon: '💧',
      });
    }

    // Repay pattern
    if (moveCallLower.includes('repay') || moveCallLower.includes('return')) {
      steps.push({
        step: stepNum++,
        action: 'Repay Flashloan',
        description: 'Repaid borrowed assets',
        icon: '💳',
        details: ['Returned flashloan with interest'],
      });
    }

    // Mint pattern
    if (moveCallLower.includes('mint') || moveCallLower.includes('create')) {
      steps.push({
        step: stepNum++,
        action: 'Mint Assets',
        description: 'Created new assets',
        icon: '✨',
      });
    }
  }

  // Add object change steps
  if (objectChanges) {
    const transfers = objectChanges.filter(c => c.type === 'transferred');
    const created = objectChanges.filter(c => c.type === 'created');
    const mutated = objectChanges.filter(c => c.type === 'mutated');

    if (transfers.length > 0) {
      steps.push({
        step: stepNum++,
        action: 'Transfer Assets',
        description: `Transferred ${transfers.length} object${transfers.length > 1 ? 's' : ''}`,
        icon: '➡️',
        details: transfers.slice(0, 3).map(t => t.description),
      });
    }

    if (created.length > 0) {
      steps.push({
        step: stepNum++,
        action: 'Create Objects',
        description: `Created ${created.length} object${created.length > 1 ? 's' : ''}`,
        icon: '✨',
      });
    }

    if (mutated.length > 0 && !moveCall?.toLowerCase().includes('mutate')) {
      steps.push({
        step: stepNum++,
        action: 'Update State',
        description: `Modified ${mutated.length} object${mutated.length > 1 ? 's' : ''}`,
        icon: '🔄',
      });
    }
  }

  // Add gas payment step
  if (gasUsed && parseFloat(gasUsed.totalCostSUI) > 0) {
    steps.push({
      step: stepNum++,
      action: 'Pay Gas',
      description: `Paid ${gasUsed.totalCostSUI} SUI for gas`,
      icon: '⛽',
      details: ['Transaction finalized'],
    });
  }

  return steps;
}

