import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import CameraControls from "camera-controls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { install } from '@github/hotkey'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

CameraControls.install({ THREE: THREE });

let reflector;
let cameraRig = new THREE.Group();
let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();

    const teleportBtnRef = useRef();
    const waterToggleBtnRef = useRef();

    useEffect(() => {
        Init();
        ReflectorInit();
        install(teleportBtnRef.current, "t")
        install(waterToggleBtnRef.current, "w")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    function ReflectorInit() {
        reflector = new Reflector(new THREE.PlaneGeometry(12, 12), {
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio
        });
        reflector.position.x = 1;
        reflector.position.y = 1.5;
        reflector.position.z = - 3;
        reflector.rotation.y = - Math.PI / 4;
        // TOFIX: Reflector breaks transmission
        reflector.name = "reflector"
        scene.add(reflector);

        const frameGeometry = new THREE.BoxGeometry(12.1, 12.1, 0.1);
        const frameMaterial = new THREE.MeshPhongMaterial();
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = - 0.07;
        reflector.add(frame);
    }

    function Init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100000
        );
        camera.position.y = 35;
        camera.position.z = 35;
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvasRef.current,
        });
        renderer.xr.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.xr.setFramebufferScaleFactor(2.0);
        renderer.setAnimationLoop(Animate);

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cameraControls = new CameraControls(camera, renderer.domElement);


        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));


        cameraRig.add(camera);

        scene.add(cameraRig)


        const background = new THREE.CubeTextureLoader()
            .setPath("textures/cube/MilkyWay/")
            .load([
                "dark-s_px.jpg",
                "dark-s_nx.jpg",
                "dark-s_py.jpg",
                "dark-s_ny.jpg",
                "dark-s_pz.jpg",
                "dark-s_nz.jpg",
            ]);

        scene.background = background;

    }



    function Animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        cameraControls.update(delta);



        renderer.render(scene, camera);
    }

    function teleport() {
        cameraRig.position.add(new THREE.Vector3(10, 10, 10));

        let roundedCameraMatrix = cameraRig.children[0].matrix.elements.map((v) =>
            Math.round(v)
        );
        let roundedCameraMatrixWorld = cameraRig.children[0].matrixWorld.elements.map(
            (v) => Math.round(v)
        );
   
        console.log(`camera.matrix : ${roundedCameraMatrix}`);
        console.log(`camera.matrixWorld : ${roundedCameraMatrixWorld}`);
    }


    function waterToggle() {
        if (scene.getObjectByName("reflector") === undefined) {
            scene.add(reflector)
        } else {
            scene.remove(reflector)
        }
    }

    return (
        <div style={{
            height: "100vh",
            overflowX: "hidden",
            overflowY: "hidden",
        }}
            ref={containerRef}
        >
            <div style={{ position: "absolute" }}>
                <button ref={teleportBtnRef} onClick={teleport}>Press 't' to teleport</button>
                <button ref={waterToggleBtnRef} onClick={waterToggle}>Press 'w' to Add/Remove the mirror in the scene</button>
            </div>
            <canvas ref={canvasRef} />
            <div ref={vrButtonConRef}></div>
        </div>
    );
}
