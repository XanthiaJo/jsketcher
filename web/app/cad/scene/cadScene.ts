import {createArrow} from 'scene/objects/auxiliary';
import Vector, {AXIS} from 'math/vector';
import {OnTopOfAll} from 'scene/materialMixins';
import {moveObject3D} from 'scene/objects/transform';
import {createFloorGrid} from 'cad/scene/views/planeGridView';

import * as SceneGraph from 'scene/sceneGraph';
import {setCsysToViewMatrix} from 'scene/objects/transform';
import {Object3D} from "three";

export default class CadScene {

  workGroup: Object3D;
  auxGroup: Object3D;
  basisGroup: Object3D;
  defaultGrid: Object3D;
  defaultGridSuppressedBy: Set<string>;

  constructor(rootGroup) {
    this.workGroup = SceneGraph.createGroup();
    this.auxGroup = SceneGraph.createGroup();
    SceneGraph.addToGroup(rootGroup, this.workGroup);
    SceneGraph.addToGroup(rootGroup, this.auxGroup);

    // long XYZ axes removed — datum arrows provide sufficient reference
    // this.setUpAxises();
    this.setUpBasisGroup();
    this.setUpDefaultGrid();
  }

  setUpDefaultGrid() {
    this.defaultGrid = createFloorGrid();
    this.defaultGridSuppressedBy = new Set();
    SceneGraph.addToGroup(this.auxGroup, this.defaultGrid);
  }

  // The floor grid is hidden while suppressed for any reason (plane hover,
  // sketch mode, ...). It becomes visible again once all reasons are cleared.
  setDefaultGridSuppressed(reason, suppressed) {
    if (!this.defaultGrid) {
      return;
    }
    if (suppressed) {
      this.defaultGridSuppressedBy.add(reason);
    } else {
      this.defaultGridSuppressedBy.delete(reason);
    }
    this.defaultGrid.visible = this.defaultGridSuppressedBy.size === 0;
  }

  showDefaultGrid() {
    if (this.defaultGrid) {
      this.defaultGridSuppressedBy.clear();
      this.defaultGrid.visible = true;
    }
  }

  hideDefaultGrid() {
    this.setDefaultGridSuppressed('manual', true);
  }

  setUpAxises() {
    const arrowLength = 1500;
    const createAxisArrow = createArrow.bind(null, arrowLength, 40, 16);
    const addAxis = (axis, color) => {
      const arrow = createAxisArrow(axis, color, 0.2);
      moveObject3D(arrow, axis.scale(-arrowLength * 0.5));
      SceneGraph.addToGroup(this.auxGroup, arrow);
    };

    addAxis(AXIS.X, 0xFF0000);
    addAxis(AXIS.Y, 0x00FF00);
    addAxis(AXIS.Z, 0x0000FF);
  }

  setUpBasisGroup() {
    const length = 200;
    const arrowLength = length * 0.2;
    const arrowHead = arrowLength * 0.4;

    const _createArrow = createArrow.bind(null, length, arrowLength, arrowHead);

    function createBasisArrow(axis, color) {
      return _createArrow(axis, color, 0.4, [OnTopOfAll]);
    }

    this.basisGroup = SceneGraph.createGroup();
    this.basisGroup.matrixAutoUpdate = false;

    const xAxis = createBasisArrow(new Vector(1, 0, 0), 0xFF0000);
    const yAxis = createBasisArrow(new Vector(0, 1, 0), 0x00FF00);
    SceneGraph.addToGroup(this.basisGroup, xAxis);
    SceneGraph.addToGroup(this.basisGroup, yAxis);
    SceneGraph.addToGroup(this.auxGroup, this.basisGroup);
    this.hideGlobalCsys();
  }

  updateGlobalCsys(csys) {
    setCsysToViewMatrix(csys, this.basisGroup.matrix);
    this.basisGroup.matrixWorldNeedsUpdate = true;
  }

  showGlobalCsys(csys) {
    this.updateGlobalCsys(csys);
    this.basisGroup.visible = true;
  }

  hideGlobalCsys() {
    this.basisGroup.visible = false;
  }
}