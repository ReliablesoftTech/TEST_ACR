const got = require("got");
import { BMSACS_SERVICE_URI } from "../index";
import { APICalling } from "../../Middleware/ApiCalling";
const { erhandler } = require("@reliablesofttech/bmsmessagehandler");
import axios from "axios";
export default class ACSData {
  static async getACSData(args, CONTEXT) {
    let { URL: sUrl, sMacAddress } = args;


    // console.log("URL", URL);

    let URL = "";

    URL = sUrl + "?query=";

    URL =
      URL +
      `%7B"InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.MACAddress"%3A"${sMacAddress}"%7D`;

    // NOTE REFRESH PARAMETER WORK
    axios({
      method: "get",
      url: `${URL}&projection=DeviceID.ID`,
    })
      .then((response) => {
        const sDeviceId = response?.data[0]?._id;
        // console.log("refreshObject", refreshObject);
        // console.log("sDeviceId", sDeviceId);
        if (sDeviceId) {
          const sRefreshUrl = `${sUrl}${sDeviceId}/tasks?connection_request`;

          axios({
            method: "POST",
            url: sRefreshUrl,
            data: {
              name: "refreshObject",
              objectName: "",
            },
          });
        }
      })
      .catch((error) => console.log("Error: ", error));

    //

    let Body = { message: false, messagecode: 0, success: false, data: [] };
    // const response = await fetch(URL);
    let res = [];
    await axios({
      method: "get",
      url: URL,
    })
      .then((responce) => (res = responce.data))
      .catch((error) => console.log("Error: ", error));

    if (res) {
      const jsonResponse = res;
      if (
        jsonResponse &&
        Array.isArray(jsonResponse) &&
        jsonResponse.length > 0
      ) {
        CONTEXT = {
          messagecode: 100,
          data: jsonResponse,
        };
      } else {
        CONTEXT = {
          messagecode: 197,
          data: [],
        };
      }
    } else {
      CONTEXT = {
        messagecode: 197,
        data: [],
      };
    }
    CONTEXT = erhandler(CONTEXT.messagecode, CONTEXT);
    return CONTEXT;
  }

  static async getACSConfigData(args, CONTEXT) {
    const BODY = await APICalling(
      BMSACS_SERVICE_URI,
      "getacsconfig",
      args,
      CONTEXT
    );

    return BODY;
  }
}
