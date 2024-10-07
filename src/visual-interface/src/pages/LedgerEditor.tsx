import React, { useState } from 'react'
import { createLedgerLine, ELedgerLineType, TLedgerLine } from '../../../VirtualAccountManagement/Ledger/Ledger.ts'
import { TAccount, TAccountGroup, createAccountMap, accountMapToArray, calculateAccountGroups } from '../../../VirtualAccountManagement/Account/VirtualAccount.ts'
import AccountSummary from '../components/AccountSummary.tsx'

type LedgerEditorState = {
  initialAccounts: TAccount[] | null
  accountGroups: TAccountGroup[] | null
  ledgerLines: TLedgerLine[],
}

const LedgerEditorLine = ({ ledgerLine }: { ledgerLine: TLedgerLine }) => {
  return (
    <div className='Editor-Line'>
      <span className='Ledger-Editor-Line-Entry'>{`Type: ${ledgerLine.kind}`}</span>
    </div>
  );
}

const LedgerEditorLineEditing = ({ ledgerLine }: { ledgerLine: TLedgerLine }) => {
  function handleSubmit(e: React.SyntheticEvent) { }
  function handleChangeKind(e: React.SyntheticEvent) { }

  return (
    <div className='Editor-Line-Editing'>
      <form onSubmit={handleSubmit}>
        <select defaultValue={ledgerLine.kind} onChange={handleChangeKind}>
          <option label={ELedgerLineType.Addition} value={ELedgerLineType.Addition} />
          <option label={ELedgerLineType.Subtraction} value={ELedgerLineType.Subtraction} />
          <option label={ELedgerLineType.TopUp} value={ELedgerLineType.TopUp} />
          <option label={ELedgerLineType.Distribution} value={ELedgerLineType.Distribution} />
        </select>
        <button type='submit'>Save</button>
      </form>
    </div>
  );
}

const LedgerEditor = () => {
  const [state, setState] = useState<LedgerEditorState>({ initialAccounts: null, accountGroups: null, ledgerLines: [] });

  function onChooseStartAccounts(e: React.SyntheticEvent) {
    console.log("Start chart chosen.");
  }

  function addLedgerLine() {

  }

  const initialAccounts = (state.initialAccounts) ? state.initialAccounts : [];
  const accountMap = createAccountMap(initialAccounts);
  state.ledgerLines.forEach((line) => createLedgerLine(line).apply(accountMap));
  const finalAccounts = accountMapToArray(accountMap);
  const finalAccountGroupsMap = (state.accountGroups) ? calculateAccountGroups(state.accountGroups, accountMap) : null;
  const finalAccountGroups = (finalAccountGroupsMap) ? accountMapToArray(finalAccountGroupsMap) : null;
  return (
    <div className="Editor">
      <div className='Title'>Ledger Line Editor</div>
      <div className="Editor-Element">
        <div className='Title'>Initial Accounts</div>
        <input type='file' onChange={onChooseStartAccounts} />
        {
          (state.initialAccounts)
          ? <AccountSummary name='Initial Accounts' accounts={state.initialAccounts} />
          : <></>
        }
      </div>
      <div className='Editor-Element'>
        <div className='Title'>Edit Ledger Lines</div>
        <button onClick={addLedgerLine}>New ledger line</button>
      </div>
      <div className='Editor-Element'>
        Final Accounts
        <AccountSummary name='Accounts' accounts={finalAccounts} />
        {
          (finalAccountGroups)
          ? <AccountSummary name='Account Groups' accounts={finalAccountGroups} />
          : <></>
        }
      </div>
    </div>
  )
}

export default LedgerEditor;
