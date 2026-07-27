import {WorkbenchConfig} from "cad/workbench/workbenchService";

//imports of feature history type commands
import {PrimitiveBoxOperation} from './features/primitiveBox/primitiveBox.operation';
import {ExtrudeOperation} from './features/extrude/extrude.operation';
import {LoftOperation} from './features/loft/loft.operation'
import {PrimitiveConeOperation} from "./features/primitiveCone/PrimitiveCone.operation";
import {PrimitiveCylinderOperation} from "./features/primitiveCylinder/PrimitiveCylinder.operation";
import {PrimitiveSphereOperation} from "./features/primitiveSphere/PrimitiveSphere.operation";
import {PrimitiveTorusOperation} from "./features/primitiveTorus/PrimitiveTorus.operation";
import {HoleOperation} from "./features/hole/Hole.operation";
import {FilletOperation} from "./features/fillet/fillet.operation";
import {BooleanOperation} from "./features/boolean/boolean.operation";
import {RevolveOperation} from "./features/revolve/revolve.operation";
import {ShellOperation} from "./features/shell/shell.operation";
import {SweepOperation} from "./features/sweep/sweep.operation";
import {ScaleOperation} from "./features/scaleBody/scaleBody.operation";
import {MirrorBodyOperation} from "./features/mirrorBody/mirrorBody.operation";
import {PatternLinearOperation} from "./features/patternLinear/patternLinear.operation";
import {PatternRadialOperation} from "./features/patternRadial/patternRadial.operation";
import {ImportModelOperation} from "./features/importModel/importModel.operation";
import {DeleteBodyOperation} from "./features/deleteBody/deleteBody.operation";
import {DefeatureRemoveFaceOperation} from "./features/defeatureRemoveFace/defeatureRemoveFace.operation";
import { WireLineOperation } from "./features/wireLine/wireLine";
import { MoveBodyOperation } from "./features/moveBody/moveBody.operation"
//imports of action type commands
import {GetInfo} from "./actions/getInfo/getInfo.action";
import {ExportBREP} from "./actions/exportBREP/exportBREP.action";
//import workbench icon
import {GiCubes} from "react-icons/gi";
import React from "react";
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
  Shell,
  Spline,
  Square,
  SquareDashed,
  SquareDashedTopSolid,
  SquareRoundCorner,
  SquaresIntersect,
  SquaresSubtract,
  SquaresUnite,
  Trash2,
  Waypoints
} from "lucide-react";
import {getSizeInPx} from "cad/icons/DeclarativeIcon";

const ribbonIcon = (Icon) => ({
  icon: ({size}) => React.createElement(Icon, {size: getSizeInPx(size), strokeWidth: 1.8})
});

export const ModelerWorkspace: WorkbenchConfig = {

  workbenchId: 'modeler',
  features: [
    ExtrudeOperation,
    PrimitiveBoxOperation,
    PrimitiveConeOperation,
    PrimitiveCylinderOperation,
    PrimitiveSphereOperation,
    PrimitiveTorusOperation,
    HoleOperation,
    FilletOperation,
    RevolveOperation,
    BooleanOperation,
    ShellOperation,
    LoftOperation,
    SweepOperation,
    ScaleOperation,
    MirrorBodyOperation,
    PatternLinearOperation,
    PatternRadialOperation,
    ImportModelOperation,
    DeleteBodyOperation,
    DefeatureRemoveFaceOperation,
    WireLineOperation,
    MoveBodyOperation,

    GetInfo,
    ExportBREP,
  ],
  actions: [
     //GetVolume,
  ],
  ui: {
    toolbar: [
      ['StandardViewFront', ribbonIcon(Square)],
      ['StandardViewTop', ribbonIcon(PanelTop)],
      ['StandardViewRight', ribbonIcon(PanelRight)],
      ['StandardView3Way', ribbonIcon(Box)],
      '-',
      ['ViewMode_WIREFRAME_ON', ribbonIcon(Cuboid)],
      ['ViewMode_SHADED_ON', ribbonIcon(Box)],
      ['ViewMode_SHADED_WITH_EDGES_ON', ribbonIcon(Layers)],
      '-',
      ['LookAtFace', ribbonIcon(ScanEye)],
      '-',
      ['DATUM_CREATE', ribbonIcon(Move3d)],
      ['PLANE', ribbonIcon(SquareDashedTopSolid)],
      ['EditFace', ribbonIcon(PencilRuler)],
      '-',

      ["EXTRUDE", ribbonIcon(ArrowUpFromLine)],
      ["CUT", ribbonIcon(SquareDashed)],
      ["REVOLVE", ribbonIcon(Rotate3d)],
      ["LOFT", ribbonIcon(Layers)],
      ["SWEEP", ribbonIcon(Spline)],
      "-",

      ["BOOLEAN", ribbonIcon(CircleFadingPlus)],
      ["UNION", ribbonIcon(SquaresUnite)],
      ["SUBTRACT", ribbonIcon(SquaresSubtract)],
      ["INTERSECT", ribbonIcon(SquaresIntersect)],
      "-",

      ["SHELL_TOOL", ribbonIcon(Shell)],
      ["FILLET_TOOL", ribbonIcon(SquareRoundCorner)],
      ["SCALE_BODY", ribbonIcon(Expand)],
      ["DEFEATURE_REMOVE_FACE", ribbonIcon(Eraser)],
      "-",

      ["MIRROR_BODY", ribbonIcon(FlipHorizontal)],
      ["PATTERN_LINEAR", ribbonIcon(Grid3x3)],
      ["PATTERN_RADIAL", ribbonIcon(RotateCw)],
      ["MOVE_BODY", ribbonIcon(Move)],
      "-",

      ["CYLINDER", ribbonIcon(Cylinder)],
      ["BOX", ribbonIcon(Cuboid)],
      ["CONE", ribbonIcon(Cone)],
      ["SPHERE", ribbonIcon(Circle)],
      ["TORUS", ribbonIcon(CircleSlash2)],
      "-",

      ["HOLE_TOOL", ribbonIcon(Drill)],
      "-",
      ['GET_INFO', ribbonIcon(FileSearch)],
      ["IMPORT_MODEL", ribbonIcon(Import)],
      ["DELETE_BODY", ribbonIcon(Trash2)],
      "-",
      
      ["WIRE_LINE", ribbonIcon(Waypoints)],
      ['EXPORT_BREP', ribbonIcon(FileUp)],
    ]
  },
  icon: GiCubes
}
