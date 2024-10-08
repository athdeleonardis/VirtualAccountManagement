import fileDownload from "js-file-download";

const DownloadJSONFileButton = ({ children, fileName, data }: { children: React.ReactNode, fileName: string, data: object | object[] }) => {
  return <button className='DataDownloadButton' onClick={() => fileDownload(JSON.stringify(data), fileName+".json")}>{children}</button>
}

export default DownloadJSONFileButton;
