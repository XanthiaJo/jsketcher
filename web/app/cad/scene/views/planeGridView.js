import {GridHelper, Group} from 'three';

const DEFAULT_GRID_SIZE = 1600;
const DEFAULT_GRID_DIVISIONS = 64;
const GRID_OFFSET = 0.5;

export function createPlaneGrid(csys, size = DEFAULT_GRID_SIZE, divisions = DEFAULT_GRID_DIVISIONS) {
  const grid = new GridHelper(size, divisions, 0x5a8ab8, 0xb7c4cf);
  grid.rotation.x = Math.PI / 2;

  const group = new Group();
  group.matrixAutoUpdate = false;
  group.renderOrder = -1;
  group.add(grid);
  applyCsysMatrix(group, csys);

  const materials = Array.isArray(grid.material) ? grid.material : [grid.material];
  materials.forEach(material => {
    material.transparent = true;
    material.opacity = 0.32;
    material.depthWrite = false;
  });

  group.dispose = () => {
    grid.geometry.dispose();
    materials.forEach(material => material.dispose());
  };

  return group;
}

function applyCsysMatrix(group, csys) {
  const offsetOrigin = csys.origin.plus(csys.z.multiply(GRID_OFFSET));
  const {x, y, z} = csys;

  group.matrix.set(
    x.x, y.x, z.x, offsetOrigin.x,
    x.y, y.y, z.y, offsetOrigin.y,
    x.z, y.z, z.z, offsetOrigin.z,
      0,   0,   0,              1
  );
}
