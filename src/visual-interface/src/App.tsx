import './App.css'
import Editor from './components/Editor'
import TestCase from './components/OrderTest'
import ExpensesEditor from './pages/ExpensesEditor'
import LedgerEditor from './pages/LedgerEditor'

function App() {
  return (
    <div>
      <Editor>
        <ExpensesEditor />
        <LedgerEditor />
      </Editor>
    </div>
  )
}

export default App
