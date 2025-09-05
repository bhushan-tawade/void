import React from "react";
import DarkVeil from "../utils/DarkVeil";

const LandingPage = () => {
  return (
    <>
      {/* Fixed DarkVeil Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil />
      </div>

      {/* Section 1 */}
      <div className="bg-transparent text-white w-full h-screen relative quicksand">
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center leading-tight">
          <p className="mt-2 text-lg text-gray-300">
            AI-Powered Collaborative Whiteboard
          </p>
          <h1 className="text-[20rem] quicksand text-white">VOID</h1>
          <button className="getStarted quicksand font-semibold">
            Get Started
          </button>
        </div>
      </div>

      {/* Section 2 */}
      <div className="w-full h-screen z-10  flex relative justify-center items-center">
        <div className="text-center px-4 w-[80%] h-[80%] flex flex-col justify-center items-center glassMorph1">
        </div>
      </div>
    </>
  );
};

export default LandingPage;
