export interface TransactionExplanation {
  digest: string;
  timestamp?: number;
  sender: string;
  summary: string;
  actions: Action[];
  objectChanges: ObjectChange[];
  gasUsed: GasInfo;
  moveCall?: MoveCallInfo;
  success: boolean;
  events?: EventInfo[];
  detailedExplanation?: string;
  balanceChanges?: BalanceChange[];
  educationalContent?: string[];
}

export interface BalanceChange {
  owner?: string;
  coinType: string;
  amount: string;
  amountSUI: string;
  changeType: 'increase' | 'decrease';
  usdValue: string;
}

export interface Action {
  type: 'transferred' | 'created' | 'mutated' | 'deleted' | 'wrapped' | 'published';
  description: string;
  icon: string;
}

export interface ObjectChange {
  type: 'created' | 'mutated' | 'deleted' | 'transferred' | 'wrapped' | 'published';
  objectId?: string;
  objectType: string;
  owner?: string;
  description: string;
}

export interface GasInfo {
  computationCost: string;
  storageCost: string;
  storageRebate: string;
  totalCost: string;
  totalCostSUI: string;
}

export interface MoveCallInfo {
  package: string;
  module: string;
  function: string;
  fullName: string;
}

export interface EventInfo {
  type: string;
  description: string;
}

