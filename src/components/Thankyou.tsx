import React, { useEffect, useState } from "react";
import profileImageLogin from "../assets/image22.png";
import backgroundLoginProfile from "../assets/image28.png";
import { LoadingSpinner } from "./Loader";
import Header from "./Header";

export default function Thankyou() {
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
          <div className="font-[700] text-[#1E1E1E] text-[24px] space-y-5">
            <h5>
              Do not close this window. Saving your <br />
              interview session.
            </h5>

            <h5>
              This may take a few min. This session <br /> will automatically
              close once saved.
            </h5>
          </div>
        </div>

        <div className="flex items-center justify-center w-[50%]">
          <LoadingSpinner />
        </div>
      </section>
    </>
  );
}
