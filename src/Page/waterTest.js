import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

import {installFuncHotkey} from 'use-github-hotkey'

import {TWEEN} from 'three/examples/jsm/libs/tween.module.min'
import {GUI} from 'dat.gui'

// let container, stats;
// let camera, scene, renderer;
// let controls, water, sun, mesh;
let  water, sun;
let waterBody
let waterGroup

// import { resizer, SceneSetUp } from "../Utils/utils";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

export default function Main() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const vrButtonConRef = useRef();
  useEffect(() => {
    Init();
    // Animate();

    installFuncHotkey(WaterLevelControl, "1")
    installFuncHotkey(WaterLevelControl2, "2")

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function WaterLevelControl(e){
    console.log(e)
    console.log("water Level control")


    new TWEEN.Tween(waterGroup.position)
    .to(
        {
            // x: p.x,
            y: 20,
            // z: p.z,
        },
        500
    ).easing(TWEEN.Easing.Quadratic.Out)
    .start()
  }

  function WaterLevelControl2(e){
    console.log(e)
    console.log("water Level control")


    new TWEEN.Tween(waterGroup.position)
    .to(
        {
            // x: p.x,
            y: -20,
            // z: p.z,
        },
        500
    ).easing(TWEEN.Easing.Quadratic.Out)
    .start()
  }

  function Init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
      logarithmicDepthBuffer: true
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
    camera.position.y = 150;
    camera.position.z = 150;

    cameraControls = new CameraControls(camera, renderer.domElement);

    vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

    renderer.setAnimationLoop(Animate);

    // window.addEventListener("resize", () => resizer(camera, renderer));

    // SceneSetUp(scene)


    //

    sun = new THREE.Vector3();

    // Water
    waterGroup = new THREE.Group();

    const waterGeometry = new THREE.PlaneGeometry( 100, 100 );
    // const waterGeometry = new THREE.BoxGeometry( 100, 100,100 );
    const waterBodyGeo = new THREE.BoxGeometry( 100, 100,100 );

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            // sunDirection: new THREE.Vector3(),
            sunDirection: new THREE.Vector3(100, 100, 100),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
//0x7F7F7F
    water.rotation.x = - Math.PI / 2;
        const waterBodyMat = new THREE.MeshBasicMaterial({transparent:true, opacity:0.62,color:0x001e0f})
     waterBody = new THREE.Mesh(waterBodyGeo, waterBodyMat )

    waterBody.position.y = -50.01

    // scene.add(waterBody)
    // scene.add( water );

    waterGroup.add(waterBody);
    waterGroup.add(water)
    scene.add(waterGroup)

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar( 10000 );
    scene.add( sky );

    const skyUniforms = sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;


    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator( renderer );

    function updateSun() {

        const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
        const theta = THREE.MathUtils.degToRad( parameters.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
        water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

        scene.environment = pmremGenerator.fromScene( sky ).texture;

    }

    updateSun();



    // GUI

    const gui = new GUI();

    const folderSky = gui.addFolder( 'Sky' );
    folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
    folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
    folderSky.open();

    // const waterUniforms = water.material.uniforms;

    // const folderWater = gui.addFolder( 'Water' );
    // folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
    // folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
    // folderWater.open();
  }

  function Animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    const delta = clock.getDelta();
    // const hasControlsUpdated = cameraControls.update(delta);
    cameraControls.update(delta);

    TWEEN.update();
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

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
      <h1 style={{
        position:"absolute",
        color:"white"
      }}>Press 1 or 2</h1>
      <canvas ref={canvasRef} />
      <div ref={vrButtonConRef}></div>
    </div>
  );
}
