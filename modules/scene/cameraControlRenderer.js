import {AmbientLight, PerspectiveCamera, Scene, SpotLight, WebGLRenderer} from 'three';
import DPR from '../dpr';
import {MeshArrow} from './objects/auxiliary';
import * as SceneGraph from './sceneGraph';
import {AXIS} from "math/vector";

function checkWebGLSupport(container) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    showWebGLWarning(container);
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

function showWebGLWarning(container) {
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

  container.appendChild(warningOverlay);
}

export default function(container) {

  function createBasisArrow(axis, color) {
    return new MeshArrow({
      dir: axis,
      color,
      length: 1, 
      headLength: 0.3, 
      headWidth: 0.15, 
      lineWidth: 0.02
    });
  }

  const xAxis = createBasisArrow(AXIS.X, 0xFF0000);
  const yAxis = createBasisArrow(AXIS.Y, 0x00FF00);
  const zAxis = createBasisArrow(AXIS.Z, 0x0000FF);

  const root = SceneGraph.createGroup();
  const csys = SceneGraph.createGroup();

  const scene = new Scene();
  csys.add(xAxis);
  csys.add(yAxis);
  csys.add(zAxis);
  
  root.add(csys);
  scene.add(root);

  const ambientLight = new AmbientLight(0x0f0f0f);
  scene.add(ambientLight);

  const spotLight = new SpotLight(0xffffff);
  spotLight.position.set(0, 0, 5);
  spotLight.castShadow = true;
  scene.add(spotLight);
  
  const camera = new PerspectiveCamera( 25, 1, 0.1, 2000 );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 5;

  if (!checkWebGLSupport(container)) {
    return { render: () => {}, dispose: () => {} };
  }

  const renderer = new WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(DPR);
  // renderer.setClearColor(0x000000, 1);
  // renderer.setClearAlpha(0);
  renderer.setSize( container.clientWidth,  container.clientHeight );
  container.appendChild( renderer.domElement );

  function renderScene() {
    renderer.render(scene, camera);
  }
  
  function render(cameraToSync) {
    root.quaternion.setFromRotationMatrix( cameraToSync.matrixWorldInverse );
    renderScene();
  }
  
  function dispose() {
    xAxis.dispose();
    yAxis.dispose();
    zAxis.dispose();
    renderer.dispose();
  }

  return {
    render, dispose
  }
}
