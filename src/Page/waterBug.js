import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { Water } from "../Util/water";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { GUI } from "dat.gui";
import Light from "../Util/light";
import { install } from '@github/hotkey'



CameraControls.install({ THREE: THREE });

let water, sun;
let waterGroup;
let cameraRig = new THREE.Group();



let cube, scene, camera, renderer, cameraControls
const clock = new THREE.Clock();

export default function Main() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const vrButtonConRef = useRef();
  const datGuiConRef = useRef();

  const teleportBtnRef = useRef();

  useEffect(() => {
    Init();
    EnvSetUp();

    install(teleportBtnRef.current, "t")


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function CameraMove() {
    // 
    // cameraRig.translateZ(10)
    // cameraRig.position.add(tmpVector)
    cameraRig.position.add(new THREE.Vector3(10, 10, 10))

    // console.log(`${cameraRig.matrix.elements}`)
    // console.log(`${cameraRig.matrixWorld.elements}`)

    console.log(`${cameraRig.children[0].matrix.elements}`)
    console.log(`${cameraRig.children[0].matrixWorld.elements}`)
  }



  function EnvSetUp() {
    sun = new THREE.Vector3();

    // Water
    waterGroup = new THREE.Group();

    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);


    water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "textures/waternormals.jpg",
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      sunDirection: new THREE.Vector3(100, 100, 100),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });
    //0x7F7F7F
    water.rotation.x = -Math.PI / 2;


    // waterGroup.add(waterBody);
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



    Light(scene);







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
      // logarithmicDepthBuffer: true,
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


    camera.position.y = 30;
    camera.position.z = 30;

    cameraControls = new CameraControls(camera, renderer.domElement);



    let vrBtnElem = VRButton.createButton(renderer);




    vrButtonConRef.current.appendChild(vrBtnElem);

    renderer.setAnimationLoop(Animate);



    cameraRig.add(camera);
  }

  function Animate() {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);


    water.material.uniforms["time"].value += delta;

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
      <div style={{ position: "absolute" }}>
        <button ref={teleportBtnRef} onClick={CameraMove}>Camera Move</button>
      </div>
      <canvas ref={canvasRef} />
      <div ref={datGuiConRef}></div>
      <div ref={vrButtonConRef}></div>
    </div>
  );
}
