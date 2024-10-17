import { useState } from "react"
import { useEditorElement } from "../EditorElementWrapper"
import { TAccount } from "../../../../../VirtualAccountManagement/Account/VirtualAccount"
import OpenJSONFileInput from "../../OpenJSONFileInput"

const OpenAccountFile = () => {
  const { elementRefresh, setAccounts } = useEditorElement();
  const [initialAccounts, setInitialAccounts] = useState<TAccount[]>([]);

  const onDataRecieved = (accounts: TAccount[]) => {
    elementRefresh();
    setInitialAccounts(_ => {
      return accounts;
    });
  }
  
  setAccounts(initialAccounts);

  return (
    <div className="Editor-Element">
      <div className='Title'>Initial Accounts</div>
      <OpenJSONFileInput<TAccount[]> callback={onDataRecieved} />
    </div>
  )
}

export default OpenAccountFile;