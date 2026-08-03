import * as ActionHelpers from './actionHelpers'
import React from 'react';
import {
  Camera,
  Copy,
  Disc,
  Download,
  FileImage,
  FileJson,
  FilePlus2,
  Image,
  Info,
  MonitorDown,
  Orbit,
  PencilRuler,
  RefreshCw,
  Save,
  Share2,
  Square,
  SunMoon,
  Upload,
} from 'lucide-react';
import {OrbitMode} from '../scene/viewer';

const footerIcon = Icon => () => <Icon size={13} strokeWidth={2} />;

export const orbitModeIcon = mode => footerIcon(mode === OrbitMode.TURNTABLE ? Disc : Orbit);

export default [
  {
    id: 'EditFace',
    appearance: {
      icon: footerIcon(PencilRuler),
      label: 'sketch',
      icon96: 'img/cad/face-edit96.png',
      info: 'open sketcher for a face/plane',
    },
    listens: ctx => ctx.streams.selection.face,
    update: ActionHelpers.checkForSelectedFaces(1),
    invoke: ({services}) => services.sketcher.sketchFace(services.selection.face.single)
  },

  {
    id: 'ReassignSketch',
    appearance: {
      icon: footerIcon(Share2),
      label: 'reassign sketch',
      icon96: 'img/cad/face-edit96.png',
      info: 'open sketcher for a face/plane',
    },
    listens: ctx => ctx.streams.selection.face,
    update: ActionHelpers.checkForSelectedFaces(1),
    invoke: ctx => ctx.services.sketcher.reassignSketchMode.enter(ctx.services.selection.face.single.id)
  },

  {
    id: 'Save',
    appearance: {
      icon: footerIcon(Save),
      label: 'save',
      info: 'save project to storage',
    },
    invoke: (context) => context.projectService.save()
  },

  {
    id: 'StlExport',
    appearance: {
      icon: footerIcon(Upload),
      label: 'STL Export',
      info: 'export model to STL file',
    },
    invoke: (context) => context.services.export.stlAscii()
  },
  
  {
    id: 'ImagePngExport',
    appearance: {
      icon: footerIcon(Image),
      label: 'PNG Export',
      info: 'export model as png image/render a snapshot',
    },
    invoke: (context) => context.services.export.imagePng()
  },

  {
    id: 'NativeFormatExport',
    appearance: {
      icon: footerIcon(FileJson),
      label: 'Download Project',
      info: 'export model and its sketches as a json bundle',
    },
    invoke: (context) => context.services.export.nativeFormat()
  },

  {
    id: 'NativeFormatImport',
    appearance: {
      icon: footerIcon(Download),
      label: 'Import Project',
      info: 'empty current project and import replacing with native format json(model and its sketches)',
    },
    invoke: (context) => context.services.projectManager.importProject()
  },
  
  {
    id: 'NativeFormatImportAs',
    appearance: {
      icon: footerIcon(MonitorDown),
      label: 'Import Project as...',
      info: 'import native format json(model and its sketches) as a new project',
    },
    invoke: (context) => context.services.projectManager.importProjectAs()
  },

  {
    id: 'NewProject',
    appearance: {
      icon: footerIcon(FilePlus2),
      label: 'New Project...',
      info: 'create new project and open in a new tab',
    },
    invoke: (context) => context.services.projectManager.newProject()
  },
  
  {
    id: 'CloneCurrentProject',
    appearance: {
      icon: footerIcon(Copy),
      label: 'Clone Project...',
      info: 'clone current project and open in a new tab',
    },
    invoke: (context) => context.services.projectManager.cloneProject(context.projectService.id)
  },

  {
    id: 'RefreshSketches',
    appearance: {
      icon: footerIcon(RefreshCw),
      label: 'Refresh Sketches',
      info: 'refresh all visible sketches',
    },
    invoke: (context) => context.services.sketcher.updateAllSketches()
  },

  {
    id: 'DeselectAll',
    appearance: {
      icon: footerIcon(Square),
      label: 'deselect all',
      info: 'deselect everything',
    },
    invoke: (context) => context.services.pickControl.deselectAll()
  },

  {
    id: 'ToggleCameraMode',
    appearance: {
      icon: footerIcon(Camera),
      label: 'toggle camera',
      info: 'switch camera mode between perspective and orthographic',
    },
    invoke: context => {
      const viewer = context.services.viewer;
      viewer.toggleCamera();
      viewer.render();
    }
  },

  {
    id: 'ToggleOrbitMode',
    appearance: {
      icon: orbitModeIcon(OrbitMode.TRACKBALL),
      label: 'toggle orbit',
      info: 'switch orbit style between trackball and turntable (Fusion 360)',
    },
    invoke: context => {
      const viewer = context.services.viewer;
      viewer.toggleOrbitMode();
      viewer.render();
    }
  },

  {
    id: 'ToggleTheme',
    appearance: {
      icon: footerIcon(SunMoon),
      label: 'theme',
      info: 'toggle between dark and light theme',
    },
    invoke: ({services}) => {
      document.body.classList.toggle('theme-light');
      try {
        localStorage.setItem('jsketcher.theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
      } catch(e) {
        // Theme still changes for the session if storage is unavailable.
      }

      if (services.viewer) {
        services.viewer.updateClearColor();
      }
    }
  },

  {
    id: 'Info',
    appearance: {
      icon: footerIcon(Info),
      label: 'info',
      info: 'opens help dialog',
    },
    invoke: (context) => context.services.help.showInfo()
  },

  {
    id: 'ShowSketches',
    appearance: {
      icon: footerIcon(FileImage),
      label: 'show sketches',
      info: 'toggle whether to show sketches on a solid face'
    },
    invoke: context => {
      const shells = context.services.cadRegistry.shells || [];
      const sketchViews = [];
      shells.forEach(shell => shell.faces.forEach(face => {
        const sketchGroup = face.ext?.view?.sketchGroup;
        if (sketchGroup) {
          sketchViews.push(sketchGroup);
        }
      }));

      const shouldShow = sketchViews.some(sketchGroup => !sketchGroup.visible);
      sketchViews.forEach(sketchGroup => {
        sketchGroup.visible = shouldShow;
      });
      context.services.viewer.requestRender();
    }
  },
  {
    id: 'noIcon',
    appearance: {
      label: 'no icon'
    }
  },

  {
    id: 'ExportFaceToDXF',
    appearance: {
      icon: footerIcon(Upload),
      label: 'export face DXF',
      info: 'export a selected face to a DXF file',
    },
    listens: ctx => ctx.streams.selection.face,
    update: ActionHelpers.checkForSelectedFaces(1),
    invoke: ({services}) => services.sketcher.exportFaceToDXF(services.selection.face.single)
  },
]

