import { kafkaProducer } from "../../Middleware/kafkaProducer";
import { ACSUpdateURL } from "./PrepareUpdateURL";
import ACSCommandQueue from "./ACSCommandQueue";
import { BMSACS_SERVICE_URI } from "../index";
import { APICalling } from "../../Middleware/ApiCalling";
const { erhandler } = require("@reliablesofttech/bmsmessagehandler");
export default class ACSUpdateData {
  static async update_ACS(args, CONTEXT) {
    let { URL, sSerialNumber } = args;

    if (URL && sSerialNumber) {
      URL = ACSUpdateURL(args);

      args = { ...args, URL: URL };
    }

    let Body = await ACSCommandQueue.insertCommandQueue(args, CONTEXT);

    if (Body && Body.success && Body.data) {
      const { iTransId } = Body.data;
      kafkaProducer(
        JSON.stringify({ ...args, iTransId: iTransId }),
        "acsClient",
        "acsTopic",
        CONTEXT,
        "acsConsumer"
      );
      CONTEXT = { ...CONTEXT, iMessageCode: 211, name: "Request Submitted" };
      return erhandler(CONTEXT.iMessageCode, CONTEXT);
    }
  }

  static async updateACSCommandStatus(args, CONTEXT) {
    const BODY = await APICalling(
      BMSACS_SERVICE_URI,
      "updateacscommandstatus",
      args,
      CONTEXT
    );
    return BODY;
  }
}
