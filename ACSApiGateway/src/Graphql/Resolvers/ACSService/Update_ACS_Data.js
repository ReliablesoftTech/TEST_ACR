const { default: ACSData } = require("../../../Adapter/ACSService/ACSData");

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
  } else if (args.sSSIdName.length < 2 || args.sSSIdName.length > 32) {
    CONTEXT.name = "SSID Name";
    CONTEXT.minLength = 2;
    CONTEXT.maxLength = 32;
    CONTEXT.iMessageCode = 108;
  } else if (!args.sNewSSIdName) {
    CONTEXT.name = "New SSID Name";
    CONTEXT.iMessageCode = 129;
  } else if (args.sNewSSIdName.length < 2 || args.sNewSSIdName.length > 32) {
    CONTEXT.name = "New SSID Name";
    CONTEXT.minLength = 2;
    CONTEXT.maxLength = 32;
    CONTEXT.iMessageCode = 108;
  } else if (!args.iConnectionId) {
    CONTEXT.name = "Connection";
    CONTEXT.iMessageCode = 129;
  } else if (!args.sSSIdKey) {
    CONTEXT.name = "SSID Key";
    CONTEXT.iMessageCode = 129;
  }
  return erhandler(CONTEXT.iMessageCode, CONTEXT);
};

exports.update_ACS_SSId = async (error, args, CONTEXT) => {
  if (error) throw error;
  args = {
    ...args,
    jContext: CONTEXT,
  };
  let Body = { success: false };

  Body = validate_SSId_Parameter(args);
  console.log("Body", Body);
  if (Body.messagecode === 0) {
    let getSsIdRes = await getSsId(error, args, CONTEXT);
    console.log("getSSIdData", getSsIdRes);

    let existSSIdName = false,
      sExistingPositionSSId = 0,
      visibility = false;
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
          let CPEData = await getACSConfigurationData(error, args, CONTEXT);

          if (
            CPEData &&
            CPEData.data &&
            Array.isArray(CPEData.data) &&
            CPEData.data.length > 0
          ) {
            const { InternetGatewayDevice, _id } = CPEData.data[0];

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
        Body.sEntityName = "SSID Name";
        Body.name = "inactive SSID";
        Body.messagecode = 198;
      }
    } else {
      Body = getSsIdRes;
    }

    if (Body.messagecode === 0) {
      let AcsUrlDT = await getACSConfigurationURL(error, args, CONTEXT);

      if (AcsUrlDT && AcsUrlDT.URL) {
        Body = await ACSData.getACSData(
          { URL: AcsUrlDT.URL, sMacAddress: args.sMacAddress },
          CONTEXT
        );

        if (
          Body.success &&
          Body.data &&
          Array.isArray(Body.data) &&
          Body.data.length > 0
        ) {
          let variable = {
            name: "setParameterValues",
            parameterValues: [
              [
                `InternetGatewayDevice.LANDevice.1.WLANConfiguration.${sExistingPositionSSId}.SSID`,
                args.sNewSSIdName,
                "xsd:string",
              ],
            ],
          };
          const { _id: sSerialNumber } = Body.data[0];
          console.log("Body.data[0]", Body.data[0]);

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
    } else {
      return erhandler(Body.messagecode, Body);
    }
  }
  return Body;
};

exports.updateACSCommandStatus = async (error, args, CONTEXT) => {
  CONTEXT = {
    ...CONTEXT,
    sFormMode: "edit",
    iMenuId: CONTEXT && CONTEXT.iMenuId ? CONTEXT.iMenuId : "mnuGeneral",
  };
  args = {
    ...args,
    jContext: CONTEXT,
  };

  if (error) return error;
  return await ACSUpdateData.updateACSCommandStatus(
    { ...args, iUpdatedBy: CONTEXT.iEmployeeId },
    CONTEXT
  );
};
