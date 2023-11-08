const {
  default: ACSUpdateData,
} = require("../../../Adapter/ACSService/ACSUpdateData");
import { erhandler } from "@reliablesofttech/bmsmessagehandler";
import {
  getACSConfigurationURL,
  getACSConfigurationData,
} from "./ACSConfigurationData";
import { getSsId } from "./ACSData";

const validate_SSId_Parameter = (args) => {
  let CONTEXT = {
    name: "",
    iMessageCode: 0,
  };
  if (!args.sMacAddress) {
    CONTEXT.name = "MAC Address";
    CONTEXT.iMessageCode = 129;
  } else if (!args.sSSIdName) {
    CONTEXT.name = "SSID Name";
    CONTEXT.iMessageCode = 129;
  } else if (!args.sSSIdKey) {
    CONTEXT.name = "SSID Key";
    CONTEXT.iMessageCode = 129;
  }
  return erhandler(CONTEXT.iMessageCode, CONTEXT);
};

exports.update_ACS_SSID_Status = async (error, args, CONTEXT) => {
  if (error) throw error;
  args = {
    ...args,
    jContext: CONTEXT,
  };
  let Body = { success: false };
  let CPEData = {};
  Body = validate_SSId_Parameter(args);
  if (Body.messagecode === 0) {
    let getSsIdRes = await getSsId(error, args, CONTEXT);
    let existSSIdName = false,
      sExistingPositionSSId = 0;
    if (
      getSsIdRes &&
      Array.isArray(getSsIdRes.data) &&
      getSsIdRes.data.length > 0
    ) {
      for (const itm of getSsIdRes.data) {
        if (
          itm.sSSIdName === args.sSSIdName &&
          itm.sSSIdKey === "" + args.sSSIdKey
        ) {
          sExistingPositionSSId = itm.sSSIdKey;
          existSSIdName = true;
          CPEData = await getACSConfigurationData(error, args, CONTEXT);
        }
      }
      if (!existSSIdName) {
        Body.name = "SSID Name";
        Body.messagecode = 196;
      }
    } else {
      Body = {
        messagecode:
          getSsIdRes && getSsIdRes.messagecode ? getSsIdRes.messagecode : 0,
      };
    }

    if (Body.messagecode === 0) {
      let AcsUrlDT = await getACSConfigurationURL(error, args, CONTEXT);

      if (AcsUrlDT && AcsUrlDT.URL) {
        let variable = {
          name: "setParameterValues",
          parameterValues: [
            [
              `InternetGatewayDevice.LANDevice.1.WLANConfiguration.${sExistingPositionSSId}.Enable`,
              args.bSSIdStatus,
              "xsd:string",
            ],
          ],
        };
        const { _id: sSerialNumber } = CPEData.data[0];

        args = {
          variable,
          ...args,
          ...AcsUrlDT,
          sSerialNumber: sSerialNumber,
        };

        const update_ACS_Res = await ACSUpdateData.update_ACS(args, CONTEXT);
        return update_ACS_Res;
      }
    } else {
      return erhandler(Body.messagecode, Body);
    }
  }
  return Body;
};
