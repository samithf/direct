import { useEffect, useRef } from "react";

const Video = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: 480, height: 320 },
      })
      .then((stream) => {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = function (e) {
          video.play();
        };
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  return <video ref={videoRef} muted></video>;
};

export default Video;
