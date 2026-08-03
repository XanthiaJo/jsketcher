import React, {useContext} from 'react';
import {useStreamWithUpdater} from "ui/effects";
import cx from 'classnames';
import ls from "./StageControl.less";
import {SketcherAppContext} from "./SketcherAppContext";

export function StageControl() {

  const [stages, setStages] = useStreamWithUpdater(ctx => ctx.viewer.parametricManager.$stages);
  const {viewer} = useContext(SketcherAppContext);

  const setStage = pointer => setStages(stages => ({
    ...stages,
    pointer
  }));

  const createStage = () => viewer.parametricManager.newStage();

  const removeStage = (e, i) => {
    e.stopPropagation();
    viewer.parametricManager.removeStage(i);
  };

  const canRemove = stages.list.length > 1;

  return <div className={ls.root}>
    {stages.list.map((stage, i) => <div key={i} className={cx(ls.stage, i === stages.pointer && ls.active)}>
      <button onClick={() => setStage(i)}>{i}.</button>
      {canRemove && <button className={ls.removeButton} title="Remove stage" onClick={e => removeStage(e, i)}>&times;</button>}
    </div>)}
    <div><button onClick={createStage} title="Add stage">+</button></div>
  </div>
}
