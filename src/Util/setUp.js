import * as THREE from 'three'
import InfiniteGridHelper from "./InfiniteGridHelper"

export function SceneSetUp(scene) {

    const background = new THREE.CubeTextureLoader()
        .setPath("textures/cube/MilkyWay/")
        .load([
            "dark-s_px.jpg",
            "dark-s_nx.jpg",
            "dark-s_py.jpg",
            "dark-s_ny.jpg",
            "dark-s_pz.jpg",
            "dark-s_nz.jpg",
        ]);

    scene.background = background;

    const grid = new InfiniteGridHelper(10, 100);
    scene.add(grid);
}