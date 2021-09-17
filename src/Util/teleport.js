import * as THREE from "three";
// import { exportedSend } from "../../webRTC/component/widgetUI";

const tmpQuaternion = new THREE.Quaternion();
const tmpMatrix = new THREE.Matrix4();

const centerVec = new THREE.Vector3(0, 0, 0);
const upVec = new THREE.Vector3(0, 1, 0);

const cameraVec = new THREE.Vector3();
const forwardVec = new THREE.Vector3();
const rightVec = new THREE.Vector3();
const tmpVec = new THREE.Vector3();
const directionVec = new THREE.Vector3();

const tmp = new THREE.Vector3();

// mock dest marker
const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.5, 32),
    new THREE.MeshNormalMaterial({ wireframe: false })
);



// test 필요 , 일치화 된듯 ...
// const isOculusBrowser = /OculusBrowser/.test(navigator.userAgent);
const isOculusBrowser = false;

function TranslateHelperGeometry() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3)
    );
    return geometry;
}

const lineGeo = TranslateHelperGeometry()

const matHelper = new THREE.MeshBasicMaterial({
    depthTest: false,
    depthWrite: false,
    transparent: true,
    side: THREE.DoubleSide,
    fog: false,
    toneMapped: false,
});

const lineMesh = new THREE.Line(lineGeo, matHelper);
lineMesh.name = 'the fuck'

export default class Teleport extends THREE.EventDispatcher {
    constructor(
        renderer,
        cameraRig,
        controller0,
        controller1,
        {
            destMarker,
            rightHanded = true,
            playerHandHelper,
            destHandHelper,
            multiplyScalar = 3,
            scene
        } = {}
    ) {
        super();
        this._scene = scene;
        this._xr = renderer.xr;

        this._controller0 = controller0;
        this._controller1 = controller1;

        // player
        this._cameraRig = cameraRig;

        this._hander = rightHanded ? "right" : "left";

        // tmp
        // left right
        // 1 0 true
        // left right
        // 0 1 false
        this._handsOrder = true;

        if (destMarker === undefined) {
            // destMarker = new THREE.Object3D();

            // cone.rotateX((90 * Math.PI) / 180);
            // destMarker.add(cone);
            // this._cameraRig.parent.add(destMarker);


            const dir = new THREE.Vector3(1, 0, 0);

            //normalize the direction vector (convert to vector of length 1)
            dir.normalize();

            const origin = new THREE.Vector3(0, 0, 0);
            const length = 1;
            const hex = 0xffff00;

            const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
            // scene.add(arrowHelper);

            destMarker = new THREE.Object3D();

            // cone.rotateX((90 * Math.PI) / 180);
            destMarker.add(arrowHelper);
            this._cameraRig.parent.add(destMarker);
        }

        // a hand that represent player's position
        this._playerHand = new THREE.Object3D();
        this._playerHand.position.set(0, 0.05, 0);

        if (playerHandHelper === undefined) {
        } else {
            this._playerHand.add(playerHandHelper);
        }

        // a hand that represent the destination to teleport
        this._destHand = new THREE.Object3D();
        this._destHand.position.set(0, 0.05, 0);
        if (destHandHelper === undefined) {
        } else {
            this._destHand.add(destHandHelper);
        }

        // each xr controller hand position represent player positon, teleport destination position
        this._playerHandPos = new THREE.Vector3();
        this._destHandPos = new THREE.Vector3();

        // marker to show where to be teleported
        this._destMarker = destMarker;

        this._tmpVector = new THREE.Vector3();
        this._resultVector = new THREE.Vector3();

        // teleport distance multiply scalar
        this._multiplyScalar = multiplyScalar;

        this._helperLine = lineMesh.clone()
        this._helperLine2 = lineMesh.clone();

        this._cameraRig.parent.add(this._helperLine);
        this._cameraRig.parent.add(this._helperLine2);
        // 
        this.onSelectEnd = () => {
            this.teleport();
        };

        this.onFromSqueezeStart = () => {
            this._multiplyScalar *= 0.5;
        };

        this.onToSqueezeStart = () => {
            this._multiplyScalar *= 2;
        };

        // if (rightHanded === !isOculusBrowser) {
        //     controller0.add(this._destHand);
        //     controller1.add(this._playerHand);
        //     controller0.addEventListener("squeezestart", onToSqueezeStart);
        //     controller1.addEventListener("squeezestart", onFromSqueezeStart);
        //     controller0.addEventListener("selectend", onSelectEnd);
        // } else {
        //     controller0.add(this._playerHand);
        //     controller1.add(this._destHand);
        //     controller0.addEventListener("squeezestart", onFromSqueezeStart);
        //     controller1.addEventListener("squeezestart", onToSqueezeStart);
        //     controller1.addEventListener("selectend", onSelectEnd);
        // }

        tmpMatrix.lookAt(centerVec, new THREE.Vector3(0, 0, 1), upVec);

        tmpQuaternion.setFromRotationMatrix(tmpMatrix);
        this._destMarker.setRotationFromQuaternion(tmpQuaternion);

        controller0.addEventListener(
            "connected",
            ({ data = null }) => {
                if (!data) return;
                console.log(data.handedness === "right");
                this._handsOrder = data.handedness === "right";
                // controller 0 이left 라고 뜬거임 ...
                this.handsInit(data.handedness === "right");
            },
            { once: true }
        );
    }

    update() {
        this._playerHand.getWorldPosition(this._playerHandPos);
        this._destHand.getWorldPosition(this._destHandPos);

        this._tmpVector.subVectors(this._destHandPos, this._playerHandPos);

        this._tmpVector.multiplyScalar(this._multiplyScalar);
        this._destMarker.position.copy(
            this._tmpVector.add(this._cameraRig.position)
        );

        this._helperLine.position.copy(this._playerHandPos);
        tmp.set(1e-10, 1e-10, 1e-10)
            .add(this._destHandPos)
            .sub(this._playerHandPos);
        this._helperLine.scale.copy(tmp);

        this._helperLine2.position.copy(this._cameraRig.position);
        tmp.set(1e-10, 1e-10, 1e-10)
            .add(this._cameraRig.position)
            .sub(this._destMarker.position)
            .multiplyScalar(-1);
        this._helperLine2.scale.copy(tmp);

        const session = this._xr.getSession();
        if (session) {
            // only if we are in a webXR session
            for (const sourceXR of session.inputSources) {
                if (!sourceXR.gamepad) continue;
                if (
                    sourceXR &&
                    sourceXR.gamepad &&
                    (sourceXR.gamepad.axes[2] || sourceXR.gamepad.axes[3]) &&
                    sourceXR.handedness === this._hander
                ) {
                    // oculus joystick input
                    // [0,0,horizon,vertical]
                    //   -1
                    // -1   1
                    //    1
                    const axes = sourceXR.gamepad.axes;

                    this._destHand.getWorldDirection(cameraVec);

                    forwardVec.set(cameraVec.x, 0, cameraVec.z);

                    rightVec.copy(forwardVec);

                    rightVec.applyAxisAngle(upVec, Math.PI / 2);

                    forwardVec.multiplyScalar(-axes[3]);
                    rightVec.multiplyScalar(-axes[2]);

                    tmpVec.addVectors(forwardVec, rightVec);

                    tmpVec.normalize();

                    tmpMatrix.lookAt(centerVec, tmpVec, upVec);

                    tmpQuaternion.setFromRotationMatrix(tmpMatrix);
                    this._destMarker.setRotationFromQuaternion(tmpQuaternion);
                }
            }
        }
    }

    teleport() {
        this._resultVector = this._tmpVector.subVectors(
            this._destHandPos,
            this._playerHandPos
        );
        this._cameraRig.position.add(
            this._resultVector.multiplyScalar(this._multiplyScalar)
        );

        this._destMarker.getWorldDirection(directionVec);

        tmpMatrix.lookAt(centerVec, directionVec, upVec);

        tmpQuaternion.setFromRotationMatrix(tmpMatrix);
        this._cameraRig.setRotationFromQuaternion(tmpQuaternion);

        // exportedSend({"test":999})
        // console.log(this._cameraRig.position.toArray())
        // let tmp = this._cameraRig.position.toArray();
        // exportedSend({ playerPos: tmp, type: "teleport" });
    }

    setDistance(value) {
        this._multiplyScalar = value;
    }

    handsInit(rightHanded) {
        // 초기화 first
        //
        // controller 0 이 right 이면 true 가 오고
        // left 이면 false 가 옴 ...
        // 어찌됐든 refactoring 필요 ....

        // this._hander = rightHanded ? "right" : "left";
        // console.log(this._hander)

        //remove events
        this._controller0.removeEventListener(
            "squeezestart",
            this.onToSqueezeStart
        );
        this._controller0.removeEventListener(
            "squeezestart",
            this.onFromSqueezeStart
        );
        this._controller0.removeEventListener("selectend", this.onSelectEnd);
        this._controller1.removeEventListener(
            "squeezestart",
            this.onToSqueezeStart
        );
        this._controller1.removeEventListener(
            "squeezestart",
            this.onFromSqueezeStart
        );
        this._controller1.removeEventListener("selectend", this.onSelectEnd);
        this._controller0.removeEventListener("squeezeend", this.onSelectEnd);
        this._controller1.removeEventListener("squeezeend", this.onSelectEnd);

        if (rightHanded === !isOculusBrowser) {
            this._controller0.add(this._destHand);
            this._controller1.add(this._playerHand);

            this._controller0.addEventListener("squeezeend", this.onSelectEnd);
            this._controller1.addEventListener("squeezeend", this.onSelectEnd);

            if (this._handsOrder) {
                this._hander = "right";
            } else {
                this._hander = "left";
            }
        } else {
            // 오른손 잡이 인데 여기로 들어와서 잘 작동됨 ...
            // 하지만 hander 가 left 가 된 상황이지 ...
            // hands order 이라고 임시로 만들까 ...
            this._controller0.add(this._playerHand);
            this._controller1.add(this._destHand);

            this._controller0.addEventListener("squeezeend", this.onSelectEnd);
            this._controller1.addEventListener("squeezeend", this.onSelectEnd);

            if (this._handsOrder) {
                this._hander = "left";
            } else {
                this._hander = "right";
            }
        }
    }

    dispose() {
        console.log("really disposed???")
        this._scene.remove(this._helperLine);
        this._scene.remove(this._helperLine2);

        this._helperLine.material.visible = false
        this._helperLine2.material.visible = false

        // this._cameraRig.parent.remove(this._helperLine);
        // this._cameraRig.parent.remove(this._helperLine2);

        // destmarker 도 없애기 ... 걍 remove 만 하자 ... 
        // destMarker
        this._cameraRig.parent.remove(this._destMarker);
    }

    // onSelectEnd() {
    //     this.teleport();
    // }
    // onFromSqueezeStart() {
    //     this._multiplyScalar *= 0.5;
    // }

    // onToSqueezeStart() {
    //     this._multiplyScalar *= 2;
    // }

    //     const onFromSqueezeStart = () => {
    //         this._multiplyScalar *= 0.5;
    //     };

    //     const onToSqueezeStart = () => {
    //         this._multiplyScalar *= 2;
    //     };
}
