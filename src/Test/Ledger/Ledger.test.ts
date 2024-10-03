import { AccountMap, VirtualAccountType } from "../../VirtualAccountManagement/Account/VirtualAccount.js";
import { TLedgerLine, ELedgerLineType, createLedgerLine } from "../../VirtualAccountManagement/Ledger/Ledger.js";

const ledgerLineData: TLedgerLine[] = [];
ledgerLineData.push({ kind: ELedgerLineType.Addition, fromAccount: "_", toAccount: "Alice", amount: 20 });
ledgerLineData.push({ kind: ELedgerLineType.Addition, fromAccount: "_", toAccount: "Bob", amount: 10 });
ledgerLineData.push({ kind: ELedgerLineType.Subtraction, fromAccount: "Alice", toAccount: "_", amount: 10 });
ledgerLineData.push({ kind: ELedgerLineType.TopUp, fromAccount: "Bob", toAccount: "Alice", amount: 15 });
ledgerLineData.push({ kind: ELedgerLineType.Distribution, fromAccount: "Bob", toAccounts: [["Alice", 50], ["Claire", 50]] });

const ledgerLines = ledgerLineData.map(data => createLedgerLine(data));

console.log("Before add all accounts");
const accountMap: AccountMap = new Map();
ledgerLines.forEach(line => {
  console.log(line.checkValidity(accountMap));
});

console.log("After add all accounts");
ledgerLines.forEach(line => {
  const releventAccounts = line.releventAccounts();
  releventAccounts.forEach(account => accountMap.set(account, { kind: VirtualAccountType.Account, name: account, amount:  0}));
});
ledgerLines.forEach(line => {
  console.log(line.checkValidity(accountMap));
});

ledgerLines.forEach(line => {
  console.log(line);
  line.apply(accountMap);
  console.log(accountMap);
});
