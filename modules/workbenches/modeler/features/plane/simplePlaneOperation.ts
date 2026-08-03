import {createMeshGeometry} from 'scene/geoms';
import {Plane} from 'geom/impl/plane';
import Vector from 'math/vector';
import {MOpenFaceShell} from '../../../../../web/app/cad/model/mopenFace';
import {PlaneSurfacePrototype} from '../../../../../web/app/cad/model/surfacePrototype';
import CSys from "math/csys";
import {EntityKind} from "cad/model/entities";


function paramsToPlaneCSys({ orientation, datum, depth }) {
  const csys = datum ? datum.csys : CSys.ORIGIN;

  let x;
  let y;
  let z;
  if (orientation === 'XY') {
    x = csys.x.copy();
    y = csys.y.copy();
    z = csys.z.copy();
  } else if (orientation === 'XZ') {
    x = csys.x.copy();
    y = csys.z.copy();
    z = csys.y.copy();
  } else {
    x = csys.z.copy();
    y = csys.y.copy();
    z = csys.x.copy();
  }

  const origin = csys.origin.plus(z.multiply(depth));
  return new CSys(origin, x, y, z);
}

function paramsToPlane(params) {
  const csys = paramsToPlaneCSys(params);
  return new Plane(csys.z.asUnitVector(), csys.w());
}


function previewGeomProvider(params) {
  const plane = paramsToPlane(params);
  const tr = plane.get3DTransformation();
  const w = 375, h = 375;
  const a = tr._apply(new Vector(-w, -h, 0));
  const b = tr._apply(new Vector( w, -h, 0));
  const c = tr._apply(new Vector( w,  h, 0));
  const d = tr._apply(new Vector(-w,  h, 0));
  
  const trs = [[a, b, c], [a, c, d]];
  return createMeshGeometry(trs);
}


function fixTexture(planeWidth, planeHeight) {
  return function(texture) {
    const planeAspect = planeWidth / planeHeight;
    const imageAspect = texture.image.width / texture.image.height;
    const aspect = imageAspect / planeAspect;

    texture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
    texture.repeat.x = aspect > 1 ? 1 / aspect : 1;

    texture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
    texture.repeat.y = aspect > 1 ? 1 : aspect;
  }
}

export default {
  id: 'PLANE',
  label: 'Plane',
  icon: 'img/cad/plane',
  info: 'creates new object plane',
  paramsInfo: ({ depth }) => `(${depth})`,
  previewGeomProvider,
  run: (params, { cadRegistry }) => {
    const csys = paramsToPlaneCSys(params);

    return {
      consumed: [],
      created: [new MOpenFaceShell(new PlaneSurfacePrototype(paramsToPlane(params)), csys)]
    }
  },
  form: [
    {
      type: 'choice',
      label: 'orientation',
      name: 'orientation',
      style: 'radio',
      values: ['XY', 'XZ', 'ZY'],
      defaultValue: "XY",
    },
    {
      type: 'selection',
      name: 'datum',
      capture: [EntityKind.DATUM, EntityKind.FACE],
      label: 'datum',
      multi: false,
      optional: true,
      defaultValue: {
        usePreselection: true,
        preselectionIndex: 0
      },
    },
    {
      type: 'number',
      label: 'depth',
      name: 'depth',
      defaultValue: 0,
    },
    // {
    //   type: 'file',
    //   name: 'image',
    //   optional: true,
    //   label: 'Optional Image',
    // },
  ],
};



