import {roundValueForPresentation as r} from 'cad/craft/operationHelper';
import {ApplicationContext} from "cad/context";
import {EntityKind} from "cad/model/entities";
import {OperationDescriptor} from "cad/craft/operationBundle";
import {MShell} from "cad/model/mshell";

interface DeleteBodyParams {
  tools: MShell[];
}

export const DeleteBodyOperation: OperationDescriptor<DeleteBodyParams> = {
  id: 'DELETE_BODY',
  label: 'DeleteBody',
  icon: 'img/cad/deleteBody',
  info: 'Delete Bodies',
  path:__dirname,
  paramsInfo: ({ tools }) => `(${r(tools)})`,
  run: (params: DeleteBodyParams, ctx: ApplicationContext) => {
    const occ = ctx.occService;
    const oci = occ.commandInterface;

    // prevent deletion of origin geometry (datum + base planes)
    // these have originatingOperation = -1 (sentinel: not from history)
    const protectedTools = params.tools.filter(t => t.originatingOperation === -1);
    if (protectedTools.length > 0) {
      throw new Error('Cannot delete origin geometry (datum and base planes)');
    }

    const returnObject = {
      created: [],
      consumed: params.tools
    }
    return returnObject;

  },
  form: [
    {
      type: 'selection',
      name: 'tools',
      capture: [EntityKind.SHELL],
      label: 'Tools',
      optional: false,
      multi: true,
      defaultValue: {
        usePreselection: true,
        preselectionIndex: 0
      },
    },
  ],
}
