import { VirtualAccountType, VirtualAccount, createAccountMap, calculateAccountAmounts } from "../VirtualAccountManagement/VirtualAccount.js";

let accounts: VirtualAccount[] = [];

accounts.push({ kind: VirtualAccountType.Account, name: "Account 1", amount: 10 });
accounts.push({ kind: VirtualAccountType.Account, name: "Account 2", amount: 20 });
accounts.push({ kind: VirtualAccountType.Group, name: "Account 3", amount: undefined, accounts: ["Account 1", "Account 2"]});

console.log(accounts);

const accountMap = createAccountMap(accounts);
console.log(accountMap);

const accountAmountMap = calculateAccountAmounts(accounts, accountMap);
console.log(accountAmountMap);
