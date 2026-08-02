import {setSketchPrecision} from './sketch/sketchReader';
import {runSandbox} from './sandbox';
import {LOG_FLAGS} from './logFlags';
import {ApplicationContext} from "cad/context";
import {ProjectModel} from "./projectManager/projectManagerBundle";
import {ModelBundle} from "cad/projectManager/projectManagerBundle";
import {DebugMode$} from "debugger/Debugger";
import {fillUpMissingFields} from "cad/craft/schema/initializeBySchema";
import {OperationRequest} from "./craft/craftBundle";
import {MDatum} from "cad/model/mdatum";
import {MOpenFaceShell} from "cad/model/mopenFace";
import {PlaneSurfacePrototype} from "cad/model/surfacePrototype";
import {Plane} from "geom/impl/plane";
import CSys from "math/csys";
import { resolveProjectNameConflict } from "cad/projectNamePolicy";
import exportTextData from "gems/exportTextData";
import { ensureImplicitOriginGeometry, resetCraftHistoryWithOriginGeometry } from "cad/projectLoadOriginPolicy";

export const STORAGE_GLOBAL_PREFIX = 'TCAD';
export const PROJECTS_PREFIX = `${STORAGE_GLOBAL_PREFIX}.projects.`;
export const SKETCH_SUFFIX = '.sketch.';

// Seed history for new/empty projects: empty. The origin datum and three base
// planes are created directly as MObjects and are not in history.
export const DEFAULT_PROJECT_HISTORY: OperationRequest[] = [];

// Create the origin datum and three base planes (XY, XZ, ZY) at the world origin.
// The datum has id 'D:0' and originatingOperation = -1 (not from history).
// The planes have { width: 100, height: 100 } bounds and originatingOperation = -1.
function createOriginGeometry() {
  const datum = new MDatum(CSys.origin());
  datum.id = 'D:0';
  datum.originatingOperation = -1;

  const planes = [];
  const orientations = [
    { name: 'XY', axis: 'z' },
    { name: 'XZ', axis: 'y' },
    { name: 'ZY', axis: 'x' },
  ];

  for (const { name, axis } of orientations) {
    const axisVector = CSys.ORIGIN[axis];
    const plane = new Plane(axisVector, axisVector.multiply(0)._plus(CSys.ORIGIN.origin).dot(axisVector));
    const shell = new MOpenFaceShell(new PlaneSurfacePrototype(plane), undefined, { width: 100, height: 100 });
    shell.originatingOperation = -1;
    planes.push(shell);
  }

  return [datum, ...planes];
}


export function activate(ctx: ApplicationContext) {

  const [id, hints] = parseHintsFromLocation();

  initProjectService(ctx, id, hints);
}

export function initProjectService(ctx: ApplicationContext, id: string, hints: any) {

  processParams(hints, ctx);
  ensureOriginGeometry();

  const sketchNamespace = id + SKETCH_SUFFIX;
  const sketchStorageNamespace = PROJECTS_PREFIX + sketchNamespace;

  function sketchStorageKey(sketchIdId) {
    return sketchStorageNamespace + sketchIdId;
  }

  function projectStorageKey() {
    return PROJECTS_PREFIX + id;
  }

  function getSketchURL(sketchId) {
    return sketchNamespace + sketchId;
  }

  function save() {
    const model = getCurrentProjectModel();
    const bundle = buildModelBundle(model);

    if (ctx.remoteProjectService) {
      ctx.remoteProjectService.list().then(projects => {
        if (!projects) {
          handleUnauthenticatedSave(model, bundle);
          return { skipped: true };
        }
        saveLocalProjectModel(model);
        return getProjectName(projects);
      })
        .then(name => {
        if (name === null || (typeof name === 'object' && name.skipped)) {
          return null;
        }
        return ctx.remoteProjectService.save(id, name, bundle);
      })
        .then(result => {
          if (result === null) {
            handleUnauthenticatedSave(model, bundle);
          }
        })
        .catch(error => {
          console.error(error);
          if (confirm('Database save failed. Save to this browser only instead? Browser storage can be cleared, blocked, or lost when changing browser/device.')) {
            saveLocalProjectModel(model);
          }
        });
      return;
    }

    handleUnauthenticatedSave(model, bundle);
  }

  function load() {
    if (ctx.remoteProjectService) {
      ctx.remoteProjectService.load(id)
        .then(remoteProject => {
          if (remoteProject) {
            hydrateBundleToStorage(remoteProject.data);
            loadProjectModel(remoteProject.data.model);
          } else {
            loadLocalProject();
          }
        })
        .catch(error => {
          console.error(error);
          loadLocalProject();
        });
    } else {
      loadLocalProject();
    }
  }

  function getCurrentProjectModel(): ProjectModel {
    const data: ProjectModel = {
      history: ctx.craftService.modifications$.value.history,
      expressions: ctx.expressionService.script$.value,

      // @ts-ignore we deliberately don't uplift the type to the ApplicationContext in order to be able to use ProjectService in the headless mode
      assembly: ctx.assemblyService && ctx.assemblyService.getConstraints()
    };

    const currentWorkbench = ctx.workbenchService.currentWorkbench$.value;

    if (!currentWorkbench?.internal && ctx.workbenchService.defaultWorkbenchId !== currentWorkbench.workbenchId) {
      data.workbench = currentWorkbench.workbenchId;
    }

    return data;
  }

  function saveLocalProjectModel(model: ProjectModel) {
    ctx.storageService.set(projectStorageKey(), JSON.stringify(model));
  }

  function handleUnauthenticatedSave(model: ProjectModel, bundle: ModelBundle) {
    const choice = prompt(
      'You are not signed in, so this cannot be saved to the database.\n\n' +
      'Browser storage is local to this browser and can be lost if browser data is cleared, private/incognito mode is used, storage is blocked, or you switch device/browser.\n\n' +
      'Type one option:\n' +
      'account - make/sign in to an account\n' +
      'pc - download the native file to this computer\n' +
      'local - save only in this browser\n' +
      'cancel - do not save',
      'account'
    );

    switch (String(choice || 'cancel').trim().toLowerCase()) {
      case 'account':
        if (ctx.remoteProjectService) {
          window.open(ctx.remoteProjectService.signInUrl(), '_blank');
        }
        break;
      case 'pc':
        downloadNativeBundle(bundle);
        break;
      case 'local':
        saveLocalProjectModel(model);
        alert('Project saved only in this browser. For safer storage, sign in or download the native file to your computer.');
        break;
      default:
        break;
    }
  }

  function downloadNativeBundle(bundle: ModelBundle) {
    exportTextData(JSON.stringify(bundle, null, 2), safeFileName(decodeURIComponent(hints.name || id)) + '.json');
  }

  async function getProjectName(projects) {
    if (typeof hints.name === 'string') {
      return checkDuplicateProjectName(decodeURIComponent(hints.name), projects);
    }
    const prompted = prompt('Project name', 'Untitled Project') || 'Untitled Project';
    const name = await checkDuplicateProjectName(prompted, projects);
    hints.name = encodeURIComponent(name);
    const separator = window.location.search ? '&' : '?';
    window.history.replaceState(null, '', window.location.pathname + window.location.search + separator + 'name=' + hints.name);
    return name;
  }

  async function checkDuplicateProjectName(name, projects) {
    return resolveProjectNameConflict(projects, id, name, duplicate => {
      const shouldRename = confirm(
        `You already have a project named "${duplicate.name}". Save with a different name?`
      );
      if (!shouldRename) {
        return name;
      }
      return prompt('Project name', name) || name;
    });
  }

  function buildModelBundle(model: ProjectModel): ModelBundle {
    const sketchKeys = ctx.storageService.getAllKeysFromNamespace(sketchStorageNamespace);
    return {
      model,
      sketches: sketchKeys.map(key => ({
        id: key.substring(sketchStorageNamespace.length),
        data: JSON.parse(ctx.storageService.get(key))
      }))
    };
  }

  function hydrateBundleToStorage(bundle: ModelBundle) {
    ctx.storageService.set(projectStorageKey(), JSON.stringify(bundle.model));
    bundle.sketches.forEach(sketch => {
      ctx.storageService.set(sketchStorageNamespace + sketch.id, JSON.stringify(sketch.data));
    });
  }

  function loadLocalProject() {
    try {
      const dataStr = ctx.storageService.get(ctx.projectService.projectStorageKey());
      if (dataStr) {
        loadProjectModel(JSON.parse(dataStr));
      } else {
        loadProjectModel({ history: DEFAULT_PROJECT_HISTORY, expressions: '' });
      }
    } catch (e) {
      console.error(e);
      loadProjectModel({ history: DEFAULT_PROJECT_HISTORY, expressions: '' });
    }
  }

  function loadProjectModel(data: ProjectModel) {
    upgradeIfNeeded(data);
    loadData(data);
    loadWorkbench(data);
    ensureOriginGeometryAfterPipeline();
  }

  function ensureOriginGeometry() {
    ctx.craftService.models$.next(ensureImplicitOriginGeometry(ctx.craftService.models$.value, createOriginGeometry));
  }

  function ensureOriginGeometryAfterPipeline() {
    const detacher = ctx.craftService.update$.attach(() => {
      ensureOriginGeometry();
      detacher();
    });
  }

  function upgradeIfNeeded(data: ProjectModel) {
    if (data.history) {
      data.history.forEach(req => {
        const operation = ctx.operationService.get(req.type);
        if (operation) {
          fillUpMissingFields(req.params, operation.schema, ctx);
        }
      });
    }
  }

  function loadWorkbench(data: ProjectModel) {
    if (data.workbench) {
      ctx.workbenchService.switchWorkbench(data.workbench, true);
    }
  }

  function loadData(data: ProjectModel) {
    if (data.expressions) {
      ctx.expressionService.load(data.expressions);
    }
    if (data.history) {
      resetCraftHistoryWithOriginGeometry(ctx.craftService, data.history, createOriginGeometry);
    }

    // @ts-ignore we deliberately don't uplift the type to the ApplicationContext in order to be able to use ProjectService in the headless mode
    if (data.assembly && ctx.assemblyService) {
      // @ts-ignore
      ctx.assemblyService.loadConstraints(data.assembly);
    }

  }

  function empty() {
    loadData({
      history: [],
      expressions: ""
    });
  }

  ctx.projectService = {
    id, sketchStorageKey, projectStorageKey, sketchStorageNamespace, getSketchURL, save, load, loadData, empty,
    hints
  };

}

function safeFileName(name) {
  return String(name || 'jsketcher-project')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\.+$/, '') || 'jsketcher-project';
}

function parseHintsFromLocation() {
  let hints = window.location.hash.substring(1);
  if (!hints) {
    hints = window.location.search.substring(1);
  }
  if (!hints) {
    hints = createProjectUuid();
    window.history.replaceState(null, '', '?' + hints);
  }
  return parseHints(hints);
}

function createProjectUuid() {
  if (window.crypto && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function parseHints(hints) {
  const [id, ...paramsArr] = hints.split('&');
  const params = paramsArr.reduce((params, part) => {
    let [key, value] = part.split('=');
    if (key) {
      if (!value) {
        value = true;
      }
      params[key] = value;
    }
    return params;
  }, {});
  return [id, params];
}

function processParams(params, context) {
  if (params.sketchPrecision) {
    setSketchPrecision(parseInt(params.sketchPrecision));
  }  
  if (params.sandbox) {
    setTimeout(() => runSandbox(context));
  }
  
  const LOG_FLAGS_PREFIX = "LOG.";
  Object.keys(params).forEach(key => {
    if (key.startsWith(LOG_FLAGS_PREFIX)) {
      LOG_FLAGS[key.substring(LOG_FLAGS_PREFIX.length)] = true
    }
  });

  if (params.debug) {
    DebugMode$.next(true);
  }
}

export interface ProjectService {

  readonly id: string;

  readonly sketchStorageNamespace: string;

  hints: any;

  sketchStorageKey(sketchId: string): string;

  projectStorageKey(): string

  getSketchURL(sketchId: string): string

  save(): void;

  load(): void

  loadData(data: ProjectModel);

  empty(): void;

}

export interface ProjectBundleContext {

  projectService: ProjectService;

}

export const BundleName = "@Project";

