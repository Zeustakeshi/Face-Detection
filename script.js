const video = document.getElementById("videoElm");
const buttonOpen = document.getElementById("button-open");
const app = document.getElementById("app");
let stream = null;
const openCamera = () => {
    if (navigator.mediaDevices.getUserMedia) {
        const getMeida = async () => {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {},
            });
            video.srcObject = stream;
        };

        getMeida();
    }
};

function closeCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(function (track) {
            if (track.kind === "video") {
                track.stop();
            }
        });
        stream = null;
    }
}

const loadFaceAPI = async () => {
    await faceapi.nets.faceLandmark68Net.loadFromUri("./weights");
    await faceapi.nets.faceRecognitionNet.loadFromUri("./weights");
    await faceapi.nets.faceExpressionNet.loadFromUri("./weights");
    await faceapi.nets.tinyFaceDetector.loadFromUri("./weights");
};

loadFaceAPI();

let interval;
video.addEventListener("playing", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.id = "canvasElm";
    app.appendChild(canvas);

    const updateCanvas = async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight,
        };
        const detectionsForSize = faceapi.resizeResults(
            detections,
            displaySize
        );
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, displaySize.width, displaySize.height);
        faceapi.draw.drawDetections(canvas, detectionsForSize);
        faceapi.draw.drawFaceLandmarks(canvas, detectionsForSize);
        faceapi.draw.drawFaceExpressions(canvas, detectionsForSize);
    };
    interval = setInterval(() => {
        updateCanvas();
    }, 500);
});

let isOpen = false;
buttonOpen.addEventListener("click", () => {
    if (!isOpen) {
        openCamera();
        isOpen = true;
    } else {
        isOpen = false;
        closeCamera();
    }
    clearInterval(interval);
});
