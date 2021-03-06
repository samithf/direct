import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Image from "next/image";

let rtcPeerConnection;
let myStream;
let creator;
let roomId;

const iceServers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
    {
      url: "turn:numb.viagenie.ca",
      credential: "Raosadi2",
      username: "h.samithdilhara@gmail.com",
    },
    {
      urls: ["turn:13.250.13.83:3478?transport=udp"],
      username: "YzYNCouZM1mhqhmseWk6",
      credential: "YzYNCouZM1mhqhmseWk6",
    },
    {
      url: "turn:turn.anyfirewall.com:443?transport=tcp",
      credential: "webrtc",
      username: "webrtc",
    },
  ],
};
console.log("process.env.NEXT_PUBLIC_SERVER", process.env.NEXT_PUBLIC_SERVER);
const socket = io(process.env.NEXT_PUBLIC_SERVER);

const room = () => {
  const router = useRouter();
  const { id: _roomId } = router.query;
  const meVideoRef = useRef(null);
  const peerVideoRef = useRef(null);
  const [mute, setMute] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  // useUnload((e) => {
  //   e.preventDefault();
  //   e.returnValue = "dfddgg";
  //   return "unloading";
  // });

  useEffect(() => {
    const path = window.location.pathname;
    roomId = _roomId ?? path.substring(path.length - 10);

    if (!roomId) {
      return router.push("/");
    }

    socket.emit("join", roomId);
    socket.on("created", () => {
      creator = true;
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: { width: 500, height: 500 },
        })
        .then((stream) => {
          myStream = stream;
          const video = meVideoRef.current;
          video.srcObject = stream;
          video.onloadedmetadata = function (e) {
            video.play();
          };
        })
        .catch((err) => {
          console.error(err);
          alert("Couldn't Access User Media");
        });
    });

    socket.on("joined", function () {
      creator = false;
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: { width: 500, height: 500 },
        })
        .then(function (stream) {
          myStream = stream;
          const video = meVideoRef.current;
          video.srcObject = stream;
          video.onloadedmetadata = function (e) {
            video.play();
          };
          socket.emit("ready", roomId);
        })
        .catch(function (err) {
          console.error(err);
          alert("Couldn't Access User Media");
        });
    });

    socket.on("ready", function () {
      if (creator) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidateFunction;
        rtcPeerConnection.ontrack = onTrackFunction;
        rtcPeerConnection.addTrack(myStream.getTracks()[0], myStream);
        rtcPeerConnection.addTrack(myStream.getTracks()[1], myStream);
        rtcPeerConnection
          .createOffer()
          .then((offer) => {
            rtcPeerConnection.setLocalDescription(offer);
            socket.emit("offer", offer, roomId);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });

    socket.on("offer", function (offer) {
      if (!creator) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidateFunction;
        rtcPeerConnection.ontrack = onTrackFunction;
        rtcPeerConnection.addTrack(myStream.getTracks()[0], myStream);
        rtcPeerConnection.addTrack(myStream.getTracks()[1], myStream);
        rtcPeerConnection.setRemoteDescription(offer);

        rtcPeerConnection
          .createAnswer()
          .then((answer) => {
            rtcPeerConnection.setLocalDescription(answer);
            socket.emit("answer", answer, roomId);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });

    socket.on("answer", function (answer) {
      rtcPeerConnection.setRemoteDescription(answer);
    });

    socket.on("candidate", function (candidate) {
      const iceCandidate = new RTCIceCandidate(candidate);
      rtcPeerConnection.addIceCandidate(iceCandidate);
    });

    socket.on("full", function () {
      alert("Room is full now, cannot connect!");
    });

    socket.on("leave", function () {
      creator = true;
      const peerVideo = peerVideoRef.current;
      if (rtcPeerConnection) {
        rtcPeerConnection.ontrack = null;
        rtcPeerConnection.onicecandidate = null;
        rtcPeerConnection.close();
        rtcPeerConnection = null;
      }
      if (peerVideo.srcObject) {
        peerVideo.srcObject.getTracks().forEach((track) => track.stop());
      }
      peerVideo.srcObject = null;
    });

    function onIceCandidateFunction(event) {
      if (event.candidate) {
        socket.emit("candidate", event.candidate, roomId);
      }
    }

    function onTrackFunction(event) {
      const peerVideo = peerVideoRef.current;
      // eslint-disable-next-line prefer-destructuring
      peerVideo.srcObject = event.streams[0];
      peerVideo.onloadedmetadata = function (e) {
        console.error(e);
        peerVideo.play();
      };
    }
  }, []);

  function toggleMic() {
    if (mute) {
      myStream.getTracks()[0].enabled = true;
    } else {
      myStream.getTracks()[0].enabled = false;
    }
    setMute((mute) => !mute);
  }

  function toggleCamera() {
    if (cameraOn) {
      myStream.getTracks()[1].enabled = false;
    } else {
      myStream.getTracks()[1].enabled = true;
    }
    setCameraOn((camera) => !camera);
  }

  function onClickLeave() {
    socket.emit("leave", roomId);

    const myVideo = meVideoRef.current;
    const peerVideo = peerVideoRef.current;

    if (myVideo.srcObject) {
      myVideo.srcObject.getTracks().forEach((track) => track.stop());
    }

    if (peerVideo.srcObject) {
      peerVideo.srcObject.getTracks().forEach((track) => track.stop());
    }

    if (rtcPeerConnection) {
      rtcPeerConnection.ontrack = null;
      rtcPeerConnection.onicecandidate = null;
      rtcPeerConnection.close();
      rtcPeerConnection = null;
    }
    myVideo.srcObject = null;
    peerVideo.srcObject = null;
    router.push("/");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-black flex justify-center items-center h-full">
        <div className="flex flex-col justify-center md:flex-row">
          <video
            ref={meVideoRef}
            id="me"
            muted
            width="500"
            height="500"
            className="bg-gray-200 border-gray-100 border bg-user bg-25% bg-center bg-no-repeat w-300 h-300  lg:w-500 lg:h-500"
          />
          <video
            ref={peerVideoRef}
            id="peer"
            width="500"
            height="500"
            className="bg-gray-200 border-gray-100 border bg-user bg-25% bg-center bg-no-repeat w-300 h-300  lg:w-500 lg:h-500"
          />
        </div>
      </div>
      <div className="h-20 bg-gray-300 text-white flex justify-around items-center p-5 md:justify-center">
        <div
          className="cursor-pointer md:mx-10"
          onClick={toggleMic}
          role="button"
          tabIndex={0}
        >
          {!mute && <Image src="/mic-on.svg" height={30} width={30} />}
          {mute && <Image src="/mic-off.svg" height={30} width={30} />}
        </div>
        <div
          className="cursor-pointer md:mx-10"
          onClick={toggleCamera}
          role="button"
          tabIndex={0}
        >
          {cameraOn && <Image src="/camera-on.svg" height={30} width={30} />}
          {!cameraOn && <Image src="/camera-off.svg" height={30} width={30} />}
        </div>
        <button
          className="px-5 py-2 rounded bg-red-700 text-white md:mx-10"
          onClick={onClickLeave}
          type="button"
        >
          Leave
        </button>
      </div>
    </div>
  );
};

export default room;
