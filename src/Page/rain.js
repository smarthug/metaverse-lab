import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import CameraControls from "camera-controls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

// import { resizer, SceneSetUp } from '../Utils/utils'

CameraControls.install({ THREE: THREE });

let cube, scene, camera, renderer, cameraControls;
const clock = new THREE.Clock();

let loader = new THREE.TextureLoader();

let cloudParticles = []

let flash

let  rainCount=15000, rainMaterial, rain;

let rainGeo = new THREE.BufferGeometry();

let rainVelocity = [];

export default function Main() {
    const containerRef = useRef();
    const canvasRef = useRef();
    const vrButtonConRef = useRef();
    useEffect(() => {
        Init();
        // Animate();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function Init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 1;
        camera.rotation.x = 1.16;
        camera.rotation.y = -0.12;
        camera.rotation.z = 0.27;
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvasRef.current,
        });
        renderer.xr.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.setFramebufferScaleFactor(2.0);

        scene.fog = new THREE.FogExp2(0x11111f, 0.002);
        renderer.setClearColor(scene.fog.color);
        // renderer.setSize(window.innerWidth, window.innerHeight);

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial();
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        // camera.position.z = 5;

        cameraControls = new CameraControls(camera, renderer.domElement);


        vrButtonConRef.current.appendChild(VRButton.createButton(renderer));



        // window.addEventListener("resize", () => resizer(camera, renderer));

        // SceneSetUp(scene)


        let ambient = new THREE.AmbientLight(0x555555);
        scene.add(ambient);
        let directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(0, 0, 1);
        scene.add(directionalLight);


        loader.load("textures/smoke.png", function (texture) {
            let cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
            let cloudMaterial = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true
            });
            for (let p = 0; p < 25; p++) {
                let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
                cloud.position.set(
                    Math.random() * 800 - 400,
                    500,
                    Math.random() * 500 - 450
                );
                cloud.rotation.x = 1.16;
                cloud.rotation.y = -0.12;
                cloud.rotation.z = Math.random() * 360;
                cloud.material.opacity = 0.6;
                scene.add(cloud);
                cloudParticles.push(cloud);
            }
        });

        flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
        flash.position.set(200, 300, 100);
        scene.add(flash);

        let tmp = []
        for (let i = 0; i < rainCount; i++) {
            // rainDrop = new THREE.Vector3(
            //     Math.random() * 400 - 200,
            //     Math.random() * 500 - 250,
            //     Math.random() * 400 - 200
            // );
            // rainDrop.velocity = {};
            // rainDrop.velocity = 0;
            // rainGeo.vertices.push(rainDrop);


            tmp.push(
                Math.random() * 400 - 200,
                Math.random() * 500 - 250,
                Math.random() * 400 - 200
            )

            rainVelocity.push(0)




        }
        console.log(tmp)

        let typedArr =  Float32Array.from(tmp)
        console.log(typedArr)
        rainGeo.setAttribute('position', new THREE.BufferAttribute(typedArr, 3))

        rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true
        });
        console.log(rainGeo)
        rain = new THREE.Points(rainGeo, rainMaterial);
        scene.add(rain)


        console.log(rainGeo.getAttribute("position").array)

        renderer.setAnimationLoop(Animate);
    }

    function Animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        const delta = clock.getDelta();
        // const hasControlsUpdated = cameraControls.update(delta);
        cameraControls.update(delta);

        cloudParticles.forEach(p => {
            p.rotation.z -= 0.002;
        });

        if (Math.random() > 0.93 || flash.power > 100) {
            if (flash.power < 100) {
                flash.position.set(Math.random() * 400, 300 + Math.random() * 200, 100);

            }
            flash.power = 50 + Math.random() * 500
        }

        // rainGeo.vertices.forEach(p => {
        //     p.velocity -= 0.1 + Math.random() * 0.1;
        //     p.y += p.velocity;
        //     if (p.y < -200) {
        //         p.y = 200;
        //         p.velocity = 0;
        //     }
        // });

        
        // const positions = line.geometry.attributes.position.array;
        const positions = rainGeo.getAttribute("position").array
        const tmp = Array.from(positions)
        for(let i=0; i<rainCount;i++){
            // positions[i+0]
            let y = tmp[i*3+1]

           rainVelocity[i] -= 0.1 + Math.random() * 0.1;
            // positions[i+2]
            // let velocity = 
            tmp[i*3+1] += rainVelocity[i]
            if (y<-200) {
                tmp[i*3+1] = 200
                rainVelocity[i]=0
            }
        }
        let typedArr =  Float32Array.from(tmp)
        rainGeo.setAttribute('position', new THREE.BufferAttribute(typedArr, 3))
        rainGeo.verticesNeedUpdate = true;
        // rain.rotation.y += 0.002

        renderer.render(scene, camera);
    }

    return (
        <div style={{
            height: "100vh",
            overflowX: "hidden",
            overflowY: "hidden",
        }}
            ref={containerRef}
        >
            <canvas ref={canvasRef} />
            <div ref={vrButtonConRef}></div>
        </div>
    );
}
