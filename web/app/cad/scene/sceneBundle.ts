import Viewer from './viewer';
import CadScene from './cadScene';
import {ApplicationContext} from "cad/context";

export function activate(ctx: ApplicationContext) {
  const {services} = ctx;
  const {dom} = services;

  const viewerContainer = dom.viewerContainer || document.getElementById('viewer-container');

  if (!viewerContainer) {
    console.error('Viewer container not found - cannot initialize scene');
    return;
  }

  const viewer = new Viewer(viewerContainer);

  // If WebGL is not available, don't proceed with scene setup
  if (!viewer.sceneSetup.renderer) {
    // Still set up basic viewer service so other bundles don't crash
    services.viewer = viewer;
    ctx.viewer = viewer;

    // Add dummy services for WebGL-dependent bundles that were skipped
    const highlightedSet = new Set();
    services.highlightService = {
      highlighted$: {
        value: highlightedSet,
        attach: (fn) => { fn(highlightedSet); return () => {}; }
      },
      highlight: () => {},
      clear: () => {}
    };
    ctx.highlightService = services.highlightService;

    // Add dummy cadScene
    services.cadScene = {
      workGroup: { children: [] },
      auxGroup: { children: [], visible: true }
    };
    ctx.cadScene = services.cadScene;

    // Add dummy pickControl
    services.pickControl = {
      pick: () => [],
      pickRay: () => null
    };
    ctx.pickControl = services.pickControl;

    // Add dummy modelMouseEventSystem
    services.modelMouseEventSystem = {
      dispatchMousedown: () => {},
      dispatchMouseup: () => {},
      dispatchMousemove: () => {},
      dispatchDblclick: () => {}
    };
    ctx.modelMouseEventSystem = services.modelMouseEventSystem;

    return;
  }

  services.viewer = viewer;
  services.cadScene = new CadScene(viewer.sceneSetup.rootGroup);

  ctx.viewer = viewer;
  ctx.cadScene = services.cadScene;

  let showMenu = false;
  viewerContainer.addEventListener('mousedown', (e) => {
    if (e.which == 3 || e.button == 2) {
      showMenu = true;
    }
  });

  viewerContainer.addEventListener('mousemove', (e) => {
    showMenu = false;
  });

  viewerContainer.addEventListener('mouseup', (e) => {
    if (showMenu) {
      ctx.actionService.run('menu.contextual', {
        x: e.offsetX,
        y: e.offsetY
      })
    }
  }, false);

  // let sketcher3D = new Sketcher3D(viewerContainer);
  // services.viewer.setCameraMode(CAMERA_MODE.ORTHOGRAPHIC);

  document.addEventListener('contextmenu', e => {
    // @ts-ignore
    if (e.target.closest('#viewer-container')) {
      e.preventDefault();
    }
  });

}

export function dispose(ctx) {
  if (ctx.services.viewer && ctx.services.viewer.sceneSetup.renderer) {
    ctx.services.viewer.dispose();
  }
}

export interface SceneBundleContext {

  cadScene: CadScene;
  viewer: Viewer;
}

export const BundleName = "@Scene";