import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import Axios from 'axios'

import CameraControls from "camera-controls";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

import { installFuncHotkey } from 'use-github-hotkey'

import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { GUI } from 'dat.gui'

import Loader from '../Util/loader'
import Light from '../Util/light'

import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh'


const loader = new THREE.TextureLoader();
const onlyMeshNormalMat = new THREE.MeshNormalMaterial();
const faceMat = new THREE.MeshBasicMaterial({ map: loader.load('img/avatar.png') })
const cubeMaterials = [
    onlyMeshNormalMat,
    onlyMeshNormalMat,
    onlyMeshNormalMat,
    onlyMeshNormalMat,
    faceMat, //front side
    onlyMeshNormalMat, //back side
];



let water, sun;
let waterBody
let waterGroup

let elevationController
let azimuthController

let cameraRig;

// import { resizer, SceneSetUp } from "../Utils/utils";

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
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
        installFuncHotkey(WaterLevelControl(5), "1")
        installFuncHotkey(WaterLevelControl(-5), "2")
        installFuncHotkey(TempTeleport, "t")

        // installFuncHotkey(ElevationControl(1), "ArrowUp")





        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function TempTeleport() {
        console.log("teleport")
        cameraRig.position.addScalar(100);
    }



    function WaterLevelControl(value) {


        return () => new TWEEN.Tween(waterGroup.position)
            .to(
                {
                    // x: p.x,
                    y: waterGroup.position.y + value,
                    // z: p.z,
                },
                500
            ).easing(TWEEN.Easing.Quadratic.Out)
            .start()
    }

    function ElevationControl(value) {

        return () => elevationController.setValue(elevationController.getValue() + value)
    }

    function AzimuthControl(value) {

        return () => azimuthController.setValue(azimuthController.getValue() + value)
    }

    function EnvSetUp() {
        sun = new THREE.Vector3();

        // Water
        waterGroup = new THREE.Group();

        const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
        // const waterGeometry = new THREE.BoxGeometry( 100, 100,100 );
        const waterBodyGeo = new THREE.BoxGeometry(1000, 100, 1000);

        water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                }),
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
        const waterBodyMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.62, color: 0x001e0f, side: THREE.DoubleSide })
        waterBody = new THREE.Mesh(waterBodyGeo, waterBodyMat)

        waterBody.position.y = -50.01


        waterGroup.add(waterBody);
        waterGroup.add(water)
        scene.add(waterGroup)

        // Skybox

        const sky = new Sky();
        sky.scale.setScalar(10000);
        scene.add(sky);

        const skyUniforms = sky.material.uniforms;

        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;


        const parameters = {
            elevation: 2,
            azimuth: 180
        };

        const pmremGenerator = new THREE.PMREMGenerator(renderer);

        function updateSun() {

            const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
            const theta = THREE.MathUtils.degToRad(parameters.azimuth);

            sun.setFromSphericalCoords(1, phi, theta);

            sky.material.uniforms['sunPosition'].value.copy(sun);
            water.material.uniforms['sunDirection'].value.copy(sun).normalize();

            scene.environment = pmremGenerator.fromScene(sky).texture;

        }

        updateSun();



        // GUI

        const gui = new GUI({autoPlace:false});

        const folderSky = gui.addFolder('Sky');
        elevationController = folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
        azimuthController = folderSky.add(parameters, 'azimuth', - 180, 180, 0.1).onChange(updateSun);
        folderSky.open();


        Loader("https://ipfs.io/ipfs/QmRayg561oGQiL8jMHmy5g1ZWeACQ7gHHf4DdNZ84tU3Lp").then((gltf) => {
            console.log(gltf)
            scene.add(gltf)
            gltf.position.set(50, -650, -600)
            gltf.scale.multiplyScalar(100)
        })


        Light(scene)

        let avatar = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), cubeMaterials);
        scene.add(avatar)
        avatar.position.set(0, 5, 0)
    }

    function Init() {
        THREE.Cache.enabled = true
        scene = new THREE.Scene();


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
        // camera.position.y = 150;
        // camera.position.z = 150;

        camera.position.y = 30;
        camera.position.z = 30;

        cameraControls = new CameraControls(camera, renderer.domElement);

        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));

        renderer.setAnimationLoop(Animate);

        cameraRig = new THREE.Group();
        cameraRig.add(camera);

        // window.addEventListener("resize", () => resizer(camera, renderer));



    }

    function Animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        TWEEN.update();
        water.material.uniforms['time'].value += 1.0 / 60.0;

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
