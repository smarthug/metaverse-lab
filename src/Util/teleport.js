import * as THREE from "three";

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



export default class Teleport extends THREE.EventDispatcher {
    constructor(
        renderer,
        cameraRig,
        cameraOnlyRig,
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

        this._cameraOnlyRig = cameraOnlyRig;

        this._hander = rightHanded ? "right" : "left";

        this._handsOrder = true;

        if (destMarker === undefined) {
            destMarker = new THREE.Object3D();

            cone.rotateX((90 * Math.PI) / 180);
            destMarker.add(cone);
            this._cameraRig.parent.add(destMarker);



            // scene.add(arrowHelper);

            destMarker = new THREE.Object3D();

            // cone.rotateX((90 * Math.PI) / 180);
            // 넣어보자 ... 
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
        this._destMarker.visible = false

        this._tmpVector = new THREE.Vector3();
        this._resultVector = new THREE.Vector3();

        // teleport distance multiply scalar
        this._multiplyScalar = multiplyScalar;

        this._helperLine = lineMesh.clone()
        this._helperLine2 = lineMesh.clone();
        this._helperLine2.visible = false;

        this._cameraRig.parent.add(this._helperLine);
        this._cameraRig.parent.add(this._helperLine2);
        
        this.onSelectEnd = () => {
            this._destMarker.visible = false
            this._helperLine2.visible = false;
            this.teleport();
        };

        this.onSqueezeStart = () => {
            this._destMarker.visible= true;
            this._helperLine2.visible = true;
        }

        this.onFromSqueezeStart = () => {
            this._multiplyScalar *= 0.5;
        };

        this.onToSqueezeStart = () => {
            this._multiplyScalar *= 2;
        };

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

        this._cameraOnlyRig.position.add(
            this._resultVector
        )

        this._destMarker.getWorldDirection(directionVec);

        tmpMatrix.lookAt(centerVec, directionVec, upVec);

        tmpQuaternion.setFromRotationMatrix(tmpMatrix);
        this._cameraRig.setRotationFromQuaternion(tmpQuaternion);
        this._cameraOnlyRig.setRotationFromQuaternion(tmpQuaternion);


    }

    setDistance(value) {
        this._multiplyScalar = value;
    }

    handsInit(rightHanded) {
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

            this._controller0.addEventListener("squeezestart", this.onSqueezeStart);
            this._controller1.addEventListener("squeezestart", this.onSqueezeStart);

            if (this._handsOrder) {
                this._hander = "right";
            } else {
                this._hander = "left";
            }
        } else {
            this._controller0.add(this._playerHand);
            this._controller1.add(this._destHand);

            this._controller0.addEventListener("squeezeend", this.onSelectEnd);
            this._controller1.addEventListener("squeezeend", this.onSelectEnd);

            this._controller0.addEventListener("squeezestart", this.onSqueezeStart);
            this._controller1.addEventListener("squeezestart", this.onSqueezeStart);

            if (this._handsOrder) {
                this._hander = "left";
            } else {
                this._hander = "right";
            }
        }
    }

    dispose() {
        this._scene.remove(this._helperLine);
        this._scene.remove(this._helperLine2);

        this._helperLine.material.visible = false
        this._helperLine2.material.visible = false
        this._cameraRig.parent.remove(this._destMarker);
    }

}
