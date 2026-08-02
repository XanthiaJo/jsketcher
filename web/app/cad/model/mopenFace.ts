import {MShell} from './mshell';
import {MFace} from './mface';

export class MOpenFaceShell extends MShell {

  private surfacePrototype: any;
  private defaultBounds?: { width: number, height: number };

  constructor(surfacePrototype, csys?, defaultBounds?: { width: number, height: number }) {
    super();
    this.surfacePrototype = surfacePrototype;
    this.csys = csys;
    this.defaultBounds = defaultBounds;
    const bounds = defaultBounds ? [defaultBounds.width, defaultBounds.height] : [100, 100];
    this.faces.push(new MFace(this.id + '/SURFACE', this,
      surfacePrototype.boundTo([], bounds[0], bounds[1]), csys));
    if (!this.csys) {
      this.csys = this.face.csys;
    }
  }

  get face() {
    return this.faces[0];
  }

  get parent() {
    return null;
  }
}
