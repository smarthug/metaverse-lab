import Actor from './Actor'
import * as THREE from 'three'

import {player } from '../Page/traceLogic'


import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";


let tmpVec = new THREE.Vector3(0,0,0);

export default class Enemy extends Actor {
    constructor() {
        super();
        // this.add(new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshNormalMaterial()));
        //

        Loader(this);
    }


    beginPlay() {
        console.log("Enemy shown");
    }

    tick(camera,delta) {
        // rotate after ...
        // this.rotation.x += 0.01;
        // this.rotation.y += 0.01;
        // play 따라오게 ... 
        // player 의 위치 필요 ... 
        // scene 에 접근 필요 ... 
        // this.position,player.position 
        // console.log(player.position)
        // console.log(this.position)
        tmpVec.subVectors(player.position, this.position);
        // console.log(tmpVec)
        tmpVec.normalize();
        tmpVec.multiplyScalar(0.03)
        this.position.add(tmpVec)
    }

}


function Loader(obj) {
    const loader = new GLTFLoader()
      // .setCrossOrigin('anonymous')
      .setDRACOLoader(new DRACOLoader().setDecoderPath("assets/wasm/"))
      .setKTX2Loader(new KTX2Loader().setTranscoderPath("assets/wasm/"))
      .setMeshoptDecoder(MeshoptDecoder);
  
    const blobURLs = [];
  
    //.detectSupport(renderer)
  
    loader.load("model/covid.gltf", (gltf) => {
      const scene2 = gltf.scene || gltf.scenes[0];
      const clips = gltf.animations || [];
      if (!scene2) {
        // Valid, but not supported by this viewer.
        throw new Error(
          "This model contains no scene, and cannot be viewed here. However," +
            " it may contain individual 3D resources."
        );
      }
    //   player = scene2;
      // scene.add(player);
      obj.add(scene2);
    //   const animations = gltf.animations;
    //   mixer = new THREE.AnimationMixer(player);
    //   idleAction = mixer.clipAction(animations[0]);
    //   walkAction = mixer.clipAction(animations[3]);
    //   runAction = mixer.clipAction(animations[1]);
    //   idleAction.play();
    });
  }
  