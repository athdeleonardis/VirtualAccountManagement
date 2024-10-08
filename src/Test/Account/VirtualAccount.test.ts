import { EVirtualAccountType, TVirtualAccount, createVirutalAccountMap, calculateAccountAmounts } from "../../VirtualAccountManagement/Account/VirtualAccount.js"

let accounts: TVirtualAccount[] = [];

accounts.push({ kind: EVirtualAccountType.Account, name: "Account 1", amount: 10 });
accounts.push({ kind: EVirtualAccountType.Account, name: "Account 2", amount: 20 });
accounts.push({ kind: EVirtualAccountType.Group, name: "Account 3", accounts: ["Account 1", "Account 2"]});
console.log(accounts);

const accountMap = createVirutalAccountMap(accounts);
console.log(accountMap);

const accountAmountMap = calculateAccountAmounts(accounts, accountMap);
console.log(accountAmountMap);
