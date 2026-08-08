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
import React from "react";
import {GiCubes} from "react-icons/gi";
import {ribbonIcon} from "cad/workbench/modelerRibbonIcon";

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
      ['StandardViewFront', ribbonIcon('StandardViewFront')],
      ['StandardViewTop', ribbonIcon('StandardViewTop')],
      ['StandardViewRight', ribbonIcon('StandardViewRight')],
      ['StandardView3Way', ribbonIcon('StandardView3Way')],
      '-',
      ['ViewMode_WIREFRAME_ON', ribbonIcon('ViewMode_WIREFRAME_ON')],
      ['ViewMode_SHADED_ON', ribbonIcon('ViewMode_SHADED_ON')],
      ['ViewMode_SHADED_WITH_EDGES_ON', ribbonIcon('ViewMode_SHADED_WITH_EDGES_ON')],
      '-',
      ['LookAtFace', ribbonIcon('LookAtFace')],
      '-',
      ['DATUM_CREATE', ribbonIcon('DATUM_CREATE')],
      ['PLANE', ribbonIcon('PLANE')],
      ['EditFace', ribbonIcon('EditFace')],
      '-',

      ["EXTRUDE", ribbonIcon('EXTRUDE')],
      ["CUT", ribbonIcon('CUT')],
      ["REVOLVE", ribbonIcon('REVOLVE')],
      ["LOFT", ribbonIcon('LOFT')],
      ["SWEEP", ribbonIcon('SWEEP')],
      "-",

      ["BOOLEAN", ribbonIcon('BOOLEAN')],
      ["UNION", ribbonIcon('UNION')],
      ["SUBTRACT", ribbonIcon('SUBTRACT')],
      ["INTERSECT", ribbonIcon('INTERSECT')],
      "-",

      ["SHELL_TOOL", ribbonIcon('SHELL_TOOL')],
      ["FILLET_TOOL", ribbonIcon('FILLET_TOOL')],
      ["SCALE_BODY", ribbonIcon('SCALE_BODY')],
      ["DEFEATURE_REMOVE_FACE", ribbonIcon('DEFEATURE_REMOVE_FACE')],
      "-",

      ["MIRROR_BODY", ribbonIcon('MIRROR_BODY')],
      ["PATTERN_LINEAR", ribbonIcon('PATTERN_LINEAR')],
      ["PATTERN_RADIAL", ribbonIcon('PATTERN_RADIAL')],
      ["MOVE_BODY", ribbonIcon('MOVE_BODY')],
      "-",

      ["CYLINDER", ribbonIcon('CYLINDER')],
      ["BOX", ribbonIcon('BOX')],
      ["CONE", ribbonIcon('CONE')],
      ["SPHERE", ribbonIcon('SPHERE')],
      ["TORUS", ribbonIcon('TORUS')],
      "-",

      ["HOLE_TOOL", ribbonIcon('HOLE_TOOL')],
      "-",
      ['GET_INFO', ribbonIcon('GET_INFO')],
      ["IMPORT_MODEL", ribbonIcon('IMPORT_MODEL')],
      ["DELETE_BODY", ribbonIcon('DELETE_BODY')],
      "-",
      
      ["WIRE_LINE", ribbonIcon('WIRE_LINE')],
      ['EXPORT_BREP', ribbonIcon('EXPORT_BREP')],
    ] as any,
  },
  icon: GiCubes
}
