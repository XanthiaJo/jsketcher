import React from 'react';
import Menu, {MenuItem, MenuSeparator} from 'ui/components/Menu';
import Filler from 'ui/components/Filler';
import Fa from 'ui/components/Fa';
import {
  ArrowUpFromLine,
  Box,
  Camera,
  Circle,
  CircleFadingPlus,
  CircleSlash2,
  Cone,
  Copy,
  Cuboid,
  Cylinder,
  Download,
  Drill,
  FileImage,
  FileJson,
  FilePlus2,
  FileUp,
  Layers,
  MonitorDown,
  Move3d,
  PanelRight,
  PanelTop,
  PencilRuler,
  RefreshCw,
  Rotate3d,
  Save,
  ScanEye,
  Scissors,
  Shell,
  Sparkles,
  Spline,
  Square,
  SquareDashed,
  SquareDashedTopSolid,
  SquareRoundCorner,
  SquaresIntersect,
  SquaresSubtract,
  SquaresUnite,
  Upload,
} from 'lucide-react';
import {ActionButtonBehavior} from '../../actions/ActionButtonBehavior';
import connect from 'ui/connect';
import {combine, merger} from 'lstream';
import {useStream} from "ui/effects";
import {NonExistentAppearance, NonExistentState} from "cad/dom/components/PlugableToolbar";

const menuIcon = Icon => <Icon size={14} strokeWidth={2} />;

const menuIcons = {
  BOX: menuIcon(Cuboid),
  BOOLEAN: menuIcon(CircleFadingPlus),
  CONE: menuIcon(Cone),
  CUT: menuIcon(Scissors),
  CYLINDER: menuIcon(Cylinder),
  DATUM_CREATE: menuIcon(Move3d),
  EditFace: menuIcon(PencilRuler),
  EXTRUDE: menuIcon(ArrowUpFromLine),
  EXPORT_BREP: menuIcon(FileUp),
  FILLET_TOOL: menuIcon(SquareRoundCorner),
  HOLE_TOOL: menuIcon(Drill),
  INTERSECT: menuIcon(SquaresIntersect),
  LOFT: menuIcon(Layers),
  NativeFormatExport: menuIcon(FileJson),
  NativeFormatImport: menuIcon(Download),
  NativeFormatImportAs: menuIcon(MonitorDown),
  NewProject: menuIcon(FilePlus2),
  PLANE: menuIcon(SquareDashedTopSolid),
  ReassignSketch: menuIcon(Sparkles),
  REVOLVE: menuIcon(Rotate3d),
  SHELL_TOOL: menuIcon(Shell),
  SPHERE: menuIcon(Circle),
  SUBTRACT: menuIcon(SquaresSubtract),
  Save: menuIcon(Save),
  StandardView3Way: menuIcon(Box),
  StandardViewBack: menuIcon(Square),
  StandardViewBottom: menuIcon(PanelTop),
  StandardViewFront: menuIcon(Square),
  StandardViewLeft: menuIcon(PanelRight),
  StandardViewRight: menuIcon(PanelRight),
  StandardViewTop: menuIcon(PanelTop),
  StlExport: menuIcon(Upload),
  SWEEP: menuIcon(Spline),
  TORUS: menuIcon(CircleSlash2),
  UNION: menuIcon(SquaresUnite),
  ViewMode_SHADED_ON: menuIcon(Box),
  ViewMode_SHADED_WITH_EDGES_ON: menuIcon(Layers),
  ViewMode_WIREFRAME_ON: menuIcon(Cuboid),
  CloneCurrentProject: menuIcon(Copy),
  ImagePngExport: menuIcon(FileImage),
  LookAtFace: menuIcon(ScanEye),
  RefreshSketches: menuIcon(RefreshCw),
  ToggleCameraMode: menuIcon(Camera),
};

function MenuHolder({menus}) {
  return menus.map(({id, actions}) => <ConnectedActionMenu key={id} menuId={id} actions={actions} />); 
}

function ActionMenu({actions, keymap, ...menuState}) {
  if (!Array.isArray(actions)) {
    actions = actions();
  }
  return <Menu {...menuState}>
    {actions.map((action, index) => {
      if (action === '-') {
        return <MenuSeparator key={index} />
      }
      return <ConnectedMenuItem key={action} actionId={action} hotKey={keymap[action]} />;  
    })}
  </Menu>;
}

function ActionMenuItem({label, cssIcons, icon, icon32, icon96, enabled, hotKey, visible, actionId, ...props}) {
  if (!visible) {
    return null;
  }
  let renderedIcon, style;
  if (menuIcons[actionId]) {
    renderedIcon = menuIcons[actionId];
  } else if (icon) {
    const Icon = icon;
    renderedIcon = <Icon />;
  } else {
    if (icon32 || icon96) {
      const size = 16;
      renderedIcon = <Filler width={size} height='1.18em'/>;
      style = {
        backgroundImage: `url(${icon32 || icon96})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${size}px ${size}px`,
        backgroundPositionX: 5,
        backgroundPositionY: 4,
      };
      if (!enabled) {
        style.filter = 'grayscale(90%)';
      }
    } else if (cssIcons) {
      renderedIcon = <Fa fw fa={cssIcons} />;
    }
  }

  return <MenuItem icon={renderedIcon} {...{label, style, disabled: !enabled, hotKey, ...props}} />;
}

const ConnectedActionMenu = connect((streams, props) =>
  combine(
    streams.ui.menu.states[props.menuId],
    streams.ui.keymap)
    .map(([s, keymap]) => ({...s, keymap})))(ActionMenu);

export function ConnectedMenuItem(props) {

  const actionId = props.actionId;

  const actionAppearance = useStream(ctx => (ctx.streams.action.appearance[actionId] || NonExistentAppearance(actionId)));
  const actionState = useStream(ctx => ctx.streams.action.state[actionId] || NonExistentState);

  if (!actionAppearance || !actionState) {
    return null;
  }

  return <ActionButtonBehavior actionId={actionId}>
    {behaviourProps => <ActionMenuItem {...behaviourProps} {...actionAppearance} {...actionState} {...props} />}
  </ActionButtonBehavior>;

}


export default connect(streams => streams.ui.menu.all.map(menus => ({menus})))(MenuHolder);



