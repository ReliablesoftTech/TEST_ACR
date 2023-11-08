const {
  default: ACSUpdateData,
} = require("../../../Adapter/ACSService/ACSUpdateData");
import { erhandler } from "@reliablesofttech/bmsmessagehandler";
import ACSData from "../../../Adapter/ACSService/ACSData";
import {
  getACSConfigurationURL,
  getACSConfigurationData,
} from "./ACSConfigurationData";
const validateMacAddress = (args) => {
  let CONTEXT = {
    name: "",
    iMessageCode: 0,
  };
  if (!args.sMacAddress) {
    CONTEXT.name = "MAC Address";
    CONTEXT.iMessageCode = 129;
  }
  return erhandler(CONTEXT.iMessageCode, CONTEXT);
};
exports.reboot_ACS = async (error, args, CONTEXT) => {
  console.log("argsssssssss", args);
  if (error) throw error;
  args = {
    ...args,
    jContext: CONTEXT,
  };
  let Body = { success: false };
  Body = validateMacAddress(args);
  console.log("Body", Body);
  if (Body.messagecode === 0) {
    console.log("aaya");
    let AcsUrlDT = await getACSConfigurationURL(error, args, CONTEXT);
    console.log("AcsUrlDT", AcsUrlDT);
    if (AcsUrlDT && AcsUrlDT.URL) {
      Body = await getACSConfigurationData(error, args, CONTEXT);
      console.log("Body", Body);
      if (
        Body.success &&
        Body.data &&
        Array.isArray(Body.data) &&
        Body.data.length > 0
      ) {
        console.log("Body", Body);
        let variable = {
          name: "reboot",
        };
        const { _id: sSerialNumber } = Body.data[0];
        console.log("sSerialNumber", sSerialNumber);
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
