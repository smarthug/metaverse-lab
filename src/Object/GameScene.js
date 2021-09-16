import Actor from './Actor'
import * as THREE from 'three'

export default class GameScene extends THREE.Scene {
    constructor() {
        super();

        // this.beginPlay
        this.beginPlayArr = [];
        this.tickArr = [];
    }

    add(object) {

        super.add(object);
        // listeners....
        console.log(object)
        if (object instanceof  Actor) {
            this.beginPlayArr.push(object);
            this.tickArr.push(object);
        }
        

    }


    beginPlay() {
        // console.log(this.beginPlayArr)
        this.beginPlayArr.map((v, i) => {
            v.beginPlay();
        })
    }

    tick(camera,delta) {
        this.tickArr.map((v, i) => {
            v.tick(camera,delta);
        })
    }

}