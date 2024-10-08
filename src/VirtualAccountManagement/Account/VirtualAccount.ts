export enum EVirtualAccountType {
  Account = "Account",
  Group = "Group"
};

export type TAccount = {
  kind: EVirtualAccountType.Account,
  name: string,
  amount: number
};

export type TAccountGroup = {
  kind: EVirtualAccountType.Group
  name: string,
  accounts: string[]
};

export type TVirtualAccount = TAccount | TAccountGroup;
export type TVirtualAccountMap = Map<string, TVirtualAccount>;
export type TAccountMap = Map<string,number>;
type TAccountGroupMap = Map<string,TAccountGroup>;

export function createVirutalAccountMap(accounts: TVirtualAccount[]): TVirtualAccountMap {
  const map = new Map();
  accounts.forEach(virtualAccount => {
    map.set(virtualAccount.name, virtualAccount);
  });
  return map;
};

function createAccountGroupMap(accountGroups: TAccountGroup[]): TAccountGroupMap {
  const map = new Map<string,TAccountGroup>();
  accountGroups.forEach(accountGroup => map.set(accountGroup.name, accountGroup));
  return map;
}

export function accountGroupIsRecursive(group: TAccountGroup, accountMap: TVirtualAccountMap): Boolean {
  return _accountGroupIsRecursive(group, accountMap, new Set<string>());
}

export function separateAccounts(virtualAccounts: TVirtualAccount[]): { accounts: TAccount[], accountGroups: TAccountGroup[] } {
  const accounts: TAccount[] = [];
  const accountGroups: TAccountGroup[] = [];
  virtualAccounts.forEach(account => {
    if (account.kind === EVirtualAccountType.Account)
      accounts.push(account);
    else
      accountGroups.push(account);
  });
  return { accounts: accounts, accountGroups: accountGroups };
}

export function createAccountMap(accounts: TAccount[]): TAccountMap {
  const accountMap = new Map<string,number>();
  accounts.forEach((account) => accountMap.set(account.name, account.amount));
  return accountMap;
}

export function accountMapToArray(accountMap: TAccountMap): TAccount[] {
  const accounts: TAccount[] = [];
  for (let [accountName, amount] of accountMap) {
    accounts.push({ kind: EVirtualAccountType.Account, name: accountName, amount: amount });
  }
  return accounts;
}

function _accountGroupIsRecursive(currentAccount: TVirtualAccount, accountMap: TVirtualAccountMap, visitedAccounts: Set<String>): Boolean {
  if (currentAccount.kind == EVirtualAccountType.Account)
    return false;
  if (visitedAccounts.has(currentAccount.name))
    return true;
  visitedAccounts.add(currentAccount.name);

  for (let i = 0; i < currentAccount.accounts.length; i++) {
    let childAccountName = currentAccount.accounts[i];
    let childAccount = accountMap.get(childAccountName);
    if (_accountGroupIsRecursive(childAccount, accountMap, visitedAccounts))
      return true;
  }

  return false;
}

export function calculateAccountGroups(accountGroups: TAccountGroup[], accountMap: TAccountMap): TAccountMap {
  const accountGroupAmountMap = new Map<string,number>();
  accountGroups.forEach(accountGroup => _calculateAccountGroups(accountGroup.name, createAccountGroupMap(accountGroups), accountMap, accountGroupAmountMap));
  return accountGroupAmountMap;
}

function _calculateAccountGroups(accountName: string, accountGroupMap: TAccountGroupMap, accountMap: TAccountMap, accountGroupAmountMap: TAccountMap): number {
  if (accountMap.has(accountName))
    return accountMap.get(accountName);
  let total = 0;
  if (accountGroupAmountMap.has(accountName))
    return accountGroupAmountMap.get(accountName);
  accountGroupMap.get(accountName).accounts.forEach(childAccount => total += _calculateAccountGroups(childAccount, accountGroupMap, accountMap, accountGroupAmountMap));
  accountGroupAmountMap.set(accountName, total);
  return total;
}
