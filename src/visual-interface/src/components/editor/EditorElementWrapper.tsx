import React, { createContext, useCallback, useContext, useState } from "react";
import { useEditorState } from "../Editor";
import { TAccount } from "../../../../VirtualAccountManagement/Account/VirtualAccount";

type TEditorElementContext = {
  getIndex: () => number,
  elementRefresh: () => void,
  getAccounts: () => TAccount[],
  setAccounts: (accounts: TAccount[]) => void,
};

const EditorElementContext = createContext<TEditorElementContext>({
  getIndex: () => -1,
  elementRefresh: () => null,
  getAccounts: () => [],
  setAccounts: (_) => null
});

export const useEditorElement = () => useContext(EditorElementContext);

const TestEditorElementContext = () => {
  const { getIndex } = useEditorElement();
  const index = getIndex();
  return <>{`Index: ${index}`}</>;
}

const EditorElementWrapper = ({ children, index }: { children?: React.ReactNode, index: number }) => {
  console.log(index);
  const { registerElement, getElementAccounts, setElementAccounts } = useEditorState();
  const [registered, setRegistered] = useState(false);
  const [_, setRefreshValue] = useState(0);

  if (!registered) {
    setRegistered(_ => {
      console.log("Registering.");
      registerElement(index);
      return true;
    });
  }

  const getIndex = useCallback(() => index, []);
  const elementRefresh = useCallback(() => setRefreshValue(value => value+1), []);
  const getAccounts = useCallback(() => getElementAccounts(index-1), []);
  const setAccounts = useCallback((accounts: TAccount[]) => setElementAccounts(index, accounts), []);

  const childArray = React.Children.toArray(children);
  const head = childArray[0];
  const tail = childArray.slice(1);
  return (
    <EditorElementContext.Provider value={{ getIndex, elementRefresh, getAccounts, setAccounts }}>
      <TestEditorElementContext />
      { head }
      { tail.length > 0
        ? (
          <EditorElementWrapper index={index+1}>
            { tail }
          </EditorElementWrapper>
        )
        : <></>
      }
    </EditorElementContext.Provider>
  )
}

export default EditorElementWrapper;