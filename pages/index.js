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
    <div className="w-3/4 mx-auto h-full flex items-center">
      <div className="p-10 rounded">
        <div className="mb-8">
          <h1 className="text-5xl mb-2">Premium Video Meetings.</h1>
          <h2 className="text-2xl">Now free for everyone.</h2>
        </div>
        <div>
          <button
            onClick={createCall}
            type="button"
            className="bg-yellow-400 px-5 py-3 rounded hover:bg-yellow-300"
          >
            New Meeting
          </button>
          <span className="inline-block px-5">OR</span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="p-3 outline-none rounded border border-gray-200"
            placeholder="Enter room ID"
          ></input>
          <button
            className="bg-yellow-400 px-5 py-3 hover:bg-yellow-300 rounded"
            onClick={submitCode}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
