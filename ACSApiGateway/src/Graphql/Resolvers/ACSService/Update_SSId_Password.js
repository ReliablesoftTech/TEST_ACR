import { erhandler } from "@reliablesofttech/bmsmessagehandler";
import ACSUpdateData from "../../../Adapter/ACSService/ACSUpdateData";
import {
  getACSConfigurationURL,
  getACSConfigurationData,
} from "./ACSConfigurationData";
import { getSsId } from "./ACSData";

const validate_SSIdPassword = (args) => {
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
  } else if (!args.iConnectionId) {
    CONTEXT.name = "Connection";
    CONTEXT.iMessageCode = 129;
  } else if (args.sSSIdPassword && args.sSSIdPassword.length > 32) {
    CONTEXT.name = "SSID Password";
    CONTEXT.maxLength = 32;
    CONTEXT.iMessageCode = 144;
  } else if (!args.sSSIdKey) {
    CONTEXT.name = "SSID Key";
    CONTEXT.iMessageCode = 129;
  }
  return erhandler(CONTEXT.iMessageCode, CONTEXT);
};
exports.update_SSId_Password = async (error, args, CONTEXT) => {
  if (error) throw error;
  args = {
    ...args,
    jContext: CONTEXT,
  };
  let Body = { success: false };
  Body = validate_SSIdPassword(args);

  if (Body.messagecode === 0) {
    let getSsIdRes = await getSsId(error, args, CONTEXT);

    let existSSIdName = false,
      sExistingPositionSSId = 0,
      visibility = false;
    let CPEData;
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

          if (
            CPEData &&
            CPEData.data &&
            Array.isArray(CPEData.data) &&
            CPEData.data.length > 0
          ) {
            const { InternetGatewayDevice } = CPEData.data[0];

            let { Enable } =
              InternetGatewayDevice.LANDevice["1"].WLANConfiguration[
                itm.sSSIdKey
              ];
            if (Enable && Enable._value && Enable._value === true) {
              visibility = true;
            }
          }
        }
      }
      if (!existSSIdName) {
        Body.name = "SSID Name";
        Body.messagecode = 196;
      } else if (!visibility) {
        Body.sEntityName = "SSID Password";

        Body.name = "inactive SSID";
        Body.messagecode = 198;
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
              `InternetGatewayDevice.LANDevice.1.WLANConfiguration.${sExistingPositionSSId}.X_TP_PreSharedKey`,
              args.sSSIdPassword,
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

        let updateResponse = await ACSUpdateData.update_ACS(args, CONTEXT);
        return updateResponse;
      }
    } else {
      return erhandler(Body.messagecode, Body);
    }
  }
  return Body;
};
