import { erhandler } from "@reliablesofttech/bmsmessagehandler";
import ACSUpdateData from "../../../Adapter/ACSService/ACSUpdateData";
import {
  getACSConfigurationURL,
  getACSConfigurationData,
} from "./ACSConfigurationData";
import { getSsId } from "./ACSData";

const validate_Auth_Detail = (args) => {
  let CONTEXT = {
    name: "",
    iMessageCode: 0,
  };
  if (!args.sMacAddress) {
    CONTEXT.name = "MAC Address";
    CONTEXT.iMessageCode = 129;
  } else if (!args.sUserName) {
    CONTEXT.name = "User Name";
    CONTEXT.iMessageCode = 129;
  } else if (!args.sPassword) {
    CONTEXT.name = "Password";
    CONTEXT.iMessageCode = 129;
  } else if (args.sUserName.length < 3 || args.sUserName.length > 250) {
    CONTEXT.name = "User Name";
    CONTEXT.minLength = 3;
    CONTEXT.maxLength = 250;
    CONTEXT.iMessageCode = 108;
  } else if (args.sPassword.length > 250) {
    CONTEXT.name = "Password";
    CONTEXT.maxLength = 250;
    CONTEXT.iMessageCode = 144;
  }
  return erhandler(CONTEXT.iMessageCode, CONTEXT);
};
exports.update_Auth_Detail = async (error, args, CONTEXT) => {
  if (error) throw error;
  args = {
    ...args,
    jContext: CONTEXT,
  };
  let Body = { success: false };
  Body = validate_Auth_Detail(args);
  if (Body.messagecode === 0) {
    Body = await getACSConfigurationData(error, args, CONTEXT);

    if (Body && Body.data && Array.isArray(Body.data) && Body.data.length > 0) {
      let AcsUrlDT = await getACSConfigurationURL(error, args, CONTEXT);

      if (AcsUrlDT && AcsUrlDT.URL) {
        let variable = {
          name: "setParameterValues",
          parameterValues: [
            [
              "InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.Username",
              args.sUserName,
              "xsd:string",
            ],
            [
              "InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.Password",
              args.sPassword,
              "xsd:string",
            ],
            [
              "InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.PPPoEServiceName",
              args && args.sServiceName ? args.sServiceName : "",
              "xsd:string",
            ],
          ],
        };
        const { _id: sSerialNumber } = Body.data[0];
        args = {
          variable,
          ...args,
          ...AcsUrlDT,
          sSerialNumber: sSerialNumber,
        };

        const CPEData = await ACSUpdateData.update_ACS(args, CONTEXT);
        return CPEData;
      }
    }
  }

  return Body;
};
