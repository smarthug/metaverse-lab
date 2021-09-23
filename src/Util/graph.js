import * as THREE from 'three'
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export let koreanFont = null;

var gloader = new THREE.FontLoader();

export default new Promise((r, j) =>
  gloader.load("/fonts/korean.json", function (font) {
    koreanFont = font;
    console.log("loaded");
    r();
  })
);

const targetData = {
    lowlevel: "댐수위",
    rf: "강우량",
    inflowqy: "유입량",
    totdcwtrqy: "총방류량",
    rsvwtqy: "저수량",
    rsvwtrt: "저수율",
  };

export function WsGraphView(data, target) {
   console.log(data)
    let material = new THREE.LineBasicMaterial({ color: 0x0062ff });
    let textMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    let graphSet = new THREE.Group();
    let xAxios = [];
    let yAxios = [];
    let pts = [];
    let textList = [];
  
    let yData = data[target];
    let re = new RegExp(/,/g);
  
    for (let i in yData) {
      if (!(typeof yData[i] === "string")) continue;
      yData[i] = parseFloat(yData[i].replace(re, ""));
    }
  
    let yMax = Math.max.apply(null, yData);
    let yMin = Math.min.apply(null, yData);
    let scale = 1000;
    // let init = {x:0, y:0, z:0}
    // const xAxiosLength = data.obsrdtmnt.length;
    const xAxiosLength = 144;
    let yCali = xAxiosLength / (yMax - yMin);
    let _lineSeg = [];
    let _lineXaxios = [];
    let _lineYaxios = [];
    let _xMarkLine = [];
    let _yMarkLine = [];
  
    yAxios.push(
      ...[
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, (yMax - yMin) * yCali * scale, 0),
      ]
    );
    xAxios.push(
      ...[
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(xAxiosLength * scale, 0, 0),
      ]
    );
  
    let backgroudMeshPos = [
      (xAxiosLength * scale) / 2,
      ((yMax - yMin) * yCali * scale) / 2,
      0,
    ];
  console.log(data)
    for (let i = 0; i < xAxiosLength + 1; i++) {
      pts.push(
        new THREE.Vector3(
          i * scale,
          (yData[Math.round((data.obsrdtmnt.length / xAxiosLength) * i)] - yMin) *
            yCali *
            scale,
          0
        )
      );
    }
  
    pts.reduce((re, cu) => {
      _lineSeg.push(re, cu);
      return cu;
    });
    yAxios.reduce((re, cu) => {
      _lineYaxios.push(re, cu);
      return cu;
    });
    xAxios.reduce((re, cu) => {
      _lineXaxios.push(re, cu);
      return cu;
    });
  
    let _result = LineSegMesh(_lineSeg, material);
    let _resultX = LineSegMesh(_lineXaxios, material);
    let _resultY = LineSegMesh(_lineYaxios, material);
  
    for (let i = 0; i <= 6; i++) {
      let xMarkLine = [];
      let yMarkLine = [];
      let Ytext = (yMin + ((yMax - yMin) / 6) * i).toFixed(2);
      let Yanchor = [
        -(scale / 200) * scale,
        (((yMax - yMin) * yCali) / 6) * i * scale,
        0,
      ];
      textList.push({
        text: Ytext.toString(),
        anchor: Yanchor,
        rotation: 0,
        fontSize: scale * 5,
        align: "right",
      });
  
      yMarkLine.push(
        new THREE.Vector3(0, (((yMax - yMin) * yCali) / 6) * i * scale, 0),
        new THREE.Vector3(
          -(scale / 200) * scale,
          (((yMax - yMin) * yCali) / 6) * i * scale,
          0
        )
      );
      yMarkLine.reduce((re, cu, idx) => {
        _yMarkLine.push(re, cu);
        return cu;
      });
  
      let _resultYmark = LineSegMesh(_yMarkLine, material);
      graphSet.add(_resultYmark);
  
      if (!(i === 0)) {
        let Xtext =
          data.obsrdtmnt[Math.round(data.obsrdtmnt.length / 6) * i - 1].slice(6);
        let Xanchor = [(xAxiosLength / 6) * i * scale, -(scale / 200) * scale, 0];
        xMarkLine.push(
          new THREE.Vector3((xAxiosLength / 6) * i * scale, 0, 0),
          new THREE.Vector3(
            (xAxiosLength / 6) * i * scale,
            -(scale / 200) * scale,
            0
          )
        );
        xMarkLine.reduce((re, cu, idx) => {
          _xMarkLine.push(re, cu);
          return cu;
        });
        let _resultXmark = LineSegMesh(_xMarkLine, material);
        graphSet.add(_resultXmark);
        textList.push({
          text: Xtext,
          anchor: Xanchor,
          rotation: 0,
          fontSize: scale * 3,
          align: "center",
        });
      }
    }
  
    textList.push({
      text: `${data.obsrdtmnt[0].slice(0, 5)} 댐 ${targetData[target]}`,
      anchor: [-(scale / 200) * scale, ((yMax - yMin) * yCali + 30) * scale, 0],
      rotation: 0,
      fontSize: scale * 8,
      align: "left",
    });
  
    const backgroundMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.8,
      metalness: 1,
      side: THREE.DoubleSide,
    });
    let backgroundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(200 * scale, 225 * scale),
      backgroundMat
    );
    backgroundMesh.position.set(
      backgroudMeshPos[0],
      backgroudMeshPos[1],
      backgroudMeshPos[2] - 15
    );
  
    graphSet.add(LabelInsert(textList, textMat));
    graphSet.add(_result);
    graphSet.add(_resultX);
    graphSet.add(_resultY);
    graphSet.add(backgroundMesh);
  
    graphSet.userData = {
      key: targetData[target],
      part: "수자원공사",
      name: "graph",
    };
  
    graphSet.name = "graph";
  
    // this.setOutputData(0, graphSet);
    return graphSet;
  };

  
export function LineSegMesh(point0, lineMaterial, z) {
    let points = [];
    let z1 = z ? z : 0;
    for (let i in point0) {
        points.push(new THREE.Vector3(point0[i].x, point0[i].y, z1));
    }
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let result = new THREE.LineSegments(geometry, lineMaterial);
    result.computeLineDistances();
    return result;
}

export function LabelInsert(label, textMaterial) {
    let index = 0;
    console.time("textLoader")
    let group = new THREE.Group()
    // var loader = new THREE.FontLoader();
    let mGeos = [];
    // loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
    // gloader.load('/fonts/korean.json', function (font) {
    // loader.load('/fonts/korean.json', function (font) {
    console.log("loadercheck")
    // loader.load('fonts/noto_sans_kr_regular.json', function (font) {
    // console.log(font)roundedRect
    // var font = {generateShapes:(messagem , num)=>{}}
    for (let i in label) {
        var shapes = koreanFont.generateShapes(label[i].text, label[i].fontSize);
        var geometry = new THREE.ShapeBufferGeometry(shapes);
        if (label[i].align === "left") {
            geometry.translate(0, -label[i].fontSize / 2, 0);
        } else if (label[i].align === "right") {
            var xMid
            geometry.computeBoundingBox();
            xMid = -1 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            geometry.translate(xMid, -label[i].fontSize / 2, 0);
        }
        else {
            var xMid
            geometry.computeBoundingBox();
            xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            geometry.translate(xMid, -label[i].fontSize / 2, 0);
        }

        if (label[i].rotation) {
            geometry.rotateZ(label[i].rotation)
        }
        geometry.translate(label[i].anchor[0], label[i].anchor[1], 0);
        mGeos.push(geometry)
        // make shape ( N.B. edge view not visible )
        // let textMesh = new THREE.Mesh(geometry, textMaterial);
        // textMesh.layers.set(layer)
        // group.add(textMesh);
    }

    if (mGeos.length > 0) {
        let textMesh = new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(mGeos), textMaterial);
        // textMesh.layers.set(layer)
        group.add(textMesh);
    }
    console.timeEnd("textLoader")
    index = 1;

    // });
    return group// text.position.z = 0;
}