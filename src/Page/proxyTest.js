import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { installFuncHotkey } from "use-github-hotkey";
import Loader from "../Util/loader";
import Light from "../Util/light";
import { SceneSetUp } from '../Util/setUp'
import Teleport from "../Util/teleport";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";


// import * as What from 'test';

// console.log(What)

let teleport = { update: () => { } };
// legacy
let cameraRig = new THREE.Group();
let cameraOnlyRig = new THREE.Group();

let controller0;
let controller1;

let playerHandHelper = new THREE.Group();
let destHandHelper = new THREE.Group();

let myDestMarker


CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls, transformControls;
const clock = new THREE.Clock();

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    const datGuiConRef = useRef();

    useEffect(() => {
        Init();
        // teleport setup func needed
        TeleportSetUp();

        // betterSetup();

        installFuncHotkey(TempTeleport, "t");
        installFuncHotkey(Logger, "l");

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // setOpacity( myGroup, 0.5 );
    function setOpacity(obj, opacity) {
        obj.children.forEach((child) => {
            setOpacity(child, opacity);
        })
        if (obj.material) {
            obj.material.transparent = true;
            obj.material.opacity = opacity;
        };
    };


    function preXR() {
        cameraControls.dispose();
        teleport = new Teleport(renderer, cameraRig, cameraOnlyRig, controller0, controller1, {
            destMarker: myDestMarker,
            rightHanded: true,
            playerHandHelper: playerHandHelper,
            destHandHelper: destHandHelper,
            multiplyScalar: 20,
            scene: scene,
        });

        // const session = renderer.xr.getSession();
        // session.addEventListener('end',postXR);
    }


    function Logger() {
        console.log(scene);
        console.log(transformControls);
        // console.log
    }


    function TeleportSetUp() {
        // cameraRig = new THREE.Group();
        controller0 = renderer.xr.getController(0);
        controller1 = renderer.xr.getController(1);

        // cameraRig.add(camera);
        cameraRig.add(controller0);
        cameraRig.add(controller1);

        const controllerModelFactory = new XRControllerModelFactory();

        let controllerGrip0 = renderer.xr.getControllerGrip(0);
        controllerGrip0.add(
            controllerModelFactory.createControllerModel(controllerGrip0)
        );

        let controllerGrip1 = renderer.xr.getControllerGrip(1);
        controllerGrip1.add(
            controllerModelFactory.createControllerModel(controllerGrip1)
        );

        cameraRig.add(controllerGrip0);
        cameraRig.add(controllerGrip1);

        const fontLoader = new THREE.FontLoader();

        fontLoader.load(`fonts/helvetiker_regular.typeface.json`, (font) => {
            const geometry = new THREE.TextGeometry("From", {
                font: font,
                size: 0.05,
                height: 0.05,
            });

            playerHandHelper.add(
                new THREE.Mesh(geometry, new THREE.MeshNormalMaterial())
            );

            const geometry2 = new THREE.TextGeometry("To", {
                font: font,
                size: 0.05,
                height: 0.05,
            });

            destHandHelper.add(
                new THREE.Mesh(geometry2, new THREE.MeshNormalMaterial())
            );
        });


        cameraOnlyRig.add(camera);
    }







    function TempTeleport() {
        console.log("teleport");
        cameraRig.position.addScalar(100);
    }




    function Init() {
        THREE.Cache.enabled = true;
        scene = new THREE.Scene();
        scene.add(cameraRig);
        scene.add(cameraOnlyRig)

        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100000
        );
        // camera.up.fromArray([0, 0, 1]);
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvasRef.current,
            logarithmicDepthBuffer: true,
        });
        renderer.xr.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.xr.setFramebufferScaleFactor(2.0);

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        // scene.add(cube);
        // camera.position.y = 150;
        // camera.position.z = 150;

        camera.position.y = 30;
        camera.position.z = 30;

        cameraControls = new CameraControls(camera, renderer.domElement);

        let vrBtnElem = VRButton.createButton(renderer);
        // vrBtnElem.addEventListener('click', () => {
        //     console.log("hello XR")
        // })

        vrBtnElem.addEventListener("click", preXR);

        vrButtonConRef.current.appendChild(vrBtnElem);

        renderer.setAnimationLoop(Animate);

        controller0 = renderer.xr.getController(0);
        controller1 = renderer.xr.getController(1);

        cameraRig.add(camera);
        cameraRig.add(controller0);
        cameraRig.add(controller1);
        // window.addEventListener("resize", () => resizer(camera, renderer));

        SceneSetUp(scene)
        Light(scene)
    }

    function Animate() {
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        teleport.update();


        renderer.render(scene, camera);
    }

    return (
        <div
            style={{
                height: "100vh",
                overflowX: "hidden",
                overflowY: "hidden",
            }}
            ref={containerRef}
        >
            <canvas ref={canvasRef} />
            <div ref={datGuiConRef}></div>
            <div ref={vrButtonConRef}></div>
        </div>
    );
}



// const monster1 = { eyeCount: 4 };

// const handler1 = {
//   set(obj, prop, value) {
//     if ((prop === 'eyeCount') && ((value % 2) !== 0)) {
//       console.log('Monsters must have an even number of eyes');
//     } else {
//       return Reflect.set(...arguments);
//     }
//   }
// };

// const proxy1 = new Proxy(monster1, handler1);

// proxy1.eyeCount = 1;
// // expected output: "Monsters must have an even number of eyes"

// console.log(proxy1.eyeCount);
// // expected output: 4

// proxy1.eyeCount = 2;
// console.log(proxy1.eyeCount);
// // expected output: 2


const player = {velocity:0}

const handler = {
    set: (obj,prop, value) =>  {
        if((prop === "velocity")) {

            obj[prop] = value
            if(value < 0.7){
                console.log("set Walk to Run")
                return true
            }
        }

        return true
    }
}

const playerProxy = new Proxy(player, handler)

playerProxy.velocity = 0.6
console.log(playerProxy)
console.log(player)