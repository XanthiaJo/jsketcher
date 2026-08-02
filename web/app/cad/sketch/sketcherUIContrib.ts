import objectToolActions from '../../sketcher/actions/objectToolActions';
import measureActions from '../../sketcher/actions/measureActions';
import {insertAfter} from 'gems/iterables';
import operationActions from "../../sketcher/actions/operationActions";
import constraintGlobalActions from "../../sketcher/actions/constraintGlobalActions";
import generalToolActions from "../../sketcher/actions/generalToolActions";
import sketcherControlActions from "./sketcherControlActions";
import {ApplicationContext} from "cad/context";
import {RiCompasses2Line} from "react-icons/ri";
import {ribbonIcon} from "cad/workbench/modelerRibbonIcon";
import {sketcherRibbonIcon} from "cad/workbench/sketcherRibbonIcon";

export default function (ctx: ApplicationContext) {

  const convertedActions = [
    ...constraintGlobalActions,
    ...measureActions,
    ...generalToolActions,
    ...objectToolActions,
    ...operationActions,
  ].map(convertSketcherAction);

  const SKETCHER_MODE_HEADS_UP_ACTIONS = [
    ['sketchSaveAndExit', sketcherRibbonIcon('sketchSaveAndExit')],
    ['sketchExit', sketcherRibbonIcon('sketchExit')],
    '-',
    generalToolActions.map(a => [toSketcherActionId(a.id), sketcherRibbonIcon(a.id)]),
    '-',
    [
      ...objectToolActions.map(a => [toSketcherActionId(a.id), sketcherRibbonIcon(a.id)]),
      [toSketcherActionId('Offset'), sketcherRibbonIcon('Offset')],
      [toSketcherActionId('MirrorStart'), sketcherRibbonIcon('MirrorStart')],
    ],
    '-',
    measureActions.map(a => [toSketcherActionId(a.id), sketcherRibbonIcon(a.id)]),
    '-',
    //constraintGlobalActions.map(a => [toSketcherActionId(a.id), sketcherRibbonIcon(a.id)]),
    //'-',
    ['LookAtFace', ribbonIcon('LookAtFace')],
    '-',
    ['sketchOpenInTab', sketcherRibbonIcon('sketchOpenInTab')]
  ];

  insertAfter(SKETCHER_MODE_HEADS_UP_ACTIONS, SKETCHER_PREFIX + 'Export', '-');
  insertAfter(SKETCHER_MODE_HEADS_UP_ACTIONS, SKETCHER_PREFIX + 'PanTool', '-');
  insertAfter(SKETCHER_MODE_HEADS_UP_ACTIONS, SKETCHER_PREFIX + 'BezierTool', '-');

  ctx.workbenchService.registerWorkbench({
    workbenchId: 'sketcher',
    internal: true,
    features: [],
    actions: [
      ...sketcherControlActions,
      ...convertedActions
    ],
    ui: {
      toolbar: SKETCHER_MODE_HEADS_UP_ACTIONS,
      toolbarStyle: 'compact'
    },
    icon: RiCompasses2Line
  });
}

const SKETCHER_PREFIX = 'sketcher.';

function toSketcherActionId(id: string): string {
  return SKETCHER_PREFIX + id;
}

function convertSketcherAction(action) {

  return   {
    id: toSketcherActionId(action.id),
    appearance: {
      icon: action.icon,
      label: action.shortName,
      info: action.description,
    },
    invoke: ({services}, e) => action.invoke(services.sketcher.inPlaceEditor.sketcherAppContext)
  }
}


