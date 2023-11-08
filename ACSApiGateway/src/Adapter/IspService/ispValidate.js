/*
  ------------------------------------------------------------------------------------------------------------------------------------------------------
  --| Ticketno       | Datetime                      | Developer             | Action                       |--
  ------------------------------------------------------------------------------------------------------------------------------------------------------
  --| RSOFTBMS-7403  | 10-oct-2022                     | Tausif khilji        | Insert Adapter for ISP Service |--
--------------------------------------------------------------------------------------------------------------------------------------------------------
*/
import { BMSISP_SERVICE_URI } from "../index";
import { APICalling } from "../../Middleware/ApiCalling";
export default class IspValidate {
  // adapter for get User profile data
  static async ispValidate(args, CONTEXT) {
    console.log("args", args);
    const BODY = await APICalling(
      BMSISP_SERVICE_URI,
      "ispValidate",
      args,
      CONTEXT
    );

    return BODY;
  }
}
