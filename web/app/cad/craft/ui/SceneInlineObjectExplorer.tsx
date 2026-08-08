import React, {useState, useContext} from 'react';
import {MShell} from 'cad/model/mshell';
import {MDatum} from 'cad/model/mdatum';
import {MOpenFaceShell} from "cad/model/mopenFace";
import {MSketch} from "cad/model/msketch";
import {useStream, useStreamWithPatcher} from "ui/effects";
import {MObject} from "cad/model/mobject";
import {SceneInlineDelineation, SceneInlineSection} from "ui/components/SceneInlineSection";
import {GenericExplorerControl, GenericExplorerNode} from "ui/components/GenericExplorer";
import ls from "cad/craft/ui/ObjectExplorer.less";
import Fa from "ui/components/Fa";
import {AiOutlineEye, AiOutlineEyeInvisible} from "react-icons/ai";
import {FiEdit} from "react-icons/fi";
import {ModelButtonBehavior} from "cad/craft/ui/ModelButtonBehaviour";
import {ModelAttributes} from "cad/attributes/attributesService";
import {ReactApplicationContext} from "cad/dom/ReactApplicationContext";


export function SceneInlineObjectExplorer() {

  const models = useStream(ctx => ctx.craftService.models$) as MObject[];
  const sketchModels = useStream(ctx => ctx.streams.sketcher.sketchModels) as MSketch[];

  if (!models) {
    return null;
  }

  const originDatum = models.filter(m => m instanceof MDatum && m.originatingOperation === -1);
  const originPlanes = models.filter(m => m instanceof MOpenFaceShell && m.ext.isOriginPlane);
  const otherModels = models.filter(m =>
    !(m instanceof MDatum && m.originatingOperation === -1) &&
    !(m instanceof MOpenFaceShell && m.ext.isOriginPlane)
  );

  return <SceneInlineSection title='OBJECTS'>
    {sketchModels && sketchModels.length > 0 && <Section label='Sketches' defaultOpen={false}>
      {sketchModels.map(s => <SketchSection sketch={s} key={s.id}/>)}
    </Section>}
    <Section label='Origin' defaultOpen={false}>
      {originDatum.map(m => <ModelSection model={m} key={m.id} controlVisibility/>)}
      {originPlanes.map(m => <OpenFaceSection shell={m} key={m.id}/>)}
    </Section>
    {otherModels.map(m => {
    if (m instanceof MOpenFaceShell) {
      return <OpenFaceSection shell={m} key={m.id} />
    } else if (m instanceof MShell) {
      return <ModelSection model={m} key={m.id} controlVisibility>
        <Section label='faces' defaultOpen={true}>
          {
            m.faces.map(f => <FaceSection face={f} key={f.id}/>)
          }
        </Section>
        <Section label='edges' defaultOpen={true}>
          {m.edges.map(e => <EdgeSection edge={e} key={e.id}/>)}
        </Section>

      </ModelSection>
    } else if (m instanceof MDatum) {
      return <ModelSection model={m} key={m.id} controlVisibility/>;
    } else {
      return null;
    }
  })}
  </SceneInlineSection>
}

function EdgeSection({edge}) {
  return <ModelSection model={edge} key={edge.id}>
    {edge.adjacentFaces.map(f => <FaceSection face={f} key={f.id}/>)}
  </ModelSection>
}

function FaceSection({face}) {
  return <ModelSection model={face} key={face.id}>

    {(face.productionInfo && face.productionInfo.role) &&
    <Section label={<span>role: {face.productionInfo.role}</span>}/>}
    {(face.productionInfo && face.productionInfo.originatedFromPrimitive) &&
    <Section label={<span>origin: {face.productionInfo.originatedFromPrimitive}</span>}/>}
    <SketchesList face={face}/>
    {face.edges && <Section label='edges' defaultOpen={false}>
      {face.edges.map(e => <EdgeSection edge={e} key={e.id}/>)}
    </Section>}
  </ModelSection>;
}

function SketchesList({face}) {
  return <Section
    label={face.sketchObjects.length ? 'sketch' : <span className={ls.hint}>{'<no sketch assigned>'}</span>}>
    {face.sketchObjects.map(o => <ModelSection
      key={o.id}
      model={o}
      expandable={false}
    />)}
  </Section>;
}


export function ModelSection({model, expandable = true, controlVisibility = false, ...props}: {
  model: MObject,
  children?: any,
  controlVisibility?: boolean,
  expandable?: boolean,
}) {

  return <ModelButtonBehavior model={model} controlVisibility={controlVisibility}>
    {behavior => <GenericExplorerNode defaultExpanded={false}
                                   expandable={expandable}
                                   label={behavior.label}
                                   selected={behavior.selected}
                                   select={behavior.select}
                                   highlighted={behavior.highlighted}
                                   onMouseEnter={behavior.onMouseEnter}
                                   onMouseLeave={behavior.onMouseLeave}
                                   controls={behavior.controls}>
      {props.children}
    </GenericExplorerNode>}
  </ModelButtonBehavior>;
}

function SketchSection({sketch}) {
  const ctx = useContext(ReactApplicationContext);
  const editSketch = (e) => {
    e.stopPropagation();
    ctx.sketcherService.sketchFace(sketch.face);
    return false;
  };
  return <ModelButtonBehavior model={sketch}>
    {behavior => <GenericExplorerNode defaultExpanded={false}
                                   expandable={false}
                                   label={behavior.label}
                                   selected={behavior.selected}
                                   select={behavior.select}
                                   highlighted={behavior.highlighted}
                                   onMouseEnter={behavior.onMouseEnter}
                                   onMouseLeave={behavior.onMouseLeave}
                                   controls={<GenericExplorerControl onClick={editSketch} title="edit sketch" on={false}>
                                     <FiEdit />
                                   </GenericExplorerControl>}>
    </GenericExplorerNode>}
  </ModelButtonBehavior>;
}

function OpenFaceSection({shell}) {
  return <ModelSection model={shell} key={shell.id} controlVisibility>
  </ModelSection>;
}

function Section(props) {

  const [expanded, setExpanded] = useState(!props.defaultCollapsed);

  const tweakClose = () => {
    setExpanded(exp => !exp);
  };

  return <>
    <SceneInlineDelineation onClick={tweakClose} style={{cursor: 'pointer'}}>
      <Fa fw icon={'caret-' + (expanded ? 'down' : 'right')}/>
      <span className={ls.label}>{props.label}</span>
    </SceneInlineDelineation>
    {expanded && props.children}
  </>;
}

export function VisibleSwitch({modelId}) {

  const [attrs, patch] = useStreamWithPatcher<ModelAttributes>(ctx => ctx.attributesService.streams.get(modelId));

  const onClick = (e) => {
    patch(attr => {
      attr.hidden = !attr.hidden
    });
    e.stopPropagation();
    return false;
  }

  return <GenericExplorerControl onClick={onClick} title={attrs.hidden ? 'show' : 'hide'} on={attrs.hidden}>
    {attrs.hidden ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
  </GenericExplorerControl>
}