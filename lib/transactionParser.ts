import type { SuiTransactionBlockResponse } from '@mysten/sui/client';
import type { TransactionExplanation, Action, ObjectChange, GasInfo, MoveCallInfo, EventInfo } from '@/types/transaction';

export function parseTransactionBlock(txn: SuiTransactionBlockResponse): TransactionExplanation {
  const effects = txn.effects;
  const transaction = txn.transaction;
  
  if (!effects || !transaction) {
    throw new Error('Transaction data incomplete');
  }

  const sender = transaction.data.sender;
  const gasUsed = parseGasInfo(effects);
  const objectChanges = parseObjectChanges(txn.objectChanges || []);
  const actions = generateActions(objectChanges, txn);
  const moveCall = parseMoveCall(transaction.data.transaction);
  const events = parseEvents(txn.events || []);
  const summary = generateSummary(actions, objectChanges, moveCall, sender);

  const detailedExplanation = generateDetailedExplanation(actions, objectChanges, moveCall, gasUsed);
  const balanceChanges = parseBalanceChanges(txn.balanceChanges || []);
  const educationalContent = generateEducationalContent(moveCall, objectChanges, balanceChanges);

  return {
    digest: txn.digest,
    timestamp: txn.timestampMs ? Number(txn.timestampMs) : undefined,
    sender,
    summary,
    actions,
    objectChanges,
    gasUsed,
    moveCall,
    success: effects.status.status === 'success',
    events,
    detailedExplanation,
    balanceChanges,
    educationalContent,
  };
}

function parseGasInfo(effects: any): GasInfo {
  const gasUsed = effects.gasUsed;
  const computation = BigInt(gasUsed.computationCost || 0);
  const storage = BigInt(gasUsed.storageCost || 0);
  const rebate = BigInt(gasUsed.storageRebate || 0);
  const total = computation + storage - rebate;
  
  // Convert MIST to SUI (1 SUI = 1_000_000_000 MIST)
  const totalSUI = Number(total) / 1_000_000_000;

  return {
    computationCost: computation.toString(),
    storageCost: storage.toString(),
    storageRebate: rebate.toString(),
    totalCost: total.toString(),
    totalCostSUI: totalSUI.toFixed(6),
  };
}

function parseObjectChanges(changes: any[]): ObjectChange[] {
  return changes.map(change => {
    const changeType = change.type;
    let description = '';
    let objectType = 'Unknown';

    if (change.objectType) {
      objectType = formatObjectType(change.objectType);
    }

    // Enhanced descriptions with more context
    switch (changeType) {
      case 'created':
        if (objectType.includes('Coin')) {
          description = `Minted new ${objectType}`;
        } else if (objectType.includes('NFT')) {
          description = `Created new NFT: ${objectType}`;
        } else {
          description = `Created new ${objectType}`;
        }
        break;
      case 'mutated':
        if (objectType.includes('Coin')) {
          description = `Updated ${objectType} balance`;
        } else if (objectType.includes('Pool') || objectType.includes('LP')) {
          description = `Updated liquidity pool: ${objectType}`;
        } else {
          description = `Modified ${objectType}`;
        }
        break;
      case 'deleted':
        description = `Burned/destroyed ${objectType}`;
        break;
      case 'transferred':
        const recipient = formatAddress(change.recipient?.AddressOwner || change.recipient?.ObjectOwner || 'unknown');
        if (objectType.includes('Coin')) {
          description = `Sent ${objectType} to ${recipient}`;
        } else {
          description = `Transferred ${objectType} to ${recipient}`;
        }
        break;
      case 'wrapped':
        description = `Wrapped ${objectType} into NFT`;
        break;
      case 'published':
        description = `Deployed new smart contract package`;
        objectType = 'Smart Contract';
        break;
    }

    return {
      type: changeType,
      objectId: change.objectId,
      objectType,
      owner: change.owner?.AddressOwner || change.owner?.ObjectOwner,
      description,
    };
  });
}

function generateActions(objectChanges: ObjectChange[], txn: any): Action[] {
  const actions: Action[] = [];
  const actionMap = new Map<string, Action>();

  objectChanges.forEach(change => {
    let actionKey = change.type;
    let icon = '📦';
    let description = change.description;

    switch (change.type) {
      case 'transferred':
        icon = '➡️';
        break;
      case 'created':
        icon = '✨';
        break;
      case 'mutated':
        icon = '🔄';
        break;
      case 'deleted':
        icon = '🗑️';
        break;
      case 'wrapped':
        icon = '📦';
        break;
      case 'published':
        icon = '🚀';
        break;
    }

    if (!actionMap.has(actionKey)) {
      actionMap.set(actionKey, {
        type: actionKey,
        description,
        icon,
      });
    }
  });

  return Array.from(actionMap.values());
}

function parseMoveCall(transaction: any): MoveCallInfo | undefined {
  if (transaction.kind !== 'ProgrammableTransaction') {
    return undefined;
  }

  const txData = transaction;
  const commands = txData.transactions || [];

  for (const cmd of commands) {
    if (cmd.MoveCall) {
      const moveCall = cmd.MoveCall;
      return {
        package: formatAddress(moveCall.package),
        module: moveCall.module,
        function: moveCall.function,
        fullName: `${formatAddress(moveCall.package)}::${moveCall.module}::${moveCall.function}`,
      };
    }
  }

  return undefined;
}

function parseEvents(events: any[]): EventInfo[] {
  return events.map(event => {
    const type = formatObjectType(event.type);
    return {
      type,
      description: `Event: ${type}`,
    };
  });
}

function generateSummary(actions: Action[], objectChanges: ObjectChange[], moveCall?: MoveCallInfo, sender?: string): string {
  const parts: string[] = [];

  // Enhanced Move Call Analysis
  if (moveCall) {
    const protocolInfo = getProtocolInfo(moveCall);
    if (protocolInfo) {
      parts.push(protocolInfo.description);
    } else {
      parts.push(`Called ${moveCall.module}::${moveCall.function}`);
    }
  }

  // Enhanced Object Change Analysis
  const transfers = objectChanges.filter(c => c.type === 'transferred');
  const created = objectChanges.filter(c => c.type === 'created');
  const mutated = objectChanges.filter(c => c.type === 'mutated');

  // Analyze coin transfers for better descriptions
  const coinTransfers = objectChanges.filter(c => c.objectType.includes('Coin') && c.type === 'transferred');
  const coinMutations = objectChanges.filter(c => c.objectType.includes('Coin') && c.type === 'mutated');

  if (coinTransfers.length > 0) {
    const coinTypes = [...new Set(coinTransfers.map(c => c.objectType))];
    if (coinTypes.length === 1) {
      parts.push(`Transferred ${coinTypes[0]}`);
    } else if (coinTypes.length === 2) {
      parts.push(`Swapped ${coinTypes[0]} for ${coinTypes[1]}`);
    } else {
      parts.push(`Transferred ${coinTransfers.length} different tokens`);
    }
  } else if (coinMutations.length > 0) {
    const coinTypes = [...new Set(coinMutations.map(c => c.objectType))];
    if (coinTypes.length === 1) {
      parts.push(`Updated ${coinTypes[0]} balance`);
    } else {
      parts.push(`Updated ${coinMutations.length} token balances`);
    }
  } else {
    // Fallback to generic descriptions
    if (transfers.length > 0) {
      parts.push(`${transfers.length} object${transfers.length > 1 ? 's' : ''} transferred`);
    }

    if (created.length > 0) {
      parts.push(`${created.length} object${created.length > 1 ? 's' : ''} created`);
    }

    if (mutated.length > 0) {
      parts.push(`${mutated.length} object${mutated.length > 1 ? 's' : ''} modified`);
    }
  }

  if (parts.length === 0) {
    return 'Transaction executed successfully';
  }

  return parts.join(', ');
}

function getProtocolInfo(moveCall: MoveCallInfo): { description: string; protocol: string } | null {
  const fullName = moveCall.fullName.toLowerCase();
  const moduleName = moveCall.module.toLowerCase();
  const functionName = moveCall.function.toLowerCase();

  // Popular SUI DEXs and Protocols
  if (fullName.includes('cetus') || fullName.includes('0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb')) {
    return { description: 'Cetus DEX swap transaction', protocol: 'Cetus' };
  }
  
  if (fullName.includes('turbos') || fullName.includes('0x5d1f470ea021f4e281a4561a42ebbb0c11bf5af967f81b51814cd6c6b31d0f6')) {
    return { description: 'Turbos Finance transaction', protocol: 'Turbos' };
  }
  
  if (fullName.includes('kriya') || fullName.includes('0xa0eba10b173538c8fecca1dff298e4883971085b')) {
    return { description: 'Kriya DEX transaction', protocol: 'Kriya' };
  }
  
  if (fullName.includes('flowx') || fullName.includes('0x7e8e8b0b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b')) {
    return { description: 'FlowX Finance transaction', protocol: 'FlowX' };
  }
  
  if (fullName.includes('aftermath') || fullName.includes('0xab4b92c1cbb4e3475a8a5a2a2a2a2a2a2a2a2a2a2')) {
    return { description: 'Aftermath Finance transaction', protocol: 'Aftermath' };
  }

  // Common SUI operations
  if (functionName.includes('swap') || functionName.includes('exchange')) {
    return { description: 'Token swap transaction', protocol: 'DEX' };
  }
  
  if (functionName.includes('stake') || functionName.includes('delegate')) {
    return { description: 'Staking transaction', protocol: 'Staking' };
  }
  
  if (functionName.includes('mint') || functionName.includes('create')) {
    return { description: 'Token minting transaction', protocol: 'Token' };
  }
  
  if (functionName.includes('transfer') || functionName.includes('send')) {
    return { description: 'Token transfer transaction', protocol: 'Transfer' };
  }

  return null;
}

function formatObjectType(type: string): string {
  // Extract the simple name from fully qualified type
  // e.g., "0x2::coin::Coin<0x2::sui::SUI>" -> "SUI Coin"
  
  if (type.includes('::coin::Coin')) {
    const match = type.match(/::coin::Coin<.*::(\w+)::(\w+)>/);
    if (match) {
      const tokenName = match[2];
      return `${getTokenDisplayName(tokenName)} Coin`;
    }
    return 'Coin';
  }

  // Handle LP tokens and complex types
  if (type.includes('LP') || type.includes('lp')) {
    const lpMatch = type.match(/LP[_\s]*(\w+)[_\s](\w+)/i);
    if (lpMatch) {
      return `LP Token (${lpMatch[1]}-${lpMatch[2]})`;
    }
  }

  // Handle generic types like Pool<X, Y>
  if (type.includes('<')) {
    const genericMatch = type.match(/(\w+)<.*>/);
    if (genericMatch) {
      return genericMatch[1];
    }
  }

  const parts = type.split('::');
  if (parts.length >= 3) {
    let name = parts[parts.length - 1].split('<')[0];
    
    // Clean up common patterns
    name = name.replace(/_/g, ' ');
    name = name.replace(/\b(\w)/g, (char) => char.toUpperCase());
    
    return name;
  }

  return type;
}

function getTokenDisplayName(tokenName: string): string {
  // Popular SUI tokens mapping
  const tokenMap: { [key: string]: string } = {
    'SUI': 'SUI',
    'USDC': 'USDC',
    'USDT': 'USDT',
    'WETH': 'WETH',
    'WBTC': 'WBTC',
    'CETUS': 'CETUS',
    'TURBOS': 'TURBOS',
    'KRIYA': 'KRIYA',
    'FLOWX': 'FLOWX',
    'AFTERMATH': 'AFTERMATH',
    'LOFI': 'LOFI',
    'BUCK': 'BUCK',
    'NAVX': 'NAVX',
    'HAY': 'HAY',
    'DEEP': 'DEEP',
    'MOVE': 'MOVE',
    'FUD': 'FUD',
    'BONK': 'BONK',
    'PEPE': 'PEPE',
    'DOGE': 'DOGE',
    'SHIB': 'SHIB',
  };

  return tokenMap[tokenName.toUpperCase()] || tokenName;
}

function generateDetailedExplanation(actions: Action[], objectChanges: ObjectChange[], moveCall?: MoveCallInfo, gasUsed?: GasInfo): string {
  const explanations: string[] = [];
  
  // Protocol-specific explanations
  if (moveCall) {
    const protocolInfo = getProtocolInfo(moveCall);
    if (protocolInfo) {
      switch (protocolInfo.protocol) {
        case 'Cetus':
          explanations.push("You interacted with Cetus, a leading DEX on Sui that provides efficient token swaps with low slippage and competitive rates.");
          break;
        case 'Turbos':
          explanations.push("You used Turbos Finance, a concentrated liquidity DEX on Sui that offers capital-efficient trading with customizable price ranges.");
          break;
        case 'Kriya':
          explanations.push("You traded on Kriya, a decentralized exchange on Sui that focuses on providing the best execution for your trades.");
          break;
        case 'FlowX':
          explanations.push("You interacted with FlowX Finance, a DeFi protocol on Sui offering various financial services and trading opportunities.");
          break;
        case 'Aftermath':
          explanations.push("You used Aftermath Finance, a comprehensive DeFi platform on Sui that aggregates liquidity from multiple sources.");
          break;
        case 'DEX':
          explanations.push("You performed a token swap on a decentralized exchange. This allows you to trade one token for another without needing a centralized intermediary.");
          break;
        case 'Staking':
          explanations.push("You staked your tokens to earn rewards. Staking helps secure the network while providing you with passive income.");
          break;
        case 'Token':
          explanations.push("You minted new tokens. This could be creating a new token or minting additional supply of an existing token.");
          break;
        case 'Transfer':
          explanations.push("You transferred tokens to another address. This is a simple peer-to-peer transaction on the Sui blockchain.");
          break;
      }
    }
  }

  // Object change explanations
  const coinChanges = objectChanges.filter(c => c.objectType.includes('Coin'));
  const transfers = objectChanges.filter(c => c.type === 'transferred');
  const mutations = objectChanges.filter(c => c.type === 'mutated');

  if (transfers.length > 0 && coinChanges.length > 0) {
    const coinTypes = [...new Set(coinChanges.map(c => c.objectType))];
    if (coinTypes.length === 2) {
      explanations.push(`You swapped ${coinTypes[0]} for ${coinTypes[1]}. This transaction involved exchanging one type of token for another at the current market rate.`);
    } else if (coinTypes.length === 1) {
      explanations.push(`You transferred ${coinTypes[0]} to another address. The tokens have been moved from your wallet to the recipient's wallet.`);
    }
  } else if (mutations.length > 0 && coinChanges.length > 0) {
    explanations.push("Your token balances were updated. This typically happens when you receive tokens, make a purchase, or when your staking rewards are distributed.");
  }

  // Gas efficiency explanation
  if (gasUsed) {
    const totalCost = parseFloat(gasUsed.totalCostSUI);
    if (totalCost < 0) {
      explanations.push("Great news! You actually earned SUI from this transaction due to storage rebates. Sui's unique gas model can reward users when they free up storage space.");
    } else if (totalCost < 0.001) {
      explanations.push("This transaction was very cost-effective, costing less than $0.01. Sui's efficient architecture keeps transaction costs low for users.");
    } else {
      explanations.push(`This transaction cost ${gasUsed.totalCostSUI} SUI in gas fees. The cost covers computation and storage, with any storage rebates deducted from the total.`);
    }
  }

  if (explanations.length === 0) {
    explanations.push("This transaction was executed successfully on the Sui blockchain. All operations completed as intended.");
  }

  return explanations.join(' ');
}

function parseBalanceChanges(balanceChanges: any[]): any[] {
  return balanceChanges.map(change => {
    const coinType = formatObjectType(change.coinType);
    const amount = BigInt(change.amount);
    const amountSUI = Number(amount) / 1_000_000_000; // Convert MIST to SUI
    
    return {
      owner: change.owner?.AddressOwner || change.owner?.ObjectOwner,
      coinType,
      amount: amount.toString(),
      amountSUI: amountSUI.toFixed(6),
      changeType: amount > BigInt(0) ? 'increase' : 'decrease',
      usdValue: calculateUSDValue(coinType, Math.abs(amountSUI)),
    };
  });
}

function calculateUSDValue(coinType: string, amount: number): string {
  // Mock USD prices for popular SUI tokens (in a real app, you'd fetch from an API)
  const prices: { [key: string]: number } = {
    'SUI Coin': 2.50,
    'USDC Coin': 1.00,
    'USDT Coin': 1.00,
    'WETH Coin': 3500.00,
    'WBTC Coin': 65000.00,
    'CETUS Coin': 0.15,
    'TURBOS Coin': 0.05,
    'KRIYA Coin': 0.25,
    'FLOWX Coin': 0.10,
    'LOFI Coin': 0.02,
    'BUCK Coin': 1.00,
    'NAVX Coin': 0.30,
    'HAY Coin': 1.00,
    'DEEP Coin': 0.08,
    'MOVE Coin': 0.12,
    'FUD Coin': 0.001,
    'BONK Coin': 0.00002,
    'PEPE Coin': 0.000001,
    'DOGE Coin': 0.08,
    'SHIB Coin': 0.00001,
  };

  const price = prices[coinType] || 0;
  const usdValue = amount * price;
  
  if (usdValue < 0.01) {
    return '< $0.01';
  } else if (usdValue < 1) {
    return `$${usdValue.toFixed(3)}`;
  } else if (usdValue < 1000) {
    return `$${usdValue.toFixed(2)}`;
  } else {
    return `$${(usdValue / 1000).toFixed(2)}K`;
  }
}

function generateEducationalContent(moveCall?: MoveCallInfo, objectChanges?: ObjectChange[], balanceChanges?: any[]): string[] {
  const content: string[] = [];

  // Protocol-specific educational content
  if (moveCall) {
    const protocolInfo = getProtocolInfo(moveCall);
    if (protocolInfo) {
      switch (protocolInfo.protocol) {
        case 'Cetus':
          content.push("💡 Cetus is a leading DEX on Sui that uses concentrated liquidity. This means liquidity providers can focus their capital on specific price ranges, leading to better capital efficiency and lower slippage for traders.");
          break;
        case 'Turbos':
          content.push("💡 Turbos Finance uses concentrated liquidity similar to Uniswap V3. This allows for more efficient use of capital and better price discovery compared to traditional constant product AMMs.");
          break;
        case 'Kriya':
          content.push("💡 Kriya is designed for optimal trade execution on Sui. It aggregates liquidity from multiple sources to provide the best possible prices for your trades.");
          break;
        case 'FlowX':
          content.push("💡 FlowX Finance offers a comprehensive DeFi suite on Sui, including trading, lending, and yield farming opportunities.");
          break;
        case 'Aftermath':
          content.push("💡 Aftermath Finance aggregates liquidity from multiple DEXs on Sui, ensuring you get the best possible execution for your trades across the entire ecosystem.");
          break;
      }
    }
  }

  // Balance change educational content
  if (balanceChanges && balanceChanges.length > 0) {
    const totalValue = balanceChanges.reduce((sum, change) => {
      const usdValue = parseFloat(change.usdValue.replace(/[$,K]/g, '')) || 0;
      return sum + (change.changeType === 'increase' ? usdValue : -usdValue);
    }, 0);

    if (totalValue > 0) {
      content.push("💰 Your portfolio value increased from this transaction. This could be from trading profits, staking rewards, or receiving tokens.");
    } else if (totalValue < 0) {
      content.push("📉 Your portfolio value decreased from this transaction. This is normal for trades, fees, or when sending tokens to others.");
    }
  }

  // SUI-specific educational content
  if (objectChanges && objectChanges.some(c => c.objectType.includes('LP'))) {
    content.push("🔄 Liquidity Pool (LP) tokens represent your share in a trading pool. When you provide liquidity, you earn fees from trades that happen in that pool.");
  }

  if (objectChanges && objectChanges.some(c => c.type === 'created')) {
    content.push("✨ Creating new objects on Sui is gas-efficient. The network's object-centric model makes it easy to create and manage digital assets.");
  }

  // Gas efficiency education
  content.push("⚡ Sui's gas model is unique - you can earn SUI from storage rebates when you delete objects, making some transactions actually profitable!");

  return content;
}

function formatAddress(address: string): string {
  if (address.length > 20) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
}

