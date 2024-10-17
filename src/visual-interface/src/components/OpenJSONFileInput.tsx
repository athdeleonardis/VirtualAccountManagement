import { useCallback } from "react"

const OpenJSONFileInput: <T>({ callback }: { callback: (data: T) => any }) => JSX.Element = ({ callback }) => {
  const doCallback = useCallback(async (e: React.SyntheticEvent) => {
    const { files } = e.target as typeof e.target & {
      files: File[]
    };
    if (files && files.length) {
      const data = JSON.parse(await files[0].text());
      callback(data);
    }
  }, []);

  return <input type='file' onChange={doCallback} />
}

export default OpenJSONFileInput;