import {Emitter, externalState, state, StateStream, stream} from "lstream";
import SceneSetUp from "scene/sceneSetup";

export enum ViewMode {
  WIREFRAME = 'WIREFRAME',
  SHADED = 'SHADED',
  SHADED_WITH_EDGES = 'SHADED_WITH_EDGES'
}

export enum OrbitMode {
  TRACKBALL = 'TRACKBALL',
  TURNTABLE = 'TURNTABLE'
}

export default class Viewer {

  cameraMode$: StateStream<any>;
  orbitMode$: StateStream<OrbitMode>;
  viewMode$: StateStream<ViewMode> = state(ViewMode.SHADED_WITH_EDGES);

  sceneSetup: SceneSetUp;

  constructor(container) {

    this.cameraMode$ = externalState(() => this.getCameraMode(), mode => this.setCameraMode(mode))

    this.sceneSetup = new SceneSetUp(container);

    // Only initialize orbit mode if WebGL is available
    if (this.sceneSetup.renderer) {
      this.orbitMode$ = externalState(() => this.getOrbitMode(), mode => this.setOrbitMode(mode));
      this.applyOrbitMode(this.getOrbitMode());
    }
  }
  
  render() {
    this.requestRender();
  }

  requestRender = () => {
    this.sceneSetup.requestRender();
  };

  updateClearColor() {
    this.sceneSetup.updateClearColor();
  }
  
  setVisualProp = (obj, prop, value) => {
    if (obj[prop] !== value) {
      obj[prop] = value;
      this.requestRender();
    }
  };

  lookAtObject(obj) {
    this.sceneSetup.lookAtObject(obj);
  }
  
  raycast(event, objects, logInfoOut) {
    return this.sceneSetup.raycast(event, objects, logInfoOut);
  }
  
  customRaycast(from3, to3, objects) {
    return this.sceneSetup.customRaycast(from3, to3, objects);
  }
  
  setCameraMode(mode) {
    if (this.getCameraMode() === mode) {
      return;
    }
    if (mode === CAMERA_MODE.PERSPECTIVE) {
      this.sceneSetup.setCamera(this.sceneSetup.pCamera);
    } else {
      this.sceneSetup.setCamera(this.sceneSetup.oCamera);
    }
  }

  getCameraMode() {
    return this.sceneSetup.camera === this.sceneSetup.pCamera ? CAMERA_MODE.PERSPECTIVE : CAMERA_MODE.ORTHOGRAPHIC;
  }
  
  toggleCamera() {
    if (this.getCameraMode() === CAMERA_MODE.PERSPECTIVE) {
      this.setCameraMode(CAMERA_MODE.ORTHOGRAPHIC);
    } else {
      this.setCameraMode(CAMERA_MODE.PERSPECTIVE);
    }
  }

  getOrbitMode(): OrbitMode {
    try {
      const saved = localStorage.getItem('jsketcher.orbitMode');
      if (saved === OrbitMode.TURNTABLE || saved === OrbitMode.TRACKBALL) {
        return saved as OrbitMode;
      }
    } catch (e) {
      // Storage may be unavailable; fall back to default.
    }
    return OrbitMode.TRACKBALL;
  }

  setOrbitMode(mode: OrbitMode) {
    if (this.getOrbitMode() === mode) {
      return;
    }
    try {
      localStorage.setItem('jsketcher.orbitMode', mode);
    } catch (e) {
      // Mode still changes for the session if storage is unavailable.
    }
    this.applyOrbitMode(mode);
  }

  applyOrbitMode(mode: OrbitMode) {
    if (this.sceneSetup.trackballControls) {
      this.sceneSetup.trackballControls.setRotationMode(mode === OrbitMode.TURNTABLE ? 'turntable' : 'trackball');
      this.requestRender();
    }
  }

  toggleOrbitMode() {
    if (!this.orbitMode$) return;
    const next = this.getOrbitMode() === OrbitMode.TRACKBALL ? OrbitMode.TURNTABLE : OrbitMode.TRACKBALL;
    this.orbitMode$.next(next);
  }
  
  zoomIn() {
    if (this.sceneSetup.trackballControls) {
      this.sceneSetup.trackballControls.zoomStep(1, -5);
    }
  }

  zoomOut() {
    if (this.sceneSetup.trackballControls) {
      this.sceneSetup.trackballControls.zoomStep(1, 5);
    }
  }

  lookAt(target, normal, up, dist) {
    if (!this.sceneSetup.trackballControls) return;
    const obj = this.sceneSetup.trackballControls.object;
    if (up) {
      obj.up.copy(up);
    }
    if (dist === undefined) {
      dist = target.distanceTo(obj.position);
    }
    obj.position.copy(target);
    obj.position.addScaledVector(normal, dist);
    this.sceneSetup.trackballControls.target.copy(target);
    this.requestRender();
  }

  dispose() {
    if (this.sceneSetup.renderer) {
      this.sceneSetup.renderer.dispose();
    }
  }
}

export const CAMERA_MODE = {
  ORTHOGRAPHIC: 'ORTHOGRAPHIC',
  PERSPECTIVE: 'PERSPECTIVE'  
};

