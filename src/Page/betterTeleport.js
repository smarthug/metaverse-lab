import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { installFuncHotkey } from "use-github-hotkey";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { GUI } from "dat.gui";
import Loader from "../Util/loader";
import Light from "../Util/light";
import {SceneSetUp} from '../Util/setUp'
import Teleport from "../Util/teleport";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";


let teleport = { update: () => {} };

let water, sun;
let waterBody;
let waterGroup;

// legacy
let cameraRig = new THREE.Group();

let cameraOnlyRig = new THREE.Group();

let controller0;
let controller1;

let playerHandHelper = new THREE.Group();
let destHandHelper = new THREE.Group();


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

    installFuncHotkey(WaterLevelControl(5), "1");
    installFuncHotkey(WaterLevelControl(-5), "2");
    installFuncHotkey(TempTeleport, "t");

    installFuncHotkey(EnterXRHotkey, "x r");
    installFuncHotkey(postXR, "Escape");

    installFuncHotkey(Logger, "l");

    installFuncHotkey(translateMode, "w");
    installFuncHotkey(rotateMode, "e");
    installFuncHotkey(scaleMode, "r");

    installFuncHotkey(visibleToggle, "q");
    installFuncHotkey(lookAt, 'c')

    // installFuncHotkey(ElevationControl(1), "ArrowUp")

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function lookAt(){
    scene.traverse(obj => {
        if (obj.name === "graph") {
            // obj.lookAt(cameraRig.position)
            obj.lookAt(camera.position);
        }
    });
  }

  function translateMode() {
    transformControls.setMode("translate");
  }

  function rotateMode() {
    transformControls.setMode("rotate");
  }

  function scaleMode() {
    transformControls.setMode("scale");
  }

  function visibleToggle() {
    transformControls.visible = !transformControls.visible;
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

    //`${}/model/${models[tp]}.gltf`
    //`${}/fonts/helvetiker_regular.typeface.jsn`

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

  function EnterXRHotkey() {
    preXR();
    document.getElementById("VRButton").click();
  }

  function preXR() {
    cameraControls.dispose();
    teleport = new Teleport(renderer, cameraRig, cameraOnlyRig,controller0, controller1, {
      // destMarker: new THREE.Group(),
      rightHanded: true,
      playerHandHelper: playerHandHelper,
      destHandHelper: destHandHelper,
      multiplyScalar: 20,
      scene: scene,
    });

    // const session = renderer.xr.getSession();
    // session.addEventListener('end',postXR);
  }

  function postXR() {
    cameraControls.dispose();
    cameraRig.position.set(0, 0, 0);
    // esc 누르면 호출되는 ...
    const session = renderer.xr.getSession();
    session.end().then(() => {
      console.log("teleport dispose");
      teleport.dispose();
      //다끝나고 누를까 ...
      // 새 카메라 ?
      // camera.dipose();
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        100000
      );
      camera.position.y = 30;
      camera.position.z = 30;
      cameraRig.add(camera);
      cameraOnlyRig.add(camera);
      cameraControls = new CameraControls(camera, renderer.domElement);

      // camera controls 위치 디폴트로 이동시키기 ...

      // e 버튼 누르면 나오는 함수 여기서

      // scene.remove(interactiveGroup)
      // cameraRig.remove(interactiveGroup);
      // interactiveGroup.removeFromParent();
    });
  }

  function TempTeleport() {
    console.log("teleport");
    cameraRig.position.addScalar(100);
  }

  function WaterLevelControl(value) {
    return () =>
      new TWEEN.Tween(waterGroup.position)
        .to(
          {
            // x: p.x,
            y: waterGroup.position.y + value,
            // z: p.z,
          },
          500
        )
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
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
    scene.add(cube);
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
  }

  function Animate() {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);

    teleport.update();
    // TWEEN.update();

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
