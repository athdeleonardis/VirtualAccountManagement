enum EExpenseType {
  Biweekly,
  Monthly,
  OneTime
}

type ExpenseBiweekly = {
  kind: EExpenseType.Biweekly,
  name: string,
  amount: number
};

type ExpenseMonthly = {
  kind: EExpenseType.Monthly,
  name: string,
  dayOfMonth: number,
  amount: number
}

type ExpenseOneTime = {
  kind: EExpenseType.OneTime,
  name: string,
  date: string,
  amount: number
}

type Expense = ExpenseBiweekly | ExpenseMonthly | ExpenseOneTime;
