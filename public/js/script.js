const firstVideo = document.getElementById("firstVideo");
const secondVideo = document.getElementById("secondVideo");
const displaySizeFirst = {
  width: firstVideo.width,
  height: firstVideo.height,
};
const displaySizeSecond = {
  width: secondVideo.width,
  height: secondVideo.height,
};
const socket = io("/");

const myPeer = new Peer(undefined, {
  host: "/",
  port: 3001,
});

// faceapi.nets.tinyFaceDetector.loadFromUri("/models");

socket.on("user-disconnected", (userID) => {
  $.ajax({
    type: "POST",
    url: "/disconnected",
    success: (res) => {
      if (res.redirect) {
        window.location.href = res.redirect_url;
      }
    },
    error: (request, error) => {
      console.log("Request: " + JSON.stringify(request));
    },
  });
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    AddVideoStream(firstVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userVideoStream) => {
        AddVideoStream(secondVideo, userVideoStream);
      });
    });

    socket.on("user-connected", (newUserID) => {
      ConnectToNewUser(newUserID, stream);
    });
  })
  .catch((err) => {
    console.error(err);
  });

myPeer.on("open", (userID) => {
  socket.emit("join-room", ROOM_ID, userID);
});

const AddVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  // video.addEventListener("playing", () => {
  //   const canvas = faceapi.createCanvasFromMedia(video);
  //   faceapi.matchDimensions(canvas, displaySize);
  //   setInterval(async () => {
  //     const detections = await faceapi.detectAllFaces(
  //       video,
  //       new faceapi.TinyFaceDetectorOptions()
  //     );
  //     // console.log(detections[0]);
  //     canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  //     if (detections[0] != undefined) {
  //       const box = detections[0].box;
  //       const x = box.x;
  //       const y = box.y;
  //       const width = box.width;
  //       const height = box.height;
  //       const img = new Image();
  //       img.src = "/images/spider-man.png";
  //       canvas.getContext("2d").drawImage(img, x, y, width, height);
  //     }
  //   }, 100);
  //   document.body.append(canvas);
  // });
};

const ConnectToNewUser = (newUserID, stream) => {
  const call = myPeer.call(newUserID, stream);
  call.on("stream", (userVideoStream) => {
    AddVideoStream(secondVideo, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
};
