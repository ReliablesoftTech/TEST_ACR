import { APICalling } from "../../Middleware/ApiCalling";
import { BMSACS_SERVICE_URI } from "../index";
const prepareCommandQueueVariable = (args, CONTEXT) => {
  let sCommandParam = JSON.stringify(args.variable) + "," + args.URL;

  const data = {
    iMaxTransSno: 1,
    iConnectionId: args.iConnectionId ? args.iConnectionId : 0,
    iPriority: 0,
    sCommandParam: sCommandParam,
    iCommandId: 1,
    iEmployeeId: CONTEXT.iEmployeeId,
    sMacAddress: args.sMacAddress,
    iIspId: CONTEXT.iIspId,}
  };

  return data;
};
export default class ACSCommandQueue {
  static async insertCommandQueue(args, CONTEXT) {
    const data = prepareCommandQueueVariable(args, CONTEXT);

    const BODY = await APICalling(
      BMSACS_SERVICE_URI,
      "insertmacscommandqueue",
      { ...args, variable: data },
      CONTEXT
    );

    return BODY;
  }
}
