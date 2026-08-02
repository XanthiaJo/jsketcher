import React, {useContext, useEffect, useRef, useState} from 'react';
import {Matrix4, Spherical} from 'three';
import {ReactApplicationContext} from "cad/dom/ReactApplicationContext";
import ls from './ViewCube.less';

const faces = [
  {id: 'StandardViewFront', label: 'Front', className: ls.front, labelClassName: ls.labelFront},
  {id: 'StandardViewBack', label: 'Back', className: ls.back, labelClassName: ls.labelBack},
  {id: 'StandardViewRight', label: 'Right', className: ls.right, labelClassName: ls.labelRight},
  {id: 'StandardViewLeft', label: 'Left', className: ls.left, labelClassName: ls.labelLeft},
  {id: 'StandardViewTop', label: 'Top', className: ls.bottom, labelClassName: ls.labelTop},
  {id: 'StandardViewBottom', label: 'Bottom', className: ls.top, labelClassName: ls.labelBottom},
];

const syncRotation = new Matrix4();

function cameraTransform(ctx) {
  const sceneSetup = ctx?.services?.viewer?.sceneSetup;
  const camera = sceneSetup?.camera;
  if (!camera) {
    return 'rotateX(-18deg) rotateY(36deg)';
  }

  syncRotation.extractRotation(camera.matrixWorldInverse);

  const elements = syncRotation.elements.map(value => {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Number(value.toFixed(8));
  });

  return `matrix3d(${[
    elements[0], -elements[1], elements[2], elements[3],
    elements[4], -elements[5], elements[6], elements[7],
    elements[8], -elements[9], elements[10], elements[11],
    elements[12], -elements[13], elements[14], elements[15],
  ].join(',')})`;
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
  spherical.phi += dy * 0.018;
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
            <span className={`${ls.faceLabel} ${face.labelClassName}`}>{face.label}</span>
          </button>
        )}
      </div>
    </div>
  </div>;
}
