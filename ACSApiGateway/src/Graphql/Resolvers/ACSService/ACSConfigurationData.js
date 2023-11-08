import { erhandler } from "@reliablesofttech/bmsmessagehandler";
import ACSData from "../../../Adapter/ACSService/ACSData";

exports.getACSConfigurationURL = async (error, args, CONTEXT) => {
  args = {
    ...args,

    jContext: CONTEXT,
  };
  const AcsConfigData = await ACSData.getACSConfigData(
    { iConfigId: 1 },
    CONTEXT
  );
  if (
    AcsConfigData.success &&
    AcsConfigData.data &&
    Array.isArray(AcsConfigData.data) &&
    AcsConfigData.data.length > 0
  ) {
    let AcsUrlDT = AcsConfigData.data[0];
    return JSON.parse(AcsUrlDT.sConfigValue);
  }
  return erhandler(99, CONTEXT);
};

exports.getACSConfigurationData = async (error, args, CONTEXT) => {
  args = {
    ...args,
    jContext: CONTEXT,
  };
  const AcsConfigData = await ACSData.getACSConfigData(
    { iConfigId: 1 },
    CONTEXT
  );
  if (
    AcsConfigData.success &&
    AcsConfigData.data &&
    Array.isArray(AcsConfigData.data) &&
    AcsConfigData.data.length > 0
  ) {
    let AcsUrlDT = AcsConfigData.data[0];

    args = { ...args, ...JSON.parse(AcsUrlDT.sConfigValue) };
    const CPEData = await ACSData.getACSData(args, CONTEXT);
    return CPEData;
  }
};
