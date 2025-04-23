import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { basicLight } from "@uiw/codemirror-theme-basic";
import { EditorView } from "@codemirror/view";
import candidateImg from "../../../assets/imageCand.png";
import AIImg from "../../../assets/imageAI.png";
import { IoMdStopwatch } from "react-icons/io";
import Header from "../../Header";
import { Button } from "../../../components/ui/button";
import { LuChevronRight } from "react-icons/lu";

const initialValue = "Start Typing Here" + "\n".repeat(35);

export default function CodeTest() {
  const handleSubmitCode = () => {
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header />
        <div className="flex items-center space-x-4 mr-5">
          <h4 className="text-[#757575] text-[14px] font-[600]">Skip</h4>
          <Button
            className="px-3 py-3 text-white  font-[500] text-[14px] rounded-md !bg-gradient-to-r from-[#111111] to-[#333333] bg-[length:100%_100%] bg-[100%] w-max"
            onClick={handleSubmitCode}
          >
            Submit & Next <LuChevronRight className="text-[14px]" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-6 p-6 gap-8">
        <div className="col-span-1 space-y-7">
          <img
            src={candidateImg}
            className="w-full h-[160px] rounded-lg border-2 border-[#c1c1c1]"
          />
          <img
            src={AIImg}
            className="w-full h-[160px] rounded-lg border-2 border-[#c1c1c1]"
          />
        </div>
        <div className="col-span-2">
          <div className="bg-white shadow-[0px_0px_6px_3px_rgba(219,219,219,1)] rounded-lg h-[calc(100vh-155px)] overflow-auto">
            <div className="bg-[#E6E6E6] text-center p-6 rounded-tl-lg rounded-tr-lg">
              <h2 className="text-[#1E1E1E] font-[400] text-base">
                Code Test Question
              </h2>
            </div>
            <div className="bg-[#FCB3AD] p-5">
              <h3 className="text-[#1E1E1E] font-[700] text-[14px] flex items-center space-x-3">
                <IoMdStopwatch className="text-[#FFFFFF] text-[22px]" />
                <span>Time: 5 min</span>
              </h3>
            </div>
            <div className="p-5 text-[14px] space-y-8 pt-8">
              <div>
                <h4 className="text-[#1E1E1E] font-[700]">Problem Statement</h4>
                <p className="text-[#757575] font-[400]">
                  Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti
                  eleifend eleifend fermentum adipiscing class. Urna viverra
                  taciti hendrerit diam magnis; per neque elementum. Felis
                  dignissim bibendum natoque congue pretium mattis quam. Laoreet
                  euismod{" "}
                </p>
              </div>
              <div>
                <h4 className="text-[#1E1E1E] font-[700]">Input</h4>
                <p className="text-[#757575] font-[400]">
                  Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti
                  eleifend eleifend fermentum adipiscing class. Urna viverra
                  taciti hendrerit diam magnis; per neque elementum. Felis
                  dignissim bibendum natoque congue pretium mattis quam. Laoreet
                  euismod{" "}
                </p>
              </div>
              <div>
                <h4 className="text-[#1E1E1E] font-[700]">Output</h4>
                <p className="text-[#757575] font-[400]">
                  Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti
                  eleifend eleifend fermentum adipiscing class. Urna viverra
                  taciti hendrerit diam magnis; per neque elementum. Felis
                  dignissim bibendum natoque congue pretium mattis quam. Laoreet
                  euismod{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-white shadow-[0px_0px_6px_3px_rgba(219,219,219,1)] rounded-lg">
            <div className="bg-[#E6E6E6] text-center p-6 rounded-tl-lg rounded-tr-lg">
              <h2 className="text-[#1E1E1E] font-[400] text-base">Response</h2>
            </div>
            <div className="p-5 text-[14px] space-y-8 pt-8">
              <CodeMirror
                style={{
                  height: "calc(100vh - 280px)",
                }}
                className="text-[#757575]"
                value={initialValue}
                width="100%"
                extensions={[xml(), EditorView.lineWrapping]}
                theme={basicLight}
                basicSetup={{ lineNumbers: true }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
