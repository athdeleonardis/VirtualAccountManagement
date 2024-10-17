import React, { createContext, useCallback, useContext, useState } from "react";
import { TAccount } from "../../../VirtualAccountManagement/Account/VirtualAccount";
import EditorElementWrapper from "./editor/EditorElementWrapper";


type TEditorState = {
  accounts: (TAccount[] | null)[];
}

type TEditorStateContext = {
  registerElement: (index: number) => void,
  getElementAccounts: (index: number) => TAccount[],
  setElementAccounts: (index: number, accounts: TAccount[]) => void;
}

const EditorStateContext = createContext<TEditorStateContext>({
  registerElement: (_) => null,
  getElementAccounts: (_) => [],
  setElementAccounts: (_) => null,
});

export const useEditorState = () => useContext(EditorStateContext);

const Editor = ({ children }: { children?: React.ReactNode }) => {
  console.log("Rendering.");
  
  const [state, _] = useState<TEditorState>({
    accounts: []
  });

  const registerElement = useCallback((index: number) => {
    while (state.accounts.length < index+1)
      state.accounts.push(null);
    return;
  }, []);

  const getElementAccounts = useCallback((index: number) => {
    while (index > -1) {
      const account = state.accounts[index]
      if (account)
        return account;
      index--;
    }
    return [];
  }, []);

  const setElementAccounts = useCallback((index: number, accounts: TAccount[]) => state.accounts[index] = accounts, []);

  return (
    <EditorStateContext.Provider value={{ registerElement, getElementAccounts, setElementAccounts }}>
      <EditorElementWrapper index={0}>
        { children }
      </EditorElementWrapper>
    </EditorStateContext.Provider>
  )
}

export default Editor;