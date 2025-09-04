import React from "react";
import DarkVeil from "../utils/DarkVeil";

const LandingPage = () => {
  return (
    <>
      <div className="bg-zinc-950 text-white w-full h-screen relative quicksand">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <DarkVeil />
        </div>
        {/* Content Layer */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center leading-tight ">
          <p className="mt-2 text-lg text-gray-300">
            AI-Powered Collaborative Whiteboard
          </p>
          <h1 className="text-[20rem] quicksand text-white">VOID</h1>
          <button className="getStarted quicksand font-semibold">
            Get Started
          </button>
        </div>
      </div>
      <div className="w-full h-[100vh] z-10 bg-black flex relative justify-center items-center">
      </div>
    </>
  );
};

export default LandingPage;
