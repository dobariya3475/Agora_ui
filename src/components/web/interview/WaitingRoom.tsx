import Header from "src/components/Header";
import React, { useEffect, useState } from "react";
import backgroundLoginProfile from "../../../assets/image28.png";
import profileImageLogin from "../../../assets/image22.png";
import arrow from "../../../assets/arrow.png";
import { Button } from "src/components/ui/button";
import { BsCameraVideoOff } from "react-icons/bs";
import { BsCameraVideo } from "react-icons/bs";
import { FiHeadphones } from "react-icons/fi";
import Webcam from "react-webcam";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Checkbox } from "src/components/ui/checkbox";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getCandidateName, startInterview, uploadCandidateImage } from "src/service/Interview";
import { Label } from "src/components/ui/label";

export default function WaitingRoom() {
  const [videoOn, setVideoOn] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [userName, setUserName] = useState("");
  const webcamRef = React.useRef<any>(null);
  const [imageSrc, setImageSrc] = useState<any>("");
  const navigate = useNavigate();
  const capture = React.useCallback(() => {
    if (webcamRef) {
      const imageSrc = webcamRef?.current?.getScreenshot();
      setImageSrc(imageSrc);
      setShowCaptureModal(false);
    }
  }, [webcamRef]);
  const [videoStream, setVideoStream] = useState<any>(null);
  useEffect(() => {
    if (videoOn && audioOn) {
      navigator.mediaDevices
        .getUserMedia({
          video: videoOn,
          audio: audioOn,
        })
        .then((stream) => {
          setVideoStream(stream);
          setShowCapture(true);
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    }
    const stopCamera = () => {
      console.log("first")
      if (videoStream) {
  
        videoStream.getTracks().forEach((track:any) => track.stop());
  
        setVideoStream(null);
  
      }
  
    };
    return ()=>{
      stopCamera()
    }
  
  }, [videoOn, audioOn,]);

  useEffect(()=>{
    getUserInfo();
  },[])

  const getUserInfo = async ()=>{
    try {
      const response = await getCandidateName();
      if(response.success){
        setUserName(response.data.name)
        localStorage.setItem("username",response.data.name);
        localStorage.setItem("positionInfo",response.data.positionInfo)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const startInterviewProcess = async ()=>{
    try {
      // const response:any = await startInterview();
      // if(response.success){
      //   localStorage.setItem("threadId" ,response.data.threadId )
        
      // }else{
      //   console.error(response)
      // }
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    mediaDevices.forEach(async (device) => {
        if (device.kind === "videoinput" || device.kind === "audioinput") {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach((track) => track.stop());
        }
    });
      const candidateResponse:any = await uploadCandidateImage({screenShot : imageSrc });
        if(candidateResponse.success){
            navigate('/interview-room')
        }else{
          console.error(candidateResponse)
        }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <main className="h-screen w-screen">
      <Header />
      <div className="h-[calc(100%-80px)] grid grid-cols-2 mx-auto items-center px-24 ">
        {!showCapture ? (
          <>
            <div>
              <div
                style={{
                  backgroundImage: `url(${backgroundLoginProfile})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPositionY: "center",
                  backgroundSize: "50px",
                }}
              >
                <img
                  src={profileImageLogin}
                  width={50}
                  height={50}
                  style={{
                    borderRadius: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                  }}
                />
              </div>
              <div className="flex flex-col space-y-4 mt-2 ">
                <div className="text-[#1E1E1E] font-semibold text-[24px] w-96">
                  {`Hi ${userName} , this is Ann.`}
                  <br/>
                  <p>Let me help you setup for the video
                  interview.</p>
                </div>
                <p className="text-[#757575] text-[16px] font-[500]">
                  For the video interview to start, please enable <br/>the camera and
                  the audio options.
                </p>
              </div>
            </div>
            <div className="relative mx-auto">
              <div
                className={`w-[566px] h-[354px] ${
                  videoOn ? "" : "shadow-[2px_4px_20px_0px_#00000014] py-28"
                } flex flex-col items-center gap-5 relative`}
              >
                {!videoOn && (
                  <>
                    <Button
                      className="w-44"
                      onClick={() => {
                        setVideoOn(!videoOn);
                      }}
                    >
                      {!videoOn ? <BsCameraVideo /> : <BsCameraVideoOff />}Start
                      Camera
                    </Button>
                    <Button className="w-44">
                      <FiHeadphones />
                      Join Audio
                    </Button>
                  </>
                )}
                {videoOn && (
                  <>
                  <div className="w-[566px] h-[354px] ">
                    <Webcam ref={webcamRef}  className="w-full h-full object-fill" />

                  </div>
                    
                    <div className="absolute top-[100px] flex flex-col items-center gap-5">
                      <Button
                        className="w-44"
                        onClick={() => {
                          setVideoOn(!videoOn);
                        }}
                      >
                        {videoOn ? <><BsCameraVideoOff /> Stop Camera</> : <><BsCameraVideo />Start Camera</> }
                        {/* {videoOn  ? 'Stop Camera ' : } */}
                      </Button>
                      <Button
                        className="w-44"
                        onClick={() => {
                          setAudioOn(true);
                        }}
                      >
                        <FiHeadphones />
                        Join Audio
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <div className="absolute left-[-402px] lg:left-[-228px] bottom-0">
                <img src={arrow} width={``} className="w-[300px] lg:w-[200px] " alt="arrow" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div
                style={{
                  backgroundImage: `url(${backgroundLoginProfile})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPositionY: "center",
                  backgroundSize: "50px",
                }}
              >
                <img
                  src={profileImageLogin}
                  width={50}
                  height={50}
                  style={{
                    borderRadius: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                  }}
                />
              </div>
              <div className="flex flex-col space-y-4 mt-2 ">
                <span className="text-[#1E1E1E] font-semibold text-base">
                  For a smooth assessment, please ensure that you review &
                  adhere to the below guidelines.
                </span>
                <ul className="text-[#757575] text-xs list-disc ml-4">
                  <li>
                    Ensure that you remain visible on camera throughout the
                    entire interview. You must be alone during the interview
                    process.
                  </li>
                  <li>
                    Once the interview begins, it cannot be paused until it is
                    finished.
                  </li>
                  <li>
                    Any other conversations or taking phone calls while the
                    interview is in progress, is not allowed.
                  </li>
                  <li>
                    This session will be recorded and the recording will be used
                    to assess your performance.
                  </li>
                  <li>
                    In the event of detection of any malpractice, your
                    application would be disqualified.
                  </li>
                </ul>
                <span className="text-[#1E1E1E] font-semibold  text-xs">Interview duration: approx. 45 min</span>
                <div className="flex gap-2 items-center text-xs">
                  <Checkbox id="terms" defaultChecked={acceptTerms}  onCheckedChange={(checked : boolean)=>{
                    setAcceptTerms(checked)}} /><Label htmlFor="terms" className="cursor-pointer" >I acknowledge and agree to follow the guidelines</Label>
                </div>
                <div className="text-center ">
                  <Button className="px-14 text-xs" onClick={()=>{
                    if(!acceptTerms){
                      toast.error("Please accept terms And Conditions")
                    }else if(!imageSrc){
                      toast.error("Please capture your Photo")
                    }else{
                      startInterviewProcess()
                    }
                  }} >Start the Interview</Button>
                </div>
              </div>
            </div>
            <div className=" mx-auto">
              <div className="flex flex-col">
                <span className="font-semibold text-xs">Your image</span>
                <span className="text-xs">
                  This would be included as part of your interview assessment
                  report
                </span>
              </div>
              <div
                className={` w-[566px] h-[354px] shadow-[2px_4px_20px_0px_#00000014] py-28 bg-[#E6E6E6] rounded-md flex justify-center items-center mt-3  `}
                style={{ backgroundImage: imageSrc ? `url(${imageSrc})` : 'none' }}
              >
              {!imageSrc&& <Button className="px-16 text-xs"
                  onClick={() => {
                    if(!acceptTerms){
                        toast.error("Please accept terms and condidtions")
                    }else{
                      setShowCaptureModal(true);

                    }
                  }}
                >
                  Capture Picture
                </Button>}
              </div>
              {imageSrc && <div className="text-center mt-4"><span className="text-[#226CFF] cursor-pointer " onClick={()=>setShowCaptureModal(true)} >Recapture</span> </div>}
            </div>
          </>
        )}
      </div>
      <div>
        {showCaptureModal && (
          <Dialog open={showCaptureModal} onOpenChange={setShowCaptureModal}>
            <DialogContent className="bg-white border-none p-0 [&>button:last-child]:text-black [&>button:last-child]:text-[18px] max-w-[614px]">
              <DialogHeader className="pt-4 px-4">
                <DialogTitle className="font-bold text-2xl text-[#1E1E1E] ">
                  Capture Your Image
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 border-t-[1px]  border-[#757575] border-opacity-20 ">
                <span className="font-normal text-sm leading-[18px] text-[#757575] py-3 ">
                  This would be included as part of your interview assessment
                  report
                </span>
                <div className=" w-[566px] h-[354px]">
                <Webcam ref={webcamRef} className="mt-5 rounded-md w-full h-full object-fill " />

                </div>

                <DialogFooter className="!justify-end pt-6 ">
                  <Button
                    onClick={capture}
                      className=" font-[500] text-[16px] text-[#F5F5F5] focus-visible:ring-0 focus-visible:ring-offset-0  bg-[linear-gradient(90.11deg,#111111_-2.78%,#333333_99.29%)] border p-3 rounded-lg border-solid border-[#2C2C2C]"
                  >
                    Capture
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </main>
  );
}
