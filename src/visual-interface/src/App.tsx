import './App.css'
import Editor from './components/Editor'
import DisplayAccounts from './components/editor/accounts/DisplayAccounts'
import Ledger from './components/editor/accounts/Ledger'
import OpenAccountFile from './components/editor/accounts/OpenAccountFile'

function App() {
  return (
    <div>
      <Editor>
        <OpenAccountFile />
        <DisplayAccounts name="Initial Accounts" />
        <Ledger />
        <DisplayAccounts name="Final Accounts" />
      </Editor>
    </div>
  )
}

export default App
