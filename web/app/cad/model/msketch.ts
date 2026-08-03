import {MObject, MObjectIdGenerator} from './mobject';
import {MFace} from './mface';
import CSys, {CartesianCSys} from 'math/csys';
import {UnitVector} from 'math/vector';
import {EntityKind} from 'cad/model/entities';

export class MSketch extends MObject {

  static TYPE = EntityKind.SKETCH;

  face: MFace;
  sketchStorageId: string;

  constructor(face: MFace) {
    super(MSketch.TYPE, MObjectIdGenerator.next(MSketch.TYPE, 'Sketch'));
    this.face = face;
    this.sketchStorageId = face.id;
  }

  get parent() {
    return null;
  }

  get csys(): CartesianCSys {
    return this.face.csys;
  }

  normal(): UnitVector {
    return this.face.normal();
  }

  traverse(callback: (obj: MObject) => void): void {
    callback(this);
  }
}
