import React from 'react';
import {
  ArrowUpFromLine,
  Box,
  Circle,
  CircleFadingPlus,
  CircleSlash2,
  Cone,
  Cuboid,
  Cylinder,
  Drill,
  Eraser,
  Expand,
  FileSearch,
  FileUp,
  FlipHorizontal,
  Grid3x3,
  Import,
  Layers,
  Move,
  Move3d,
  PanelRight,
  PanelTop,
  PencilRuler,
  RotateCw,
  Rotate3d,
  ScanEye,
  Scissors,
  Shell,
  Spline,
  Square,
  SquareDashedTopSolid,
  SquareRoundCorner,
  SquaresIntersect,
  SquaresSubtract,
  SquaresUnite,
  Trash2,
  Waypoints,
} from 'lucide-react';
import {getSizeInPx} from 'cad/icons/DeclarativeIcon';

export const modelerRibbonIcons: Record<string, React.ComponentType<any>> = {
  StandardViewFront: Square,
  StandardViewTop: PanelTop,
  StandardViewRight: PanelRight,
  StandardView3Way: Box,
  ViewMode_WIREFRAME_ON: Cuboid,
  ViewMode_SHADED_ON: Box,
  ViewMode_SHADED_WITH_EDGES_ON: Layers,
  LookAtFace: ScanEye,
  DATUM_CREATE: Move3d,
  PLANE: SquareDashedTopSolid,
  EditFace: PencilRuler,
  EXTRUDE: ArrowUpFromLine,
  CUT: Scissors,
  REVOLVE: Rotate3d,
  LOFT: Layers,
  SWEEP: Spline,
  BOOLEAN: CircleFadingPlus,
  UNION: SquaresUnite,
  SUBTRACT: SquaresSubtract,
  INTERSECT: SquaresIntersect,
  SHELL_TOOL: Shell,
  FILLET_TOOL: SquareRoundCorner,
  SCALE_BODY: Expand,
  DEFEATURE_REMOVE_FACE: Eraser,
  MIRROR_BODY: FlipHorizontal,
  PATTERN_LINEAR: Grid3x3,
  PATTERN_RADIAL: RotateCw,
  MOVE_BODY: Move,
  CYLINDER: Cylinder,
  BOX: Cuboid,
  CONE: Cone,
  SPHERE: Circle,
  TORUS: CircleSlash2,
  HOLE_TOOL: Drill,
  GET_INFO: FileSearch,
  IMPORT_MODEL: Import,
  DELETE_BODY: Trash2,
  WIRE_LINE: Waypoints,
  EXPORT_BREP: FileUp,
};

export function getModelerRibbonIcon(actionId: string) {
  const Icon = modelerRibbonIcons[actionId];
  return Icon ? <Icon size={16} strokeWidth={1.8} /> : null;
}

export function ribbonIcon(actionId: string) {
  const Icon = modelerRibbonIcons[actionId];
  if (!Icon) {
    return null;
  }
  return {
    icon: ({size}) => React.createElement(Icon, {size: getSizeInPx(size), strokeWidth: 1.8})
  };
}
