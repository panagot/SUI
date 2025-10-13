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

    switch (changeType) {
      case 'created':
        description = `Created ${objectType}`;
        break;
      case 'mutated':
        description = `Modified ${objectType}`;
        break;
      case 'deleted':
        description = `Deleted ${objectType}`;
        break;
      case 'transferred':
        const recipient = formatAddress(change.recipient?.AddressOwner || change.recipient?.ObjectOwner || 'unknown');
        description = `Transferred ${objectType} to ${recipient}`;
        break;
      case 'wrapped':
        description = `Wrapped ${objectType}`;
        break;
      case 'published':
        description = `Published package`;
        objectType = 'Package';
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
        actionKey = 'transfer';
        icon = '➡️';
        break;
      case 'created':
        actionKey = 'create';
        icon = '✨';
        break;
      case 'mutated':
        actionKey = 'mutate';
        icon = '🔄';
        break;
      case 'deleted':
        actionKey = 'delete';
        icon = '🗑️';
        break;
      case 'wrapped':
        actionKey = 'wrap';
        icon = '📦';
        break;
      case 'published':
        actionKey = 'publish';
        icon = '🚀';
        break;
    }

    if (!actionMap.has(actionKey)) {
      actionMap.set(actionKey, {
        type: actionKey as any,
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

  if (moveCall) {
    parts.push(`Called ${moveCall.module}::${moveCall.function}`);
  }

  const transfers = objectChanges.filter(c => c.type === 'transferred');
  const created = objectChanges.filter(c => c.type === 'created');
  const mutated = objectChanges.filter(c => c.type === 'mutated');

  if (transfers.length > 0) {
    parts.push(`${transfers.length} object${transfers.length > 1 ? 's' : ''} transferred`);
  }

  if (created.length > 0) {
    parts.push(`${created.length} object${created.length > 1 ? 's' : ''} created`);
  }

  if (mutated.length > 0) {
    parts.push(`${mutated.length} object${mutated.length > 1 ? 's' : ''} modified`);
  }

  if (parts.length === 0) {
    return 'Transaction executed successfully';
  }

  return parts.join(', ');
}

function formatObjectType(type: string): string {
  // Extract the simple name from fully qualified type
  // e.g., "0x2::coin::Coin<0x2::sui::SUI>" -> "Coin<SUI>"
  
  if (type.includes('::coin::Coin')) {
    const match = type.match(/::coin::Coin<.*::(\w+)::(\w+)>/);
    if (match) {
      return `${match[2]} Coin`;
    }
    return 'Coin';
  }

  const parts = type.split('::');
  if (parts.length >= 3) {
    return parts[parts.length - 1].split('<')[0];
  }

  return type;
}

function formatAddress(address: string): string {
  if (address.length > 20) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
}

