import { useRouter } from "next/router";
import randomstring from "randomstring";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function generateRoom() {
    return randomstring.generate(10);
  }

  function createCall() {
    const roomId = generateRoom();
    router.push(`/room/${roomId}`);
  }

  function submitCode() {
    router.push(`/room/${code}`);
  }

  return (
    <div className="w-full mx-auto h-full flex items-center md:w-3/4">
      <div className="p-10 rounded relative bottom-28 md:bottom-0">
        <div className="mb-8">
          <h1 className="text-5xl mb-2">Premium Video Meetings.</h1>
          <h2 className="text-2xl">Now free for everyone.</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center">
          <button
            onClick={createCall}
            type="button"
            className="bg-yellow-400 px-5 py-3 rounded w-full hover:bg-yellow-300 md:w-1/2 font-semibold"
          >
            New Meeting
          </button>
          <span className="inline-block p-5">OR</span>
          <div className="relative w-full md:w-min">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="p-3 outline-none rounded shadow-md font-semibold"
              placeholder="Enter room ID"
            ></input>
            <button
              className="bg-yellow-400 font-semibold px-5 py-3 hover:bg-yellow-300 rounded absolute right-0"
              onClick={submitCode}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
