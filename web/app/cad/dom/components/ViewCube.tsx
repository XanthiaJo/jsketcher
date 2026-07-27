import React, {useContext, useEffect, useRef, useState} from 'react';
import {Spherical} from 'three';
import {ReactApplicationContext} from "cad/dom/ReactApplicationContext";
import ls from './ViewCube.less';

const faces = [
  {id: 'StandardViewFront', label: 'Front', className: ls.front},
  {id: 'StandardViewBack', label: 'Back', className: ls.back},
  {id: 'StandardViewRight', label: 'Right', className: ls.right},
  {id: 'StandardViewLeft', label: 'Left', className: ls.left},
  {id: 'StandardViewTop', label: 'Top', className: ls.top},
  {id: 'StandardViewBottom', label: 'Bottom', className: ls.bottom},
];

function cameraTransform(ctx) {
  const sceneSetup = ctx?.services?.viewer?.sceneSetup;
  const camera = sceneSetup?.camera;
  const target = sceneSetup?.trackballControls?.target;
  if (!camera || !target) {
    return 'rotateX(-18deg) rotateY(36deg)';
  }

  const direction = camera.position.clone().sub(target).normalize();
  const yaw = Math.atan2(direction.x, direction.z);
  const pitch = Math.asin(direction.y);
  const roll = Math.atan2(camera.up.x, camera.up.y);

  return `rotateZ(${roll}rad) rotateX(${-pitch}rad) rotateY(${-yaw}rad)`;
}

function rotateCamera(ctx, dx: number, dy: number) {
  const sceneSetup = ctx?.services?.viewer?.sceneSetup;
  const camera = sceneSetup?.camera;
  const target = sceneSetup?.trackballControls?.target;
  if (!camera || !target) {
    return;
  }

  const eye = camera.position.clone().sub(target);
  const spherical = new Spherical().setFromVector3(eye);
  spherical.theta -= dx * 0.018;
  spherical.phi -= dy * 0.018;
  spherical.makeSafe();

  eye.setFromSpherical(spherical);
  camera.position.copy(target).add(eye);
  camera.lookAt(target);
  ctx.services.viewer.requestRender();
}

export default function ViewCube() {
  const ctx = useContext(ReactApplicationContext);
  const [transform, setTransform] = useState(() => cameraTransform(ctx));
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({x: 0, y: 0});
  const dragPrev = useRef({x: 0, y: 0});

  useEffect(() => {
    const update = () => setTransform(cameraTransform(ctx));
    const sceneRendered = ctx?.services?.viewer?.sceneSetup?.sceneRendered$;
    update();

    if (!sceneRendered) {
      return undefined;
    }

    return sceneRendered.attach(update);
  }, [ctx]);

  const runView = (actionId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    ctx.actionService.run(actionId, undefined);
  };

  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    didDrag.current = false;
    dragStart.current = {x: e.clientX, y: e.clientY};
    dragPrev.current = dragStart.current;

    const move = (moveEvent: MouseEvent) => {
      if (!dragging.current) {
        return;
      }

      moveEvent.preventDefault();
      const dx = moveEvent.clientX - dragPrev.current.x;
      const dy = moveEvent.clientY - dragPrev.current.y;
      const totalDx = moveEvent.clientX - dragStart.current.x;
      const totalDy = moveEvent.clientY - dragStart.current.y;
      didDrag.current = didDrag.current || Math.hypot(totalDx, totalDy) > 3;
      dragPrev.current = {x: moveEvent.clientX, y: moveEvent.clientY};
      rotateCamera(ctx, dx, dy);
    };

    const stop = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', stop);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stop);
  };

  return <div className={ls.root} aria-label='View cube orientation controls'>
    <button
      type='button'
      className={ls.home}
      onClick={runView('StandardView3Way')}
      title='View three way'
      aria-label='View three way'
    >
      <span className={ls.homeRoof} />
      <span className={ls.homeBody} />
      <span className={ls.homeLabel}>Home</span>
    </button>
    <div className={ls.scene}>
      <div className={ls.cube} style={{transform}} onMouseDown={startDrag}>
        {faces.map(face =>
          <button
            key={face.id}
            type='button'
            className={`${ls.face} ${face.className}`}
            onClick={runView(face.id)}
            title={`View ${face.label}`}
          >
            {face.label}
          </button>
        )}
      </div>
    </div>
  </div>;
}
