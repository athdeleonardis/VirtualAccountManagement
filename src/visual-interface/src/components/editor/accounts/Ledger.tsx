import { createContext, useCallback, useContext, useState } from "react";
import { createLedgerLine, createLedgerLineKind, ELedgerLineType, TLedgerLine } from "../../../../../VirtualAccountManagement/Ledger/Ledger";
import DownloadJSONFileButton from "../../DownloadJSONFileButton";
import OpenJSONFileInput from "../../OpenJSONFileInput";
import { useEditorElement } from "../EditorElementWrapper";
import { accountMapToArray, createAccountMap } from "../../../../../VirtualAccountManagement/Account/VirtualAccount";
import { insert } from "../../../util/array-util";

type TLedgerState = {
  ledgerLines: TLedgerLine[],
  currentlyEditing: { index: number, ledgerLine: TLedgerLine } | null
};

type LedgerStateUpdater = {
  save: (ledgerLine: TLedgerLine) => void,
  selectToEdit: (index: number) => void,
  changeEditKind: (kind: ELedgerLineType) => void
}

const LedgerStateUpdater = createContext<LedgerStateUpdater>({ save: (_) => null, selectToEdit: (_) => null, changeEditKind: (_) => null });

const LedgerLine = ({ index, editing, ledgerLine }: { index: number, editing: boolean, ledgerLine: TLedgerLine }) => {
  const { selectToEdit } = useContext(LedgerStateUpdater);
  return (
    <div className='Editor-Line'>
      <div>{index}</div>
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

const LedgerLineEditor = ({ ledgerLine }: { ledgerLine: TLedgerLine }) => {
  const { save, changeEditKind } = useContext(LedgerStateUpdater);

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

const Ledger = () => {
  const { elementRefresh, getAccounts, setAccounts } = useEditorElement();

  const [state, setState] = useState<TLedgerState>({
    ledgerLines: [],
    currentlyEditing: null
  });

  function setLedgerLines(ledgerLines: TLedgerLine[]) {
    setState((state: TLedgerState) => {
      return {
        ...state,
        currentlyEditing: null,
        ledgerLines: ledgerLines
      };
    });
    elementRefresh();
  }

  function addLedgerLine(index: number) {
    setState((state: TLedgerState) => {
      const newLine = createLedgerLineKind(ELedgerLineType.Addition);
      return {
        ...state,
        ledgerLines: insert(state.ledgerLines, index, newLine),
        currentlyEditing: { index: index, ledgerLine: newLine }
      };
    });
    elementRefresh();
  }

  const save = useCallback((ledgerLine: TLedgerLine) => {
    setState((state: TLedgerState) => {
      if (state.currentlyEditing == null)
        return  state;
      state.ledgerLines[state.currentlyEditing.index] = ledgerLine;
      return {
        ...state,
        currentlyEditing: null
      };
    });
    elementRefresh();
  }, []);

  const selectToEdit = useCallback((index: number) => {
    setState((state: TLedgerState) => {
      return {
        ...state,
        currentlyEditing: { index: index, ledgerLine: state.ledgerLines[index] }
      };
    })
  }, []);

  const changeEditKind = useCallback((kind: ELedgerLineType) => {
    setState((state: TLedgerState) => {
      if (state.currentlyEditing == null || state.currentlyEditing.ledgerLine.kind === kind)
        return state;
      return {
        ...state,
        currentlyEditing: { ...state.currentlyEditing, ledgerLine: createLedgerLineKind(kind) }
      };
    });
    elementRefresh();
  }, []);

  const initialAccounts = getAccounts();
  const accountMap = createAccountMap(initialAccounts);
  state.ledgerLines.forEach((line) => createLedgerLine(line).apply(accountMap));
  const finalAccounts = accountMapToArray(accountMap);
  //const finalAccountGroupsMap = (state.accountGroups) ? calculateAccountGroups(state.accountGroups, accountMap) : null;
  //const finalAccountGroups = (finalAccountGroupsMap) ? accountMapToArray(finalAccountGroupsMap) : null;
  setAccounts(finalAccounts);

  return (
    <LedgerStateUpdater.Provider value={{ save, selectToEdit, changeEditKind }}>
      <div className="Editor">
        <div className="Title">Ledger</div>
        <div className="Editor-Element-Horizontal">
          <div className='Editor-Element'>
            <div className='Title'>Edit Ledger Lines</div>
            <div>
              <OpenJSONFileInput callback={setLedgerLines} />
            </div>
            {
              state.ledgerLines.map((line, index) => (
                <LedgerLine
                  key={index}
                  index={index}
                  editing={state.currentlyEditing != null && index == state.currentlyEditing.index}
                  ledgerLine={line}
                />
              ))
            }
            <div>
              <button onClick={() => addLedgerLine(state.ledgerLines.length)}>New ledger line</button>
            </div>
            <div>
              <DownloadJSONFileButton fileName='LedgerLines' data={state.ledgerLines}>Download ledger line data</DownloadJSONFileButton>
            </div>
          </div>
          { state.currentlyEditing
            ? (
              <div>
                <div className='Editor-Element'>
                  <LedgerLineEditor ledgerLine={state.currentlyEditing.ledgerLine} />
                </div>
              </div>
            )
            : <></>
          }
        </div>
      </div>
    </LedgerStateUpdater.Provider>
  );
}

export default Ledger;