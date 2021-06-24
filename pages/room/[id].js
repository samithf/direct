import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Image from "next/image";
// import useUnload from "../../hooks/useUnload";
// const socket = io("http://localhost:4000");
let rtcPeerConnection;
let myStream;
let creator;
let roomId;

const iceServers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};
const socket = io('https://direct-tawny.vercel.app/')

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
    fetch('/api/socket').finally(() => {
     

      socket.on('connect', () => {
        console.log('connect')
        socket.emit('hello')
      })

      socket.on('hello', data => {
        console.log('hello', data)
      })

      socket.on('a user connected', () => {
        console.log('a user connected')
      })

      socket.on('disconnect', () => {
        console.log('disconnect')
      })
    })
  }, []) 

  useEffect(() => {
    const path = window.location.pathname;
    roomId = _roomId ?? path.substring(path.length - 10);

    if (!roomId) {
      return router.push("/");
    }

    fetch('/api/socket').finally(() => {
      const socket = io()

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
        alert("Room is full, cannot connect!");
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
        peerVideo.srcObject = event.streams[0];
        peerVideo.onloadedmetadata = function (e) {
          peerVideo.play();
        };
      }
    })

    
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
        <div className="flex justify-center">
          <video
            ref={meVideoRef}
            id="me"
            muted
            width="500"
            height="500"
            className="bg-gray-200 border-gray-100 border-2 bg-user bg-50% bg-center bg-no-repeat"
          ></video>
          <video
            ref={peerVideoRef}
            id="peer"
            width="500"
            height="500"
            className="bg-gray-200 border-gray-100 border-2 bg-user bg-50% bg-center bg-no-repeat"
          ></video>
        </div>
      </div>
      <div className="h-20 bg-gray-300 text-white flex justify-center items-center p-10">
        <div className="mx-10 cursor-pointer" onClick={toggleMic}>
          {!mute && <Image src="/mic-on.svg" height={40} width={40} />}
          {mute && <Image src="/mic-off.svg" height={40} width={40} />}
        </div>
        <div className="mx-10 cursor-pointer" onClick={toggleCamera}>
          {cameraOn && <Image src="/camera-on.svg" height={40} width={40} />}
          {!cameraOn && <Image src="/camera-off.svg" height={40} width={40} />}
        </div>
        <button
          className="mx-10 px-10 py-3 rounded bg-red-700 text-white"
          onClick={onClickLeave}
        >
          Leave
        </button>
      </div>
    </div>
  );
};

export default room;
