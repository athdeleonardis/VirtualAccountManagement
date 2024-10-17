import React, { createContext, useCallback, useContext, useState } from "react";
import { TAccount } from "../../../VirtualAccountManagement/Account/VirtualAccount";
import EditorElementWrapper from "./editor/accounts/EditorElementWrapper";


type TEditorState = {
  accounts: TAccount[];
}

type TEditorStateContext = {
  getAccounts: () => TAccount[],
  setAccounts: (accounts: TAccount[]) => void;
}

const EditorStateContext = createContext<TEditorStateContext>({
  getAccounts: () => [],
  setAccounts: (_) => null,
});

export const useEditorState = () => useContext(EditorStateContext);

const Editor = ({ children }: { children?: React.ReactNode }) => {
  const [state, _] = useState<TEditorState>({
    accounts: []
  });

  const getAccounts = useCallback(() => state.accounts, []);
  const setAccounts = useCallback((accounts: TAccount[]) => state.accounts = accounts, []);

  return (
    <EditorStateContext.Provider value={{ getAccounts, setAccounts }}>
      <EditorElementWrapper index={0}>
        { children }
      </EditorElementWrapper>
    </EditorStateContext.Provider>
  )
}

export default Editor;