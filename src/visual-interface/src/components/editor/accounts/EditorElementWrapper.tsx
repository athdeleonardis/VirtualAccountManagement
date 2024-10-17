import React from "react";

const EditorElementWrapper = ({ index, children }: { index: number, children?: React.ReactNode }) => {
  console.log(`Editor Element Wrapper Index ${index}.`);
  
  const childArray = React.Children.toArray(children);
  const head = childArray[0];
  const tail = childArray.slice(1);
  return <>
    { head }
    { tail.length > 0
      ? (
        <EditorElementWrapper index={index+1}>
          { tail }
        </EditorElementWrapper>
      )
      : <></>
    }
  </>
}

export default EditorElementWrapper;