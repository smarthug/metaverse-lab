import SpriteText from "three-spritetext";
import * as THREE from 'three'

//text = [ 물산업 혁신처, 이용우 부장, 수자원공사 ]
export function NameCard(text) {
    let nameSet = new THREE.Group();

    // let text;
    let textHeight = 10
    let textColor = "white"
    for (let i in text) {
        let name = new SpriteText(text[i], textHeight, textColor)
        name.backgroundColor = "black"
        nameSet.add(name);
    }
    return nameSet;
}