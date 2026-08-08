import DPR from 'dpr';
import './utils/threeLoader';
import './utils/vectorThreeEnhancement';
import {CADTrackballControls} from './controls/CADTrackballControls';
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  Euler,
  GridHelper,
  Matrix4,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer
} from "three";
import {Emitter, stream} from "lstream";
import {Camera} from "three/src/cameras/Camera";

export default class SceneSetUp {
  workingSphere: number;
  container: HTMLElement;
  scene: Scene;
  rootGroup: Object3D;
  oCamera: OrthographicCamera;
  pCamera: PerspectiveCamera;
  camera: Camera;
  light: DirectionalLight;
  renderer: WebGLRenderer;
  originGrid: GridHelper;
  private _prevContainerWidth: number;
  private _prevContainerHeight: number;
  trackballControls: CADTrackballControls;
  viewportSizeUpdate$ = stream();
  sceneRendered$: Emitter<any> = stream();

  renderRequested: boolean;

  constructor(container) {

    this.workingSphere = 10000;
    this.container = container;
    this.scene = new Scene();
    this.rootGroup = this.scene;
    this.scene.userData.sceneSetUp = this;
    this.renderRequested = false;

    this.setUpCamerasAndLights();

    // Only set up controls and start animation if WebGL is available
    if (this.renderer) {
      this.setUpControls();
      this.animate();
    }
  }

  aspect() {
    return this.container.clientWidth / this.container.clientHeight;
  }

  requestRender() {
    this.renderRequested = true;
  }

  createOrthographicCamera() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const factor = ORTHOGRAPHIC_CAMERA_FACTOR;
    this.oCamera = new OrthographicCamera(-width / factor,
      width / factor,
      height / factor,
      -height / factor, 0.1, 1000000);
    this.oCamera.position.z = 1000;
    this.oCamera.position.x = -1000;
    this.oCamera.position.y = 300;
  }

  createPerspectiveCamera() {
    this.pCamera = new PerspectiveCamera( 60, this.aspect(), 0.1, 1000000 );
    this.pCamera.position.z = 1000;
    this.pCamera.position.x = -1000;
    this.pCamera.position.y = 300;
  }

  setUpCamerasAndLights() {
    this.createOrthographicCamera();
    this.createPerspectiveCamera();

    this.camera = this.pCamera;

    this.light = new DirectionalLight( 0xffffff );
    this.light.position.set( 10, 10, 10 );
    this.scene.add(this.light);

    this.scene.add( new AmbientLight( 0xffffff, 0.25 ) );
    // origin grid removed — hover grid provides reference on demand
    // this.addOriginGrid();

    if (!this.checkWebGLSupport()) {
      return;
    }

    this.renderer = new WebGLRenderer();
    this.renderer.setPixelRatio(DPR);
    this.updateClearColor();
    this.renderer.setSize( this.container.clientWidth,  this.container.clientHeight );
    this.container.appendChild( this.renderer.domElement );
  }

  checkWebGLSupport(): boolean {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

    if (!gl) {
      this.showWebGLWarning();
      return false;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      console.log('WebGL renderer:', vendor, renderer);
    }

    return true;
  }

  showWebGLWarning() {
    const warningOverlay = document.createElement('div');
    warningOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    warningOverlay.innerHTML = `
      <div style="max-width: 500px;">
        <h2 style="margin-bottom: 1rem; color: #ff6b6b;">WebGL Not Available</h2>
        <p style="margin-bottom: 1.5rem; line-height: 1.6;">
          JSketcher requires WebGL to render 3D graphics. Your browser or device does not appear to support WebGL.
        </p>
        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 600;">What to check:</p>
          <ul style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
            <li>Look for a popup in your browser's address bar (click the icon)</li>
            <li>Enable hardware acceleration in your browser settings</li>
            <li>Update your graphics drivers</li>
            <li>Try a different browser (Chrome, Firefox, Edge)</li>
          </ul>
        </div>
        <p style="margin-bottom: 1rem;">
          <a href="https://get.webgl.org/" target="_blank" style="color: #4fc3f7; text-decoration: underline;">
            Learn more about WebGL →
          </a>
        </p>
        <p style="font-size: 0.85rem; opacity: 0.7;">
          WebGL is a browser API for rendering interactive 3D graphics without plugins.
        </p>
      </div>
    `;

    if (this.container) {
      this.container.appendChild(warningOverlay);
    } else {
      document.body.appendChild(warningOverlay);
    }
  }

  addOriginGrid() {
    this.originGrid = new GridHelper(1600, 64, 0x4f7f9f, 0x59636f);
    this.originGrid.renderOrder = -2;

    const materials = Array.isArray(this.originGrid.material) ? this.originGrid.material : [this.originGrid.material];
    materials.forEach(material => {
      material.transparent = true;
      material.opacity = 0.24;
      material.depthWrite = false;
    });

    this.scene.add(this.originGrid);
  }

  updateClearColor() {
    if (!this.renderer) return;
    const cssColor = getComputedStyle(document.body)
      .getPropertyValue('--work-area-color').trim() || '#808080';
    this.renderer.setClearColor(new Color(cssColor), 1);
    this.requestRender();
  }
  
  updateViewportSize() {
    if (!this.renderer) return;
    if (this.container.clientWidth > 0 && this.container.clientHeight > 0) {
      this.updatePerspectiveCameraViewport();
      this.updateOrthographicCameraViewport();
      this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );
      this.viewportSizeUpdate$.next();
      this.__render_NeverCallMeFromOutside();
    }
  }

  updateViewportSizeIfNeeded() {
    if (this._prevContainerWidth !== this.container.clientWidth || 
        this._prevContainerHeight !== this.container.clientHeight) {
      this.updateViewportSize();
      this._prevContainerWidth = this.container.clientWidth;
      this._prevContainerHeight = this.container.clientHeight;
    }
  }

  updatePerspectiveCameraViewport() {
    this.pCamera.aspect = this.aspect();
    this.pCamera.updateProjectionMatrix();
  }

  updateOrthographicCameraViewport() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const factor = ORTHOGRAPHIC_CAMERA_FACTOR;
    this.oCamera.left = - width / factor;
    this.oCamera.right = width / factor;
    this.oCamera.top = height / factor;
    this.oCamera.bottom = - height / factor;
    this.oCamera.updateProjectionMatrix();
  }

  syncCameras(sourceCamera, targetCamera) {
    const camPosition = new Vector3();
    const camRotation = new Euler();
    const tempMatrix = new Matrix4();

    camPosition.setFromMatrixPosition( targetCamera.matrixWorld );
    camRotation.setFromRotationMatrix( tempMatrix.extractRotation( targetCamera.matrixWorld ) );
    const camDistance = sourceCamera.position.length();

    sourceCamera.up.copy(this.camera.up);
    sourceCamera.position.copy(camPosition);
    sourceCamera.quaternion.copy(camPosition);
    sourceCamera.position.normalize();
    sourceCamera.position.multiplyScalar(camDistance);
  }

  setCamera(camera) {
    this.syncCameras(camera, this.camera);
    this.camera = camera;
    this.trackballControls.setCameraMode(camera.isOrthographicCamera);
    this.trackballControls.object = camera;
    this.requestRender();
  }

  setUpControls() {
    //  controls = new THREE.OrbitControls( camera , renderer.domElement);
    const trackballControls: any = new CADTrackballControls(this.camera , this.renderer.domElement);

    // document.addEventListener( 'mousemove', function(){

    //   controls.update();

    // }, false );
    trackballControls.rotateSpeed = 3.8 * DPR;
    trackballControls.projectionZoomSpeed = 0.5 * DPR;
    trackballControls.zoomSpeed = 1.2 * DPR;
    trackballControls.panSpeed = 0.3 * DPR;

    trackballControls.noZoom = false;
    trackballControls.noPan = false;

    trackballControls.staticMoving = true;
    trackballControls.dynamicDampingFactor = 0.3;

    trackballControls.keys = [ 65, 83, 68 ];
    this.trackballControls = trackballControls;
  }

  createRaycaster(viewX, viewY) {
    const raycaster = new Raycaster();
    raycaster.params.Line.threshold = 12 * (this._zoomMeasure() * 0.8);

    (raycaster.params as any).Line2 = {
      threshold: 20
    };

    const x = ( viewX / this.container.clientWidth ) * 2 - 1;
    const y = - ( viewY / this.container.clientHeight ) * 2 + 1;

    const mouse = new Vector3( x, y, 1 );
    raycaster.setFromCamera( mouse, this.camera );
    return raycaster;
  }
  
  raycast(event, objects, logInfoOut = null) {
    const raycaster = this.createRaycaster(event.offsetX, event.offsetY);
    if (logInfoOut !== null) {
      logInfoOut.ray = raycaster.ray
    }

    const intersects = [];

    function intersectObject(object) {

      object.raycast( raycaster, intersects );

      const children = object.children;

      if (object.visible) {
        for ( let i = 0, l = children.length; i < l; i ++ ) {
          intersectObject(children[ i ]);
        }
      }
    }

    objects.forEach(intersectObject);

    intersects.sort((a, b) => {
      if (Math.abs(a.distance - b.distance) < 0.01 && (a.object.raycastPriority || b.object.raycastPriority)) {
        return b.object.raycastPriority||0 - a.object.raycastPriority||0;
      }
      return a.distance - b.distance;
    })
    return intersects;
  }

  customRaycast(from3, to3, objects) {
    const raycaster = new Raycaster();
    const from = new Vector3().fromArray(from3);
    const to = new Vector3().fromArray(to3);
    const dir = to.sub(from);
    const dist = dir.length();
    raycaster.set(from, dir.normalize());
    return raycaster.intersectObjects(objects, true ).filter(h => h.distance <= dist);
  }
  
  modelToScreen(pos) {
    const width = this.container.clientWidth, height = this.container.clientHeight;
    const widthHalf = width / 2, heightHalf = height / 2;

    const vector = new Vector3();
    vector.copy(pos);
    vector.project(this.camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    return vector;
  }
  
  lookAtObject(obj) {
    const camera = this.camera;

    const box = new Box3();
    box.setFromObject(obj);
    const size = box.getSize(new Vector3());
    //this.camera.position.set(0,0,0);

    box.getCenter(camera.position);
    const maxSize = Math.max(size.x, size.z);
    camera.position.addScaledVector(camera.position.normalize(), 5000);
    //this.camera.position.sub(new THREE.Vector3(0, 0, dist));
    camera.up = new Vector3(0, 1, 0);
  }

  _zoomMeasure() {
    return this.trackballControls.object.position.length() / 1e3;
  }
  
  animate() {
    requestAnimationFrame( () => this.animate() );
    const controlsChangedViewpoint = this.trackballControls.evaluate();
    if (controlsChangedViewpoint || this.renderRequested) {
      this.__render_NeverCallMeFromOutside();
    }
    this.updateViewportSizeIfNeeded();
  }

  private __render_NeverCallMeFromOutside() {
    if (!this.renderer) return;
    this.renderRequested = false;
    this.light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    this.renderer.render(this.scene, this.camera);
    this.sceneRendered$.next();
  }

  domElement() {
    return this.renderer ? this.renderer.domElement : null;
  }
}

export function getSceneSetup(object3D) {
  do {
    if (object3D.userData.sceneSetUp) {
      return object3D.userData.sceneSetUp;
    }
    object3D = object3D.parent;
  } while(object3D);
  return null;
}

const ORTHOGRAPHIC_CAMERA_FACTOR = 1;
