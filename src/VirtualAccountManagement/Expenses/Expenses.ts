export enum EExpenseType {
  Biweekly = "Biweekly",
  Monthly = "Monthly",
  OneTime = "One time"
}

export type ExpenseBiweekly = {
  kind: EExpenseType.Biweekly,
  name: string,
  amount: number
};

export type ExpenseMonthly = {
  kind: EExpenseType.Monthly,
  name: string,
  dayOfMonth: number,
  amount: number
}

export type ExpenseOneTime = {
  kind: EExpenseType.OneTime,
  name: string,
  date: string,
  amount: number
}

export type Expense = ExpenseBiweekly | ExpenseMonthly | ExpenseOneTime;
