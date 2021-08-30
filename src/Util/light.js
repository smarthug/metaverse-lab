import * as THREE from 'three'

export default function LightSetUp(scene) {
    const light = new THREE.AmbientLight(0x404040, 0.2); // soft white light
    scene.add(light);
    // White directional light at half intensity shining from the top.
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    // scene.add(directionalLight);
    const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
    scene.add(hemiLight);
    // const spotLight = new THREE.SpotLight(0xffa95c, 4);
    // spotLight.position.set(-50, 350, 50);
    // spotLight.castShadow = true;
    // scene.add(spotLight);
}
