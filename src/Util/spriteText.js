import SpriteText from "three-spritetext";
import * as THREE from "three";

//text = [ 물산업 혁신처, 이용우 부장, 수자원공사 ]
export function nameCard(text) {
    let textGroup = new THREE.Group();

    for (let i in text) {
        let name = text[i].name;
        let nameHeight = text[i].nameHeight;
        let sub = text[i].sub;
        let subHeight = text[i].subHeight;
        let color = text[i].color

        let spriteName = new SpriteText(`\n${name}`, nameHeight, color)
        // spriteName.borderColor = 'lightgrey';
        // spriteName.borderWidth = 0.1;
        // spriteName.borderRadius = 3;
        // spriteName.fontSize = 1
        // spriteName.fontWeight = 
        // spriteName.padding = 1;
        // spriteName.scale.set(0.1,0.1,0.1)
        let spriteSub = new SpriteText(`\n${sub}`, subHeight, color )
        spriteSub.position.set(0,-nameHeight,0);
        // spriteName.backgroundColor = "#3480eb";
        // spriteSub.backgroundColor = "#3480eb";
        // spriteName.padding = [0, 0.08];
        // spriteSub.padding = 0.1;
        textGroup.add( spriteName,spriteSub);
    }

    // let textHeight = 0.05
    // let textColor = "white"
    // let name = new SpriteText(text, textHeight, textColor)
    // name.backgroundColor = "black"
    
    return textGroup
    // return name;
}