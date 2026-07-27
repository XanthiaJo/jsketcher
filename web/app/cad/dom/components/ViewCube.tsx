import React, {useContext, useEffect, useState} from 'react';
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
  const camera = ctx?.services?.viewer?.sceneSetup?.camera;
  if (!camera) {
    return 'rotateX(-18deg) rotateY(36deg)';
  }

  const direction = camera.position.clone().normalize();
  const yaw = Math.atan2(direction.x, direction.z);
  const pitch = Math.asin(direction.y);
  const roll = Math.atan2(camera.up.x, camera.up.y);

  return `rotateZ(${roll}rad) rotateX(${-pitch}rad) rotateY(${yaw}rad)`;
}

export default function ViewCube() {
  const ctx = useContext(ReactApplicationContext);
  const [transform, setTransform] = useState(() => cameraTransform(ctx));

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
    ctx.actionService.run(actionId, undefined);
  };

  return <div className={ls.root} aria-label='View cube orientation controls'>
    <div className={ls.scene}>
      <button
        type='button'
        className={ls.corner}
        onClick={runView('StandardView3Way')}
        title='View three way'
        aria-label='View three way'
      />
      <div className={ls.cube} style={{transform}}>
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
