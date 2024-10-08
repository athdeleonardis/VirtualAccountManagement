import { AccountAmountMap, TAccountMap, TVirtualAccountMap } from "../Account/VirtualAccount.js";

export enum ELedgerLineType {
  Addition = "Addition",
  Subtraction = "Subtraction",
  Distribution = "Distribution",
  TopUp = "TopUp"
}

/**
 * Data structure which represents the addition of an amount from an untracked account to a tracked account.
 */
export type TLedgerLineAddition = {
  kind: ELedgerLineType.Addition,
  fromAccount: string,
  toAccount: string,
  amount: number
}

/**
 * Data structure which represents the subtraction of an amount from a tracked account to an untracked account.
 */
export type TLedgerLineSubtraction = {
  kind: ELedgerLineType.Subtraction,
  fromAccount: string,
  toAccount: string,
  amount: number
};

/**
 * Data structure which represents moving an amount from one tracked account to another such that the recieving account's amount becomes a certain value.
 */
export type TLedgerLineTopUp = {
  kind: ELedgerLineType.TopUp,
  fromAccount: string,
  toAccount: string,
  amount: number
}

/**
 * Data structure which represents the distribution of percentages of a tracked account's amount to other tracked accounts.
 */
export type TLedgerLineDistribution = {
  kind: ELedgerLineType.Distribution,
  fromAccount: string,
  toAccounts: { toAccount: string, amount: number }[]
}

/**
 * Data structure which represents an entry to a ledger.
 */
export type TLedgerLine = TLedgerLineAddition | TLedgerLineSubtraction | TLedgerLineTopUp | TLedgerLineDistribution;

export enum ELedgerLineValidity {
  Valid = "Valid",
  InvalidFromAccount = "InvalidFromAccount",
  InvalidToAccount = "InvalidToAccount",
  InvalidAmount = "InvalidAmount",
  InvalidProportion = "InvalidProportion",
}

/**
 * A collection of methods all LedgerLine classes should implement.
 */
export interface ILedgerLine {
  checkValidity: (accountMap: TAccountMap) => ELedgerLineValidity,
  apply: (accountMap: TAccountMap) => void
  releventAccounts: () => Set<string>
}

export class LedgerLineAddition implements ILedgerLine {
  data: TLedgerLineAddition;

  constructor(data: TLedgerLineAddition) {
    this.data = data;
  }

  checkValidity(accountMap: TAccountMap): ELedgerLineValidity {
    if (this.data.amount <= 0)
        return ELedgerLineValidity.InvalidAmount;
      if (!accountMap.has(this.data.toAccount))
        return ELedgerLineValidity.InvalidToAccount;
      return ELedgerLineValidity.Valid;
  }

  apply(accountMap: TAccountMap) {
    if (!accountMap.has(this.data.toAccount))
      accountMap.set(this.data.toAccount, this.data.amount);
    else
      accountMap.set(this.data.toAccount, accountMap.get(this.data.toAccount) + this.data.amount);
  }

  releventAccounts(): Set<string> {
    return new Set([this.data.toAccount]);
  }
}

export class LedgerLineSubtraction implements ILedgerLine {
  data: TLedgerLineSubtraction;

  constructor(data: TLedgerLineSubtraction) {
    this.data = data;
  }

  checkValidity(accountMap: TAccountMap): ELedgerLineValidity {
    if (this.data.amount <= 0)
      return ELedgerLineValidity.InvalidFromAccount;
    if (!accountMap.has(this.data.fromAccount))
      return ELedgerLineValidity.InvalidFromAccount;
    return ELedgerLineValidity.Valid;
  }

  apply(accountMap: TAccountMap) {
    if (!accountMap.has(this.data.fromAccount))
      accountMap.set(this.data.fromAccount, -this.data.amount);
    else
      accountMap.set(this.data.fromAccount, accountMap.get(this.data.fromAccount) - this.data.amount);
  }

  releventAccounts(): Set<string> {
    return new Set([this.data.fromAccount]);
  }
}

export class LedgerLineTopUp implements ILedgerLine {
  data: TLedgerLineTopUp;

  constructor(data: TLedgerLineTopUp) {
    this.data = data;
  }

  checkValidity(accountMap: TAccountMap): ELedgerLineValidity {
    if (this.data.amount <= 0)
      return ELedgerLineValidity.InvalidAmount;
    if (!accountMap.has(this.data.fromAccount))
      return ELedgerLineValidity.InvalidFromAccount;
    if (!accountMap.has(this.data.toAccount))
      return ELedgerLineValidity.InvalidToAccount;
    return ELedgerLineValidity.Valid;
  }

  apply(accountMap: TAccountMap) {
    if (!accountMap.has(this.data.toAccount))
      accountMap.set(this.data.toAccount, 0);
    const toAccount = accountMap.get(this.data.toAccount);
    if (toAccount > this.data.amount)
      return;
    const topUpAmount = this.data.amount - toAccount;
    if (!accountMap.has(this.data.fromAccount))
      accountMap.set(this.data.fromAccount, 0);
    const fromAccount = accountMap.get(this.data.fromAccount);
    accountMap.set(this.data.fromAccount, accountMap.get(this.data.fromAccount) - topUpAmount);
    accountMap.set(this.data.toAccount, accountMap.get(this.data.toAccount) + topUpAmount);
  }

  releventAccounts(): Set<string> {
    return new Set([this.data.fromAccount, this.data.toAccount]);
  }
}

export class LedgerLineDistribution implements ILedgerLine {
  data: TLedgerLineDistribution;

  constructor(data: TLedgerLineDistribution) {
    this.data = data;
  }

  checkValidity(accountMap: TAccountMap): ELedgerLineValidity {
    if (!accountMap.has(this.data.fromAccount))
      return ELedgerLineValidity.InvalidFromAccount;
    for (let i = 0; i < this.data.toAccounts.length; i++) {
      const accountPercentage = this.data.toAccounts[i];
      if (accountPercentage[1] <= 0)
        return ELedgerLineValidity.InvalidProportion;
      if (accountPercentage[1] > 1)
        return ELedgerLineValidity.InvalidProportion;
      if (!accountMap.has(accountPercentage[0]))
        return ELedgerLineValidity.InvalidToAccount;
    }
    return ELedgerLineValidity.Valid;
  }

  apply(accountMap: TAccountMap) {
    if (!accountMap.has(this.data.fromAccount))
      accountMap.set(this.data.fromAccount, 0);
    let fromAccount = accountMap.get(this.data.fromAccount);
    let totalPercentage = 0;
    this.data.toAccounts.forEach(accountPercentage => {
      let toAccount = accountMap.get(accountPercentage[0]);
      const percentage = accountPercentage[1];
      totalPercentage += percentage;
      toAccount += fromAccount * percentage / 100;
    });
    fromAccount -= fromAccount * totalPercentage / 100;
    accountMap.set(this.data.fromAccount, fromAccount);
  }

  releventAccounts(): Set<string> {
    const releventAccounts = new Set([this.data.fromAccount]);
    this.data.toAccounts.forEach(accountPercentage => {
      releventAccounts.add(accountPercentage[0]);
    });
    return releventAccounts;
  }
}

export function createLedgerLineKind(kind: ELedgerLineType): TLedgerLine {
  switch (kind) {
    case ELedgerLineType.Addition:
      return { kind: ELedgerLineType.Addition, fromAccount: "from", toAccount: "to", amount: 0 };
    case ELedgerLineType.Subtraction:
      return { kind: ELedgerLineType.Subtraction, fromAccount: "from", toAccount: "to", amount: 0 };
    case ELedgerLineType.TopUp:
      return { kind: ELedgerLineType.TopUp, fromAccount: "from", toAccount: "to", amount: 0 };
    case ELedgerLineType.Distribution:
      return { kind: ELedgerLineType.Distribution, fromAccount: "from", toAccounts: [] };      
  }
}

/**
 * 
 * @param data The ledger line data to be converted to a ledger line class
 * @returns The ledger line class encapsulating the data
 */
export function createLedgerLine(data: TLedgerLine): ILedgerLine {
  switch (data.kind) {
    case ELedgerLineType.Addition:
      return new LedgerLineAddition(data);
    case ELedgerLineType.Subtraction:
      return new LedgerLineSubtraction(data);
    case ELedgerLineType.TopUp:
      return new LedgerLineTopUp(data);
    case ELedgerLineType.Distribution:
      return new LedgerLineDistribution(data);      
  }
}
