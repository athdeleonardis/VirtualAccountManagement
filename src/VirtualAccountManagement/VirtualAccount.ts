export enum VirtualAccountType {
  Account = "Account",
  Group = "Group"
};

export type Account = {
  kind: VirtualAccountType.Account,
  name: string,
  amount: number
};

export type AccountGroup = {
  kind: VirtualAccountType.Group
  name: string,
  accounts: string[]
};

export type VirtualAccount = Account | AccountGroup;
export type AccountMap = Map<string, VirtualAccount>;
export type AccountAmountMap = Map<string, number>;
export type AccountTypeMap = Map<VirtualAccountType, VirtualAccount[]>;

export function createAccountMap(accounts: VirtualAccount[]): AccountMap {
  const map = new Map();
  accounts.forEach(virtualAccount => {
    map.set(virtualAccount.name, virtualAccount);
  });
  return map;
};

export function accountGroupIsRecursive(group: AccountGroup, accountMap: AccountMap): Boolean {
  return _accountGroupIsRecursive(group, accountMap, new Set<string>());
}

export function separateAccounts(accounts: VirtualAccount[]): AccountTypeMap {
  const accountTypeMap = new Map<VirtualAccountType, VirtualAccount[]>();
  accounts.forEach(account => {
    let accountArray = accountTypeMap.get(account.kind);
    if (accountArray == undefined) {
      accountArray = [];
      accountTypeMap.set(account.kind, accountArray);
    }
    accountArray.push(account);
  });
  return accountTypeMap;
}

function _accountGroupIsRecursive(currentAccount: VirtualAccount, accountMap: AccountMap, visitedAccounts: Set<String>): Boolean {
  if (currentAccount.kind == VirtualAccountType.Account)
    return false;
  if (visitedAccounts.has(currentAccount.name))
    return true;
  visitedAccounts.add(currentAccount.name);

  for (let i = 0; i < currentAccount.accounts.length; i++) {
    let childAccountName = currentAccount.accounts[i];
    let childAccount = accountMap.get(childAccountName);
    if (childAccount === undefined)
      throw new Error(`Account map missing child '${childAccount}' of account group '${currentAccount.name}'.`);
    if (_accountGroupIsRecursive(childAccount, accountMap, visitedAccounts))
      return true;
  }

  return false;
}

export function calculateAccountAmounts(accounts: VirtualAccount[], accountMap: AccountMap): AccountAmountMap {
  const map = new Map<string, number>();
  accounts.forEach(account => {
    _calculateAccountAmounts(account, accountMap, map);
  })
  return map;
}

function _calculateAccountAmounts(account: VirtualAccount, accountMap: AccountMap, accountAmountMap: AccountAmountMap): number {
  if (accountAmountMap.has(account.name))
    return accountAmountMap.get(account.name);
  if (account.kind == VirtualAccountType.Account) {
    accountAmountMap.set(account.name, account.amount);
    return account.amount;
  }
  if (account.kind == VirtualAccountType.Group) {
    let amount = 0;
    account.accounts.forEach(childAccount => {
      amount += _calculateAccountAmounts(accountMap.get(childAccount), accountMap, accountAmountMap);
    });
    accountAmountMap.set(account.name, amount);
    return amount;
  }
}

