import Actor from "./Actor";
import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import { useStore } from '../Utils/store'

let mixer = { update: () => { } };
let player;

export let idleAction = { play: () => {}, stop: () => {} };
export let walkAction = { play: () => {}, stop: () => {} };
export let runAction = { play: () => {}, stop: () => {} };

// const clock = new THREE.Clock();

let playerSpeed = 5.5;

let unitMoveVector = new THREE.Vector3();

let moveVector = new THREE.Vector3();

let cameraVector = new THREE.Vector3();
let rightCameraVector = new THREE.Vector3();

let tmpQuaternion = new THREE.Quaternion();
let tmpMatrix = new THREE.Matrix4();

let centerVec = new THREE.Vector3(0, 0, 0);
let upVec = new THREE.Vector3(0, 1, 0);

export default class Player extends Actor {
  constructor() {
    super();
    // this.add(
    //   new THREE.Mesh(
    //     new THREE.BoxGeometry(1, 1, 1),
    //     new THREE.MeshNormalMaterial()
    //   )
    // );
    Loader(this);
  }

  beginPlay() {
    console.log("player shown");
  }

  tick(camera,delta) {

    // const delta = clock.getDelta();
    // cameraControls.update(delta);
    // movement 로직 여기로 ...

    // if(){
    //     // animation blending 의 영역이군 ...
    // }

    const { controls } = useStore.getState();
    const { horizonAxis, verticalAxis } = controls;

    mixer.update(delta);

    if (verticalAxis !== 0 || horizonAxis !== 0) {
      runAction.play();
      idleAction.stop();

      moveVector.set(
        camera.getWorldDirection(cameraVector).x,
        0,
        camera.getWorldDirection(cameraVector).z
      );
      //카메라가아닌, controller 의 ... 

      rightCameraVector.copy(moveVector);

      rightCameraVector.applyAxisAngle(upVec, Math.PI / 2);

      rightCameraVector.multiplyScalar(horizonAxis);

      moveVector.multiplyScalar(verticalAxis);

      unitMoveVector.addVectors(moveVector, rightCameraVector);

      // 역시 예측대로 , 조이스틱에서는 노말라이즈 할 필요가 없을 듯 ....
      // 조이스틱인지 키보드 인지에 따라 또 달라지겠구먼 ...
      unitMoveVector.normalize();

      // if (verticalAxis !== 0 || horizonAxis !== 0) {
      unitMoveVector.multiplyScalar(delta).multiplyScalar(playerSpeed);
      this.position.add(unitMoveVector);

      tmpMatrix.lookAt(centerVec, unitMoveVector, upVec);

      tmpQuaternion.setFromRotationMatrix(tmpMatrix);
      this.setRotationFromQuaternion(tmpQuaternion);
    }
  }
}

// 0, 0 일때만

function Loader(obj) {
  const loader = new GLTFLoader()
    // .setCrossOrigin('anonymous')
    .setDRACOLoader(new DRACOLoader().setDecoderPath("assets/wasm/"))
    .setKTX2Loader(new KTX2Loader().setTranscoderPath("assets/wasm/"))
    .setMeshoptDecoder(MeshoptDecoder);

  const blobURLs = [];

  //.detectSupport(renderer)

  loader.load("model/Soldier.glb", (gltf) => {
    const scene2 = gltf.scene || gltf.scenes[0];
    const clips = gltf.animations || [];
    if (!scene2) {
      // Valid, but not supported by this viewer.
      throw new Error(
        "This model contains no scene, and cannot be viewed here. However," +
          " it may contain individual 3D resources."
      );
    }
    player = scene2;
    // scene.add(player);
    obj.add(player);
    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(player);
    idleAction = mixer.clipAction(animations[0]);
    walkAction = mixer.clipAction(animations[3]);
    runAction = mixer.clipAction(animations[1]);
    idleAction.play();
  });
}
