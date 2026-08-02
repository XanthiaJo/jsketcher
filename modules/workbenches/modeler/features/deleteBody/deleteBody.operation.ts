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

    // prevent deletion of the origin datum (id starts with 'D:0')
    const originDatum = ctx.cadRegistry.findDatum('D:0');
    if (originDatum && params.tools.includes(originDatum)) {
      throw new Error('Cannot delete the origin datum');
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
