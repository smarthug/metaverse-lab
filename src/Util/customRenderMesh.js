import {
    Color,
    FrontSide,
    LinearFilter,
    MathUtils,
    Matrix4,
    Mesh,
    PerspectiveCamera,
    Plane,
    RGBFormat,
    ShaderMaterial,
    UniformsLib,
    UniformsUtils,
    Vector3,
    Vector4,
    WebGLRenderTarget
} from 'three';


export default class CustomRenderMesh extends Mesh {

    constructor(geometry, material, options = {}) {
        super(geometry, material);

        const scope = this;


        const parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBFormat
		};


        const renderTarget = new WebGLRenderTarget( 512, 512, parameters );
        const mirrorCamera2 = new PerspectiveCamera();

        scope.onBeforeRender = function (renderer, scene, camera) {
            // console.log("test")
            const currentRenderTarget = renderer.getRenderTarget();

			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			scope.visible = false;
            //수상한데 ...
			renderer.xr.enabled = false; // Avoid camera modification and recursion
			renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

			renderer.setRenderTarget( renderTarget );

			renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

			if ( renderer.autoClear === false ) renderer.clear();

            // render 만 안하면 된다고 ????
			renderer.render( scene, camera );
            // renderer.render( scene, mirrorCamera2 );

			scope.visible = true;

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			renderer.setRenderTarget( currentRenderTarget );
        }


    }

}