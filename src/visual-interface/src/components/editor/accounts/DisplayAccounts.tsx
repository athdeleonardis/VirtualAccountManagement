import AccountSummary from "../../AccountSummary";
import { useEditorElement } from "../EditorElementWrapper"

const DisplayAccounts = ({ name }: { name: string }) => {
  const { getAccounts } = useEditorElement();
  return (
    <div className="Editor-Element">
      <div className="Title">Display Accounts</div>
      <AccountSummary name={name} accounts={getAccounts()} />
    </div>
  );
}

export default DisplayAccounts;