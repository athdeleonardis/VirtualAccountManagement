import React, { createContext, useCallback, useContext, useState } from 'react'
import { createLedgerLine, createLedgerLineKind, ELedgerLineType, TLedgerLine } from '../../../VirtualAccountManagement/Ledger/Ledger.ts'
import { TAccount, TAccountGroup, createAccountMap, accountMapToArray, calculateAccountGroups, separateAccounts, TVirtualAccount } from '../../../VirtualAccountManagement/Account/VirtualAccount.ts'
import AccountSummary from '../components/AccountSummary.tsx'
import DownloadJSONFileButton from '../components/DownloadJSONFileButton.tsx'
import OpenJSONFileInput from '../components/OpenJSONFileInput.tsx'

const LedgerEditorLine = ({ index, editing, ledgerLine }: { index: number, editing: boolean, ledgerLine: TLedgerLine }) => {
  const { selectToEdit } = useContext(LedgerEditorStateUpdater);
  return (
    <div className='Editor-Line'>
      {
        (editing) ? <></> : <button onClick={() => selectToEdit(index)}>Edit</button>
      }
      <span className='Ledger-Editor-Line-Entry'>{`Type: ${ledgerLine.kind}`}</span>
      <span className='Ledger-Editor-Line-Entry'>{`From: ${ledgerLine.fromAccount}`}</span>
      {
        (ledgerLine.kind !== ELedgerLineType.Distribution) ?
        <>
          <span className='Ledger-Editor-Line-Entry'>{`To: ${ledgerLine.toAccount}`}</span>
          <span className='Ledger-Editor-Line-Entry'>{`Amount: ${ledgerLine.amount}`}</span>
        </>
        : <></>
      }
    </div>
  );
}

const LedgerEditorLineEditing = ({ ledgerLine }: { ledgerLine: TLedgerLine }) => {
  const { save, changeEditKind } = useContext(LedgerEditorStateUpdater);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const { kind, fromAccount, toAccount, amount } = e.target as typeof e.target & {
      kind: { value: ELedgerLineType },
      fromAccount: { value: string },
      toAccount: { value: string },
      amount: { value: string },
    }
    if (kind.value === ELedgerLineType.Distribution)
      return;
    save({ kind: kind.value, fromAccount: fromAccount.value, toAccount: toAccount.value, amount: parseFloat(amount.value) });
  }

  function handleChangeKind(e: React.SyntheticEvent) {
    const { value } = e.target as typeof e.target & {
      value: ELedgerLineType
    }
    changeEditKind(value);
  }

  return (
    <div className='Editor-Line-Editing-Vertical'>
      <form onSubmit={handleSubmit}>
        <label>Type:</label>
        <select name='kind' defaultValue={ledgerLine.kind} onChange={handleChangeKind}>
          <option label={ELedgerLineType.Addition} value={ELedgerLineType.Addition} />
          <option label={ELedgerLineType.Subtraction} value={ELedgerLineType.Subtraction} />
          <option label={ELedgerLineType.TopUp} value={ELedgerLineType.TopUp} />
          <option label={ELedgerLineType.Distribution} value={ELedgerLineType.Distribution} />
        </select>
        <label>From:</label>
        <input name='fromAccount' defaultValue={ledgerLine.fromAccount} />
        {
          (ledgerLine.kind !== ELedgerLineType.Distribution) ?
          <>
            <label>To:</label>
            <input name='toAccount' defaultValue={ledgerLine.toAccount} />
            <label>Amount:</label>
            <input name='amount' type='number' min='0' step='.01' defaultValue={ledgerLine.amount} />
          </>
          : <></>
        }
        <button type='submit'>Save</button>
      </form>
    </div>
  );
}

type LedgerEditorState = {
  initialAccounts: TAccount[] | null
  accountGroups: TAccountGroup[] | null
  ledgerLines: TLedgerLine[],
  currentlyEditing: { index: number, ledgerLine: TLedgerLine } | null
};

type LedgerEditorStateUpdater = {
  save: (ledgerLine: TLedgerLine) => void,
  selectToEdit: (index: number) => void,
  changeEditKind: (kind: ELedgerLineType) => void
}

const LedgerEditorStateUpdater = createContext<LedgerEditorStateUpdater>({ save: (_) => null, selectToEdit: (_) => null, changeEditKind: (_) => null });

const LedgerEditor = () => {
  const [state, setState] = useState<LedgerEditorState>({ initialAccounts: null, accountGroups: null, ledgerLines: [], currentlyEditing: null });

  function setInitialAccounts(virtualAccounts: TVirtualAccount[]) {
    const { accounts, accountGroups } = separateAccounts(virtualAccounts);
    setState((state: LedgerEditorState) => {
      return {
        ...state,
        initialAccounts: accounts,
        accountGroups: (accountGroups.length != 0) ? accountGroups : null
      };
    });
  }

  function setLedgerLines(ledgerLines: TLedgerLine[]) {
    setState((state: LedgerEditorState) => {
      return {
        ...state,
        currentlyEditing: null,
        ledgerLines: ledgerLines
      };
    });
  }

  function addLedgerLine() {
    console.log("Added");
    setState((state: LedgerEditorState) => {
      const newLineIndex = state.ledgerLines.length;
      const newLine = createLedgerLineKind(ELedgerLineType.Addition);
      state.ledgerLines.push(newLine);
      return {
        ...state,
        currentlyEditing: { index: newLineIndex, ledgerLine: newLine }
      };
    });
  }

  const save = useCallback((ledgerLine: TLedgerLine) => {
    setState((state: LedgerEditorState) => {
      if (state.currentlyEditing == null)
        return state;
      state.ledgerLines[state.currentlyEditing.index] = ledgerLine;
      return {
        ...state,
        currentlyEditing: null
      };
    });
  }, []);

  const selectToEdit = useCallback((index: number) => {
    setState((state: LedgerEditorState) => {
      return {
        ...state,
        currentlyEditing: { index: index, ledgerLine: state.ledgerLines[index] }
      };
    })
  }, []);

  const changeEditKind = useCallback((kind: ELedgerLineType) => {
    setState((state: LedgerEditorState) => {
      if (state.currentlyEditing == null || state.currentlyEditing.ledgerLine.kind === kind)
        return state;
      return {
        ...state,
        currentlyEditing: { ...state.currentlyEditing, ledgerLine: createLedgerLineKind(kind) }
      };
    });
  }, []);

  const initialAccounts = (state.initialAccounts) ? state.initialAccounts : [];
  const accountMap = createAccountMap(initialAccounts);
  state.ledgerLines.forEach((line) => createLedgerLine(line).apply(accountMap));
  const finalAccounts = accountMapToArray(accountMap);
  const finalAccountGroupsMap = (state.accountGroups) ? calculateAccountGroups(state.accountGroups, accountMap) : null;
  const finalAccountGroups = (finalAccountGroupsMap) ? accountMapToArray(finalAccountGroupsMap) : null;
  return (
    <LedgerEditorStateUpdater.Provider value={{ save: save, selectToEdit: selectToEdit, changeEditKind: changeEditKind }}>
      <div className="Editor">
        <div className='Title'>Ledger Line Editor</div>
        <div className='Editor-Element-Horizontal'>
          <div>
            <div className="Editor-Element">
              <div className='Title'>Initial Accounts</div>
              <OpenJSONFileInput callback={setInitialAccounts} />
              {
                (state.initialAccounts)
                ? <AccountSummary name='Initial Accounts' accounts={state.initialAccounts} />
                : <></>
              }
            </div>
            <div className='Editor-Element'>
              <div className='Title'>Edit Ledger Lines</div>
              <div>
                <OpenJSONFileInput callback={setLedgerLines} />
              </div>
              {
                state.ledgerLines.map((line, index) => (
                  <LedgerEditorLine
                    key={index}
                    index={index}
                    editing={state.currentlyEditing != null && index == state.currentlyEditing.index}
                    ledgerLine={line}
                  />
                ))
              }
              <div>
                <button onClick={addLedgerLine}>New ledger line</button>
              </div>
              <div>
                <DownloadJSONFileButton fileName='LedgerLines' data={state.ledgerLines}>Download ledger line data</DownloadJSONFileButton>
              </div>
            </div>
            <div className='Editor-Element'>
              Final Accounts
              <AccountSummary name='Accounts' accounts={finalAccounts} />
              <DownloadJSONFileButton fileName='Accounts' data={finalAccounts}>Download account data</DownloadJSONFileButton>
              {
                (finalAccountGroups)
                ? <AccountSummary name='Account Groups' accounts={finalAccountGroups} />
                : <></>
              }
            </div>
          </div>
          {
          (state.currentlyEditing) ?
            <div>
              <div className='Editor-Element'>
                <LedgerEditorLineEditing ledgerLine={state.currentlyEditing.ledgerLine} />
              </div>
            </div>
            : <></>
          }
        </div>
      </div>
    </LedgerEditorStateUpdater.Provider>
  )
}

export default LedgerEditor;
