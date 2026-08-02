import React, {useContext, useEffect, useRef} from 'react';
import cameraControlRenderer from 'scene/cameraControlRenderer';
import {ReactApplicationContext} from 'cad/dom/ReactApplicationContext';
import ls from './CameraControl.less';

export default function CameraControl() {
  const ctx = useContext(ReactApplicationContext);
  const domRef = useRef(null);

  useEffect(() => {
    const sceneSetup = ctx?.services?.viewer?.sceneSetup;
    if (!domRef.current || !sceneSetup?.camera || !sceneSetup?.sceneRendered$) {
      return undefined;
    }

    const renderer = cameraControlRenderer(domRef.current);
    const update = () => renderer.render(sceneSetup.camera);

    update();
    const detach = sceneSetup.sceneRendered$.attach(update);

    return () => {
      detach();
      renderer.dispose();
    };
  }, [ctx]);

  return <div ref={domRef} className={ls.cameraControl} aria-hidden='true' />;
}
