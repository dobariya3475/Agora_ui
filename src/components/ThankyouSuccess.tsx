import React, { useEffect, useRef, useState } from "react";
import profileImageLogin from "../assets/image22.png";
import backgroundLoginProfile from "../assets/image28.png";
import { LoadingSpinner } from "./Loader";
import Header from "./Header";

export default function ThankyouSuccess() {
  const [showDiv, setShowDiv] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDiv(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  

  return (
    <>
      <Header />
      <section className="flex items-center justify-between  h-[calc(100vh-160px)]">
        <div className=" md:px-16 2xl:px-40 w-[50%]">
          <div
            style={{
              backgroundImage: `url(${backgroundLoginProfile})`,
              backgroundRepeat: "no-repeat",
              backgroundPositionY: "center",
              backgroundSize: "70px",
            }}
          >
            <img
              src={profileImageLogin}
              width={70}
              height={70}
              style={{
                borderRadius: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px",
              }}
            />
          </div>
          {showDiv ? (
            <div className="space-y-5">
              <h5 className="font-[700] text-[#1E1E1E] text-[24px] ">
                Thank you for taking time and <br /> joining us for the video
                interview.
              </h5>

              <h5 className="font-[700] text-[#1E1E1E] text-[24px] ">
                Your interview has been saved <br /> succesfully
              </h5>
            </div>
          ) : (
            <div className="space-y-5">
              <h5 className="font-[700] text-[#1E1E1E] text-[24px] ">
                Thank you for taking time and joining <br /> us for the video
                interview.
              </h5>

              <h5 className="font-[400] text-[#757575] text-base ">
                Do not close this window. Saving your interview session. <br />
                This may take a few min. This session will automatically close
                once saved.
              </h5>
            </div>
          )}
        </div>
        {!showDiv && (
          <div className="flex items-center justify-center w-[50%]">
            <LoadingSpinner />
          </div>
        )}
      </section>
    </>
  );
}
