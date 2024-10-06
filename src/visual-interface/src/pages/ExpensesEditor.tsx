import { createContext, useCallback, useContext, useState } from 'react';
import { Expense, EExpenseType } from '../../../VirtualAccountManagement/Expenses/Expenses.ts';

function createBlankExpense(expenseType: EExpenseType): Expense {
  switch (expenseType) {
    case EExpenseType.Biweekly:
      return { kind: EExpenseType.Biweekly, name: "Name", amount: 0 };
    case EExpenseType.Monthly:
      return { kind: EExpenseType.Monthly, name: "Name", dayOfMonth: 1, amount: 0 };
    case EExpenseType.OneTime:
      return { kind: EExpenseType.OneTime, name: "Name", date: "Date", amount: 0 };    
  }
}

type ExpensesEditorState = {
  expenses: Expense[],
  currentlyEditing: { index: number, expense: Expense } | null
};

type ExpensesEditorStateUpdater = {
  save: (expense: Expense) => void,
  changeEditType: (expenseType: EExpenseType) => void
  selectToEdit: (index: number) => void
};

const ExpenseLineEditor = ({ expense }: { expense: Expense }) => {
  const { save, changeEditType } = useContext(ExpensesEditorStateUpdater);

  // Convert form entry to an expense structure to save
  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      kind: { value: EExpenseType }
    };
    switch (target.kind.value) {
      case EExpenseType.Biweekly: {
        const values = e.target as typeof e.target & {
          kind: { value: EExpenseType.Biweekly },
          name: { value: string },
          amount: {value: number }
        };
        save({ kind: values.kind.value, name: values.name.value, amount: values.amount.value });
        break;
      }
      case EExpenseType.Monthly: {
          const values = e.target as typeof e.target & {
            kind: { value: EExpenseType.Monthly },
            name: { value: string },
            dayOfMonth: { value: number },
            amount: {value: number }
          };
          save({ kind: values.kind.value, name: values.name.value, dayOfMonth: values.dayOfMonth.value, amount: values.amount.value });
        break;
      }
      case EExpenseType.OneTime: {
        const values = e.target as typeof e.target & {
          kind: { value: EExpenseType.OneTime },
          name: { value: string },
          date: { value: string },
          amount: { value: number }
        };
        save({ kind: values.kind.value, name: values.name.value, date: values.date.value, amount: values.amount.value });
        break;
      }
    }
  }

  function onSelectChange(e: React.SyntheticEvent) {
    const target = e.target as typeof e.target & {
      value: EExpenseType
    };
    changeEditType(target.value);
  }

  return (
    <div className='Expenses-Editor-Line-Editing'>
      Editing
      <form onSubmit={handleSubmit}>
        <label>
          Type:
          <select name='kind' defaultValue={expense.kind} onChange={onSelectChange}>
            <option value={EExpenseType.Biweekly}>Biweekly</option>
            <option value={EExpenseType.Monthly}>Monthly</option>
            <option value={EExpenseType.OneTime}>OneTime</option>
          </select>
        </label>
        <label>
          Name:
          <input name='name' defaultValue={expense.name}/>
        </label>
        {
          (expense.kind === EExpenseType.Monthly) ?
          <label>
            Day of month:
            <input name='dayOfMonth' type='number' min='1' max='31' defaultValue={expense.dayOfMonth}/>
          </label> : <></>
        }
        {
          (expense.kind === EExpenseType.OneTime) ?
          <label>
            Date:
            <input name='date' type='date' defaultValue={expense.date}/>
          </label> : <></>
        }
        <label>
          Amount:
          <input name='amount' type='number' min='0' step='.01' defaultValue={expense.amount}/>
        </label>
        <button type='submit'>Save</button>
      </form>
    </div>
  );
}

const ExpenseLine = ({ index, expense }: { index: number, expense: Expense }) => {
  const { selectToEdit } = useContext(ExpensesEditorStateUpdater);

  return (
    <div className='Expenses-Editor-Line'>
      <button onClick={() => selectToEdit(index)}>Edit</button>
      <span className='Expenses-Editor-Line-Entry'>{`Type: ${expense.kind}`}</span>
      <span className='Expenses-Editor-Line-Entry'>{`Name: ${expense.name}`}</span>
      {
        (expense.kind === EExpenseType.Monthly)
        ? <span className='Expenses-Editor-Line-Entry'>{`Day: ${expense.dayOfMonth}`}</span>
        : <></>
      }
      {
        (expense.kind === EExpenseType.OneTime)
        ? <span className='Expenses-Editor-Line-Entry'>{`Date: ${expense.date}`}</span>
        : <></>
      }
      <span className='Expenses-Editor-Line-Entry'>{`Amount: ${expense.amount}`}</span>
    </div>
  );
}

const ExpensesEditorStateUpdater = createContext<ExpensesEditorStateUpdater>({ save: (_) => null, changeEditType: (_) => null, selectToEdit: (_) => null });

const ExpensesEditor = () => {
  const [expenseEditorState, setExpenseEditorState] = useState<ExpensesEditorState>({ expenses: [], currentlyEditing: null });

  function newExpense() {
    const indexEditing = expenseEditorState.expenses.length;
    const newExpense: Expense = createBlankExpense(EExpenseType.Biweekly);
    expenseEditorState.expenses.push(newExpense);
    setExpenseEditorState({ expenses: expenseEditorState.expenses, currentlyEditing: { index: indexEditing, expense: newExpense} });
  }

  const save = useCallback((expense: Expense) => {
    if (expenseEditorState.currentlyEditing == null)
      return;
    expenseEditorState.expenses[expenseEditorState.currentlyEditing.index] = expenseEditorState.currentlyEditing.expense;
    setExpenseEditorState({ expenses: expenseEditorState.expenses, currentlyEditing: null });
  }, []);

  const changeEditType = useCallback((expenseType: EExpenseType) => {
    if (expenseEditorState.currentlyEditing == null)
      return;
    setExpenseEditorState((expenseEditorState: ExpensesEditorState) => {
      return {
        expenses: expenseEditorState.expenses,
        currentlyEditing: { index: expenseEditorState.currentlyEditing?.index || 0, expense: createBlankExpense(expenseType)}
      };
    });
  }, []);

  const selectToEdit = useCallback((index: number) => {
    setExpenseEditorState((expenseEditorState: ExpensesEditorState) => {
      return {
        expenses: expenseEditorState.expenses,
        currentlyEditing: { index: index, expense: expenseEditorState.expenses[index] }
      }
    });
  }, []);

  return (
    <ExpensesEditorStateUpdater.Provider value={{ save: save, changeEditType: changeEditType, selectToEdit: selectToEdit }}>
      <div className='Expenses-Editor'>
        Expenses
        <ul>
          {
            expenseEditorState.expenses.map((expense, index) => {
              if (expenseEditorState.currentlyEditing != null && index == expenseEditorState.currentlyEditing.index)
                return <li key={index}><ExpenseLineEditor expense={expenseEditorState.currentlyEditing.expense} /></li>
              else
                return <li key={index}><ExpenseLine index={index} expense={expense} /></li>
            })
          }
        </ul>
        <button onClick={() => newExpense()}>New Expense</button>
      </div>
    </ExpensesEditorStateUpdater.Provider>
  );
}

export default ExpensesEditor;
