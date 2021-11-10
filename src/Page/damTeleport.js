import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import Axios from "axios";

import CameraControls from "camera-controls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

import { installFuncHotkey } from "use-github-hotkey";

import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { GUI } from "dat.gui";

import Loader from "../Util/loader";
import Light from "../Util/light";

import Teleport from "../Util/teleport";
import { WsGraphView } from "../Util/graph";
import { nameCard } from "../Util/spriteText";

// import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';
// import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";

import * as What from 'https://cdn.skypack.dev/three@<0.134>';

console.log(What)

const url =
  "http://booster-app.account7172.workers.dev/openapi-data/service/pubd/dam/sluicePresentCondition/mnt/list?damcode=1012110&stdt=2021-09-05&eddt=2021-09-05&numOfRows=144&pageNo=undefined&serviceKey=ejdrD89pyah0JlAaICprH0xOAEp0tAxvExhm2p0DT5Ulq2MskjlekFH7kFIAEt6d16gjJ2scGwRSLG4Rr1HUiA==";

let teleport = { update: () => {} };

let water, sun;
let waterBody;
let waterGroup;

// let elevationController
// let azimuthController

// legacy
let cameraRig = new THREE.Group();

let cameraOnlyRig = new THREE.Group();

let controller0;
let controller1;

let playerHandHelper = new THREE.Group();
let destHandHelper = new THREE.Group();

// import { resizer, SceneSetUp } from "../Utils/utils";

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
    EnvSetUp();
    // teleport setup func needed
    TeleportSetUp();
    APICall();

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

  function APICall() {
    Axios.get(url).then((res) => {
      // console.log(res);
      // console.log(res.data.response.body.items.item)
      const stct = 0;
      const edct = 24;
      const items = res.data.response.body.items.item;
      let wsData = {
        obsrdtmnt: [],
        lowlevel: [],
        rf: [],
        inflowqy: [],
        totdcwtrqy: [],
        rsvwtqy: [],
        rsvwtrt: [],
      };
      if (stct > edct || stct < 0 || edct > 24) {
        for (let i in items) {
          wsData.inflowqy.push(items[i].inflowqy);
          wsData.lowlevel.push(items[i].lowlevel);
          wsData.obsrdtmnt.push(items[i].obsrdtmnt);
          wsData.rf.push(items[i].rf);
          wsData.rsvwtqy.push(items[i].rsvwtqy);
          wsData.rsvwtrt.push(items[i].rsvwtrt);
          wsData.totdcwtrqy.push(items[i].totdcwtrqy);
        }
      } else {
        for (let i = stct * 6; i < edct * 6; i++) {
          if (!items[i]) continue;
          wsData.inflowqy.push(items[i].inflowqy);
          wsData.lowlevel.push(items[i].lowlevel);
          wsData.obsrdtmnt.push(items[i].obsrdtmnt);
          wsData.rf.push(items[i].rf);
          wsData.rsvwtqy.push(items[i].rsvwtqy);
          wsData.rsvwtrt.push(items[i].rsvwtrt);
          wsData.totdcwtrqy.push(items[i].totdcwtrqy);
        }
      }
      // let tmp = res.data.response.body.items.item

      let totdcwtrqy = WsGraphView(wsData, "totdcwtrqy");
      totdcwtrqy.scale.multiplyScalar(0.0001);
      totdcwtrqy.position.set(-30, 60, -150);
      scene.add(totdcwtrqy);

      let rf = WsGraphView(wsData, "rf");
      rf.scale.multiplyScalar(0.0001);
      rf.position.set(-80, 100, -150);
      scene.add(rf);

      let inflowqy = WsGraphView(wsData, "inflowqy");
      inflowqy.scale.multiplyScalar(0.0001);
      inflowqy.position.set(20, 5, 250);
      scene.add(inflowqy);

      let rsvwtqy = WsGraphView(wsData, "rsvwtqy");
      rsvwtqy.scale.multiplyScalar(0.0001);
      rsvwtqy.position.set(10, 100, 250);
      scene.add(rsvwtqy);

      let rsvwtrt = WsGraphView(wsData, "rsvwtrt");
      rsvwtrt.scale.multiplyScalar(0.0001);
      rsvwtrt.position.set(50, 100, 250);
      scene.add(rsvwtrt);

      // let totdcwtrqy = WsGraphView(wsData, "totdcwtrqy")
      // totdcwtrqy.scale.multiplyScalar(0.0001)
      // totdcwtrqy.position.set()
      // scene.add(totdcwtrqy)

      // let result = tmp.slice(tmp.length - 10)
      // console.log(result)
      // // let data = []
      // let data = tmp.map((v, i) => {
      //   return v.totdcwtrqy
      // })
      // console.log(data)
      // setData(res.data.response.body.items.item)
    });
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
      // cameraRig.add(camera);
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

  // function ElevationControl(value) {

  //     return () => elevationController.setValue(elevationController.getValue() + value)
  // }

  // function AzimuthControl(value) {

  //     return () => azimuthController.setValue(azimuthController.getValue() + value)
  // }

  function EnvSetUp() {
    sun = new THREE.Vector3();

    // Water
    waterGroup = new THREE.Group();

    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
    // const waterGeometry = new THREE.BoxGeometry( 100, 100,100 );
    const waterBodyGeo = new THREE.BoxGeometry(1000, 100, 1000);

    water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "textures/waternormals.jpg",
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      // sunDirection: new THREE.Vector3(),
      sunDirection: new THREE.Vector3(100, 100, 100),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });
    //0x7F7F7F
    water.rotation.x = -Math.PI / 2;
    const waterBodyMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.62,
      color: 0x001e0f,
      side: THREE.DoubleSide,
    });
    waterBody = new THREE.Mesh(waterBodyGeo, waterBodyMat);

    waterBody.position.y = -50.01;

    waterGroup.add(waterBody);
    waterGroup.add(water);
    scene.add(waterGroup);

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const parameters = {
      elevation: 2,
      azimuth: 180,
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {
      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
      const theta = THREE.MathUtils.degToRad(parameters.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      sky.material.uniforms["sunPosition"].value.copy(sun);
      water.material.uniforms["sunDirection"].value.copy(sun).normalize();

      scene.environment = pmremGenerator.fromScene(sky).texture;
    }

    updateSun();

    // GUI

    const gui = new GUI({ autoPlace: false });

    const folderSky = gui.addFolder("Sky");
    // elevationController = folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
    // azimuthController = folderSky.add(parameters, 'azimuth', - 180, 180, 0.1).onChange(updateSun);
    folderSky.open();

    // Loader("https://ipfs.io/ipfs/QmRayg561oGQiL8jMHmy5g1ZWeACQ7gHHf4DdNZ84tU3Lp").then((gltf) => {
    //     console.log(gltf)
    //     scene.add(gltf)
    //     gltf.position.set(50, -650, -600)
    //     gltf.scale.multiplyScalar(100)
    // })

    // Loader("models/mergedDam.glb").then((gltf) => {
    //     console.log(gltf)
    //     scene.add(gltf)
    //     gltf.position.set(50, -650, -600)
    //     gltf.scale.multiplyScalar(100)
    // })

    Loader(
      "https://ipfs.io/ipfs/QmabJksgNiWHd8YJ5razFpaJAz6VWc2nBTGSNMFLyXV5MJ"
    ).then((gltf) => {
      // console.log(gltf)
      scene.add(gltf);
      gltf.position.set(50, -650, -600);
      gltf.scale.multiplyScalar(100);
    });

    Light(scene);

    // let avatar = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), cubeMaterials);
    // scene.add(avatar)
    // avatar.position.set(0, 5, 0)

    // Loader("models/avatar2.glb").then((gltf) => {
    //     scene.add(gltf)
    //     gltf.position.set(0, 5, 0)
    //     console.log(gltf)
    //     // gltf.scale.multiplyScalar(100)
    // })

    Loader(
      "https://d1a370nemizbjq.cloudfront.net/6aea7546-37ef-4653-b4d1-713f9ef67ced.glb"
    ).then((gltf) => {
      let tmp = new THREE.Group();
      tmp.add(gltf);
      //   scene.add(gltf);
      //   gltf.position.set(7.591, 62.06, -135.4892);
      // {x: 7.591179294288835, y: 62.064164713769046, z: -135.48920260318448}
      console.log(gltf);
      gltf.children[0].getObjectByName("Wolf3D_Hands").visible = false;
      // gltf.scale.multiplyScalar(100)

      let nameData = [
        {
          name: "정호석 개발자",
          nameHeight: 0.05,
          sub: "정보관리처",
          subHeight: 0.02,
          color: "black",
        },
      ];

      let tmpNameCard = nameCard(nameData);
      // let tmpNameCard = nameCard("\n홍길동(부장)")
      tmpNameCard.position.set(0, 1, 0);
      tmp.add(tmpNameCard);
      //   gltf.add(tmpNameCard);
      scene.add(tmp);
      gltf.name = "man";

      transformControls.attach(tmp);
    });
    scene.add(transformControls);

    Loader(
      "https://d1a370nemizbjq.cloudfront.net/bc909266-6f48-4b5a-ae18-257ce65c3782.glb"
    ).then((gltf) => {
        let tmp = new THREE.Group();
      tmp.add(gltf);
      let nameData = [
        {
          name: "이호형 개발자",
          nameHeight: 0.05,
          sub: "정보관리처",
          subHeight: 0.02,
          color: "black",
        },
      ];

      let tmpNameCard = nameCard(nameData);
      // let tmpNameCard = nameCard("\n홍길동(부장)")
      tmpNameCard.position.set(0, 1, 0);
      tmp.add(tmpNameCard);
    //   scene.add(gltf);
      // Vector3 {x: 5.878819840867946, y: 62.24612750856752, z: -132.85781019943977}
    //   gltf.position.set(5.8, 62.2, -132.8);
    //   console.log(gltf);
      gltf.children[0].getObjectByName("Wolf3D_Hands").visible = false;
      scene.add(tmp);
      // gltf.scale.multiplyScalar(100)
    });

    Loader(
      "https://d1a370nemizbjq.cloudfront.net/8be892e2-04c0-4a14-aa8b-78a25f7a8482.glb"
    ).then((gltf) => {

        let tmp = new THREE.Group();
      let nameData = [
        {
          name: "김혜진 대리",
          nameHeight: 0.05,
          sub: "물산업혁신처",
          subHeight: 0.02,
          color: "black",
        },
      ];

      let tmpNameCard = nameCard(nameData);
      // let tmpNameCard = nameCard("\n홍길동(부장)")
      tmpNameCard.position.set(0, 1, 0);
      tmp.add(tmpNameCard);
      tmp.add(gltf);
      tmp.position.set(1.4614304994230993, 61.64914942739388, -135.8618);
      // _x: -3.141592653589793
      // _y: 1.235250164183875
      // _z: -3.141592653589793
      tmp.rotation.set(-3.141, 1.2352, -3.141);
      console.log(gltf);
      gltf.children[0].getObjectByName("Wolf3D_Hands").visible = false;
      scene.add(tmp);
      //   transformControls.attach(gltf);
      // transformControls.attach(gltf);
      // gltf.scale.multiplyScalar(100)
    });

    //axios ,,,

    const dir = new THREE.Vector3(1, 0, 0);

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1;
    const hex = 0xffff00;

    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
    scene.add(arrowHelper);

    // let nameData = [
    //   {
    //     name: "홍길동 부장",
    //     nameHeight: 0.05,
    //     sub: "정보관리처",
    //     subHeight: 0.02,
    //     color: "white",
    //   },
    // ];

    // let tmpNameCard = nameCard(nameData);
    // // let tmpNameCard = nameCard("\n홍길동(부장)")
    // tmpNameCard.position.set(2, 6, 0);

    // // let tmpNameCard2 = nameCard("이호형(사원)\n수자원공사-물산업혁신처")
    // // tmpNameCard2.position.set(0,6,0);

    // // let tmpNameCard3 = nameCard("정호석(대리)\n수자원공사-물산업혁신처")
    // // tmpNameCard3.position.set(1,6,0);

    // scene.add(tmpNameCard);
    // scene.add(tmpNameCard2)
    // scene.add(tmpNameCard3)
  }

  function Init() {
    THREE.Cache.enabled = true;
    scene = new THREE.Scene();
    scene.add(cameraRig);

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
    // cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    // camera.position.y = 150;
    // camera.position.z = 150;

    camera.position.y = 30;
    camera.position.z = 30;

    cameraControls = new CameraControls(camera, renderer.domElement);

    transformControls = new TransformControls(camera, renderer.domElement);

    // transformControls.addEventListener('change', render);

    transformControls.addEventListener("dragging-changed", function (event) {
      cameraControls.enabled = !event.value;
    });

    transformControls.addEventListener("objectChange", (e) => {
      console.log(e.target.object.position);
      console.log(e.target.object.rotation);
      console.log(e.target.object);
    });

    let vrBtnElem = VRButton.createButton(renderer);
    // vrBtnElem.addEventListener('click', () => {
    //     console.log("hello XR")
    // })

    vrBtnElem.addEventListener("click", preXR);

    vrButtonConRef.current.appendChild(vrBtnElem);

    renderer.setAnimationLoop(Animate);

    controller0 = renderer.xr.getController(0);
    controller1 = renderer.xr.getController(1);

    // cameraRig.add(camera);
    cameraRig.add(controller0);
    cameraRig.add(controller1);
    // window.addEventListener("resize", () => resizer(camera, renderer));
  }

  function Animate() {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);

    teleport.update();
    TWEEN.update();
    water.material.uniforms["time"].value += 1.0 / 60.0;

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
