import React from 'react';
import {
  Box,
  Camera,
  CircleFadingPlus,
  Cuboid,
  File,
  Rocket,
  Shapes,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

const footerIcon = Icon => () => <Icon size={13} strokeWidth={2} />;

export default [
  {
    id: 'file',
    icon: footerIcon(File),
    actions: ['NewProject', '-', 'Save', 'StlExport', 'ImagePngExport', 'NativeFormatExport', '-', 'NativeFormatImport', 
              'NativeFormatImportAs', '-', 'CloneCurrentProject', '-', 'ReassignSketch']
  },
  {
    id: 'craft',
    icon: footerIcon(WandSparkles),
    info: 'set of available craft operations on a solid',
    actions: ['EXTRUDE', 'CUT', 'REVOLVE', 'LOFT', 'SHELL_TOOL', 'FILLET_TOOL', 'DATUM_CREATE']
  },
  {
    id: 'primitives',
    label: 'add',
    icon: footerIcon(Shapes),
    info: 'set of available solid creation operations',
    actions: ['PLANE', 'CYLINDER', 'BOX', 'CONE', 'SPHERE', 'TORUS']
  },
  {
    id: 'views',
    label: 'views',
    icon: footerIcon(Camera),
    info: 'switching camera views',
    actions: ['StandardViewFront', 'StandardViewBack', 'StandardViewLeft', 'StandardViewRight', 
      'StandardViewTop', 'StandardViewBottom', 'StandardView3Way']
  },
  {
    id: 'viewModes',
    label: 'mode',
    icon: footerIcon(Cuboid),
    info: 'view/render mode',
    actions: ['ViewMode_WIREFRAME_ON', 'ViewMode_SHADED_ON', 'ViewMode_SHADED_WITH_EDGES_ON']
  },
  {
    id: 'boolean',
    label: 'bool',
    icon: footerIcon(CircleFadingPlus),
    info: 'set of available boolean operations',
    actions: ['INTERSECT', 'SUBTRACT', 'UNION']
  },
  {
    id: 'main',
    label: 'start',
    icon: footerIcon(Rocket),
    info: 'common set of actions',
    actions: ['EXTRUDE', 'CUT', 'REVOLVE', 'LOFT', 'FILLET_TOOL', '-',
      'PLANE', 'BOX', 'SPHERE', 'CONE', 'CYLINDER', 'TORUS', '-',
      'EditFace']
  },
  {
    id: 'datum',
    label: 'datum',
    icon: footerIcon(Sparkles),
    info: 'operations on datum',
    actions: ['PLANE', '-', 'BOX', 'SPHERE', 'CYLINDER', 'TORUS', 'CONE']
    // actions: ['DATUM_MOVE', 'DATUM_ROTATE', 'DATUM_REBASE', '-', 'PLANE_FROM_DATUM', 'BOX', 'SPHERE', 'TORUS', 
    //   'CONE', 'CYLINDER']
  },
  {
    id: 'contextual',
    label: 'contextual',
    icon: footerIcon(Box),
    info: 'contextual actions',
    actions: ['ModelDisplayOptions', 'ModelAttributesEditor']
  }
];
