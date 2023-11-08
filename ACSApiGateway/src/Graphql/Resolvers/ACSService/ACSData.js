import { erhandler } from "@reliablesofttech/bmsmessagehandler";
import axios from "axios";
import moment from "moment";
import ACSData from "../../../Adapter/ACSService/ACSData";
import {
  getACSConfigurationData,
  getACSConfigurationURL,
} from "../ACSService/ACSConfigurationData";
import { getSsId } from "../exportQueryResolver";

const validate_SSId_Parameter = (args) => {
  let CONTEXT = {
    name: "",
    iMessageCode: 0,
  };
  if (!args.sMacAddress) {
    CONTEXT.name = "MAC Address";
    CONTEXT.iMessageCode = 129;
  } else if (!args.sSSIdKey) {
    CONTEXT.name = "SSID Key";
    CONTEXT.iMessageCode = 129;
  } else if (!args.sSSIdName) {
    CONTEXT.name = "SSID Name";
    CONTEXT.iMessageCode = 129;
  }
  return erhandler(CONTEXT.iMessageCode, CONTEXT);
};

exports.getACS = async (error, args, CONTEXT) => {
  if (error) throw error;
  args = {
    ...args,
    jContext: CONTEXT,
  };

  let AcsUrlDT = await getACSConfigurationURL(error, args, CONTEXT);
  if (AcsUrlDT) {
    args = { ...args, ...AcsUrlDT };
    // return FirewallServicePort.getACS(args, CONTEXT);
    let CPEData = await ACSData.getACSData(args, CONTEXT);

    if (
      CPEData &&
      CPEData.data &&
      Array.isArray(CPEData.data) &&
      CPEData.data.length > 0
    ) {
      let Data = {
        sMacAddress: args.sMacAddress,
        sCPEStatus: false,
        tUpSince: "",
        sSerialNumber: "",
        sMacAddress: "",
        sIpv4Address: "",
        sIpv6Address: "",
        sFirmwareVersion: "",
        tLastUpdated: "",
      };

      const { InternetGatewayDevice, _id, _lastBoot, _deviceId, _lastInform } =
        CPEData.data[0];

      const { _value: sFirmwareVersion } =
        InternetGatewayDevice.DeviceInfo.SoftwareVersion;
      let WLANConfiguration_keys = Object.keys(
        InternetGatewayDevice.WANDevice["1"].WANConnectionDevice["1"]
          .WANIPConnection
      );

      // NOTE GET THE STATUS
      let sCPEStatus = true,
        sIpAddress = [];

      let URL = AcsUrlDT.URL + "?query=";

      // console.log("refreshObject", refreshObject);

      if (_id) {
        const sRefreshUrl = `${AcsUrlDT.URL}${_id}/tasks?connection_request`;
        console.log("sRefreshUrl", sRefreshUrl);
        await axios({
          method: "POST",
          url: sRefreshUrl,
          data: {
            name: "refreshObject",
            objectName: "DeviceID.ID",
          },
        }).then((res) => {
          if (res.status === 202 && res.statusText === "Device is offline") {
            sCPEStatus = false;
          }
        });
      }

      WLANConfiguration_keys.map((itm, ind) => {
        if (
          InternetGatewayDevice.WANDevice["1"].WANConnectionDevice["1"]
            .WANIPConnection[itm].ExternalIPAddress
        ) {
          let externalData =
            InternetGatewayDevice.WANDevice["1"].WANConnectionDevice["1"]
              .WANIPConnection[itm].ExternalIPAddress;

          if (externalData._value !== "0.0.0.0" && externalData._value) {
            sIpAddress.push(externalData._value);
          }
        }
      });

      let tCurrentTime = moment(new Date()).format("DD-MM-YYYY hh:mm A");

      let tlastInform = moment(new Date(_lastInform)).format(
        "DD-MM-YYYY hh:mm A"
      );
      let DifferenceMinute = moment(tCurrentTime).diff(tlastInform, "M");

      // NOTE GET THE SERIAL NUMBER
      Data = {
        ...Data,
        sCPEStatus: DifferenceMinute < 5 ? true : false,
        tUpSince: moment(new Date(_lastBoot)).format("DD-MM-YYYY hh:mm A"),
        sMacAddress: args.sMacAddress,
        sSerialNumber: _deviceId._SerialNumber,
        sIpv4Address: sIpAddress.join(),
        sFirmwareVersion: sFirmwareVersion,
        tLastUpdated: moment(new Date(_lastInform)).format(
          "DD-MM-YYYY hh:mm A"
        ),
      };
      CPEData = {
        ...CPEData,
        data: [Data],
      };
    }

    // NOTE GET CPE STATUS

    return CPEData;
  }
  return AcsUrlDT;
};

exports.getSsId = async (error, args, CONTEXT) => {
  if (error) throw error;

  args = {
    ...args,
    jContext: CONTEXT,
  };

  let CPEData = await getACSConfigurationData(error, args, CONTEXT);
  let ssidArray = [];
  if (
    CPEData &&
    CPEData.data &&
    Array.isArray(CPEData.data) &&
    CPEData.data.length > 0
  ) {
    const { InternetGatewayDevice, _id } = CPEData.data[0];
    let WLANConfiguration_keys = Object.keys(
      InternetGatewayDevice.LANDevice["1"].WLANConfiguration
    );

    let { MACAddress } =
      InternetGatewayDevice.WANDevice["1"].WANConnectionDevice["1"]
        .WANIPConnection["1"];
    if (
      WLANConfiguration_keys &&
      Array.isArray(WLANConfiguration_keys) &&
      WLANConfiguration_keys.length > 0
    ) {
      WLANConfiguration_keys.map((itm, ind) => {
        if (InternetGatewayDevice.LANDevice["1"].WLANConfiguration[itm].SSID) {
          let { SSID } =
            InternetGatewayDevice.LANDevice["1"].WLANConfiguration[itm];
          // let { MACAddress } =
          //   InternetGatewayDevice?.WANDevice?.["1"]?.WANConnectionDevice?.["1"]
          //     ?.WANIPConnection?.[itm];
          ssidArray.push({
            sSSIdName: SSID._value,
            // Key: itm,
            sSSIdKey: itm,
            sMacAddress: MACAddress ? MACAddress._value : "",
          });
        }
      });
      CPEData.data = ssidArray;
    }
  }
  return CPEData;
};

exports.getSsIdCurrentDetails = async (error, args, CONTEXT) => {
  try {
    if (error) throw error;
    args = {
      ...args,
      jContext: CONTEXT,
    };
    let Body = validate_SSId_Parameter(args);
    if (Body.messagecode === 0) {
      let getSsIdRes = await getSsId(error, args, CONTEXT);
      Body = getSsIdRes;
      if (
        getSsIdRes &&
        Array.isArray(getSsIdRes.data) &&
        getSsIdRes.data.length > 0
      ) {
        let CPEData = await getACSConfigurationData(error, args, CONTEXT);
        if (
          CPEData &&
          CPEData.data &&
          Array.isArray(CPEData.data) &&
          CPEData.data.length > 0
        ) {
          const { InternetGatewayDevice, _id } = CPEData.data[0];
          let { MACAddress } =
            InternetGatewayDevice.WANDevice["1"].WANConnectionDevice["1"]
              .WANIPConnection["1"];
          let isRecordExists = false;
          let dataArray = [];
          for (const itm of getSsIdRes.data) {
            if (
              itm.sSSIdName === args.sSSIdName &&
              itm.sSSIdKey === "" + args.sSSIdKey
            ) {
              isRecordExists = true;
              let {
                Enable,
                WPS,
                X_TP_PreSharedKey,
                X_TP_Band,
                SSID,
                SSIDAdvertisementEnabled,
              } =
                InternetGatewayDevice.LANDevice["1"].WLANConfiguration[
                  itm.sSSIdKey
                ];
              Body.messagecode = 100;
              dataArray.push({
                sSSIdPassword:
                  X_TP_PreSharedKey && X_TP_PreSharedKey._value
                    ? X_TP_PreSharedKey._value
                    : null,
                sFrequency:
                  X_TP_Band && X_TP_Band._value ? X_TP_Band._value : null,

                sStatus:
                  Enable && (Enable._value === false || Enable._value === true)
                    ? Enable._value
                    : null,
                bWPS:
                  WPS &&
                  WPS.Enable &&
                  (WPS.Enable._value === false || WPS.Enable._value === true)
                    ? WPS.Enable._value
                    : null,
                bVisibility:
                  SSIDAdvertisementEnabled &&
                  (SSIDAdvertisementEnabled._value === false ||
                    SSIDAdvertisementEnabled._value === true)
                    ? SSIDAdvertisementEnabled._value
                    : null,
                sSSIdName: SSID && SSID._value ? SSID._value : null,
                sMacAddress:
                  MACAddress && MACAddress._value ? MACAddress._value : null,
              });

              // Body.data = [
              //   {
              //     sSSIdPassword:
              //       X_TP_PreSharedKey && X_TP_PreSharedKey._value
              //         ? X_TP_PreSharedKey._value
              //         : null,
              //     sFrequency:
              //       X_TP_Band && X_TP_Band._value ? X_TP_Band._value : null,

              //     sStatus:
              //       Enable &&
              //       (Enable._value === false || Enable._value === true)
              //         ? Enable._value
              //         : null,
              //     bWPS:
              //       WPS &&
              //       WPS.Enable &&
              //       (WPS.Enable._value === false || WPS.Enable._value === true)
              //         ? WPS.Enable._value
              //         : null,
              //     bVisibility:
              //       SSIDAdvertisementEnabled &&
              //       (SSIDAdvertisementEnabled._value === false ||
              //         SSIDAdvertisementEnabled._value === true)
              //         ? SSIDAdvertisementEnabled._value
              //         : null,
              //     sSSIdName: SSID && SSID._value ? SSID._value : null,
              //     sMacAddress:
              //       MACAddress && MACAddress._value ? MACAddress._value : null,
              //   },
              // ];
            } else if (!isRecordExists) {
              Body.messagecode = 196;
              Body.name = "SSID Name";
              Body.data = [];
            }
          }
          Body.data = dataArray;
        }
      }
      Body = erhandler(Body.messagecode, Body);
    }
    return Body;
  } catch (error) {
    console.log("error", error);
  }
};
