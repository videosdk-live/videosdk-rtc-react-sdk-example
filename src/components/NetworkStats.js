import UploadIcon from "../icons/NetworkStats/UploadIcon"
import DownloadIcon from "../icons/NetworkStats/DownloadIcon"
import RefreshIcon from "../icons/NetworkStats/RefreshIcon"
import RefreshCheck from "../icons/NetworkStats/RefreshCheck"
import { getNetworkStats } from "@videosdk.live/react-sdk";
import WifiOff from "../icons/NetworkStats/WifiOff";
import { useEffect, useState } from "react";
const NetworkStats = ({ }) => {

  const [error, setError] = useState("no-error-loading")

  const getNetworkStatistics = async () => {
    setError("no-error-loading");
    setLoading(true)
    try {
      const options = { timeoutDuration: 45000 }; // Set a custom timeout of 45 seconds
      const networkStats = await getNetworkStats(options);
      if (networkStats) {
        setLoading(false)
        setError("no-error");
      }
      console.log("Download Speed: ", networkStats["downloadSpeed"]);  // will return value in Mb/s
      setDownloadSpeed(networkStats["downloadSpeed"]);
      console.log("Upload Speed: ", networkStats["uploadSpeed"]); // will return value in Mb/s
      setUploadSpeed(networkStats["uploadSpeed"])
    } catch (ex) {
      if (ex == "Not able to get NetworkStats due to no Network") {
        setError("no-wifi")
      }
      if(ex == "Not able to get NetworkStats due to timeout"){
        setError("timeout")
      }
      console.log("Error in networkStats: ", ex);
    }
  }
  const [loading, setLoading] = useState(true)
  const [uploadSpeed, setUploadSpeed] = useState(null)
  const [downloadSpeed, setDownloadSpeed] = useState(null)
  const handleOnClick = () => {
    setLoading(true)
    getNetworkStatistics()
  }

  useEffect(() => { getNetworkStatistics(); }, [])
  return (
    <>
      <div className="flex flex-row auto-cols-max border border-[#3F4346] divide-x divide-[#3F4346] rounded-md bg-black opacity-80 h-9 ">
        {error == "no-error-loading" &&
        
        <div className="group inline-flex items-center gap-3 text-xs text-customGray-250 ml-3 ">
          Checking network speeds
          <RefreshCheck />
        </div> 
        }   
        
        
        {error == "no-error" && <>
        <div className="group inline-flex items-center gap-2 text-xs text-customGray-250 basis-1/2 w-32">
          <UploadIcon />
          {uploadSpeed} MBPS
        </div>
        <div className="group  inline-flex items-center gap-2 text-xs text-customGray-250 basis-1/2 w-32">
          <DownloadIcon />
          {downloadSpeed} MBPS
        </div>
        <div className="basis-1/6 flex items-center justify-center" onClick={handleOnClick}>
          <RefreshIcon />
        </div>
        </>
      }

      {error == "no-wifi" &&
      <>
      <div className="group inline-flex items-center gap-3 text-xs text-red-250 p-2 ">
        <WifiOff />
          You're offline! Check your connection
        </div>
        <div className=" flex items-center justify-center p-2" onClick={handleOnClick}>
        <RefreshIcon />
      </div>
      </>  
       }

      {error == "timeout" &&
      <>
      <div className="group inline-flex items-center gap-3 text-xs text-red-250 p-2 ">
          Something went wrong! Couldn't load data
        </div>
        <div className=" flex items-center justify-center p-2" onClick={handleOnClick}>
        <RefreshIcon />
      </div>
      </>  
       }
       
      
          

        
      </div>


    </>
  )
}
export default NetworkStats