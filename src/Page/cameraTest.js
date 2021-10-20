import { useEffect, useRef } from "react";

let myStream;
// let muted = false;
// let cameraOff = false;






export default function CameraTest() {
    const myFace = useRef();
    const camerasSelect = useRef();


    async function getMedia(deviceId) {
        const initialConstraints = {
            audio: false,
            video: { facingMode: "user" },
        };
        const cameraConstraints = {
            audio: false,
            video: { deviceId: { exact: deviceId } },
        };
        try {
            myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstraints);
            if (!deviceId) {
                await getCameras();
            }
            myFace.current.srcObject = myStream;
        } catch (e) {
            console.log(e);
        }
    }


    async function getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter((device) => device.kind === "videoinput");
            const currentCamera = myStream.getVideoTracks()[0]
            cameras.forEach((camera) => {
                const option = document.createElement("option");
                option.value = camera.deviceId;
                option.innerText = camera.label;
                if (currentCamera.label === camera.label) {
                    option.selected = true;
                }
                camerasSelect.current.appendChild(option);
            });
        } catch (e) {
            console.log(e);
        }
    }

    async function Init() {
        await getMedia();
    }

    useEffect(() => {
        Init();

        //eslint-disable-next-line
    }, [])

    return (
        <div>
            <div>CameraTest</div>
            <video ref={myFace} autoPlay width={400} height={400} />
            <select ref={camerasSelect} />
        </div>
    )
}