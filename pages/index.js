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
    if (!code) return;
    router.push(`/room/${code}`);
  }

  return (
    <>
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
              />
              <button
                className="bg-yellow-400 font-semibold px-5 py-3 hover:bg-yellow-300 rounded absolute right-0"
                onClick={submitCode}
                type="button"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <span>Built with</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>By Samith Fernando</span>
      </footer>
    </>
  );
}
