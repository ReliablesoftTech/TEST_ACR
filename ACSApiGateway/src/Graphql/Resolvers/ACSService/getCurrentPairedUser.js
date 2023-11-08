import { getACSConfigurationData } from "../ACSService/ACSConfigurationData";
import { erhandler } from "@reliablesofttech/bmsmessagehandler";

exports.getCurrentPairedUser = async (error, args, CONTEXT) => {
  if (error) throw error;
  args = {
    ...args,
    jContext: CONTEXT,
  };
  let CPEData = await getACSConfigurationData(error, args, CONTEXT);
  let sIpAddress = [];

  if (
    CPEData &&
    CPEData.data &&
    Array.isArray(CPEData.data) &&
    CPEData.data.length > 0
  ) {
    const { InternetGatewayDevice, _id } = CPEData.data[0];

    let LANHost = Object.keys(InternetGatewayDevice.LANDevice["1"].Hosts.Host);

    LANHost.map((itm, ind) => {
      if (InternetGatewayDevice.LANDevice["1"].Hosts.Host[itm].IPAddress) {
        let IPAddress =
          InternetGatewayDevice.LANDevice["1"].Hosts.Host[itm].IPAddress;
        let MACAddress =
          InternetGatewayDevice.LANDevice["1"].Hosts.Host[itm].MACAddress;
        let HostName =
          InternetGatewayDevice.LANDevice["1"].Hosts.Host[itm].HostName;

        if (
          IPAddress._value &&
          MACAddress._value &&
          IPAddress._value !== "0.0.0.0" &&
          MACAddress._value !== "0.0.0.0"
        ) {
          sIpAddress.push({
            sUserIpAddress: IPAddress._value,
            sUserMacAddress: MACAddress._value,
            sConnectedHostName: HostName._value,
          });
        }
      }
    });
    let Body = { iMessageCode: 0, iResponceCode: 200 };
    if (sIpAddress && Array.isArray(sIpAddress) && sIpAddress.length > 0) {
      Body.data = sIpAddress;
      Body.iMessageCode = 100;
    } else {
      Body.iMessageCode = 99;
    }

    return erhandler(Body.iMessageCode, Body);
  }
  return CPEData;
};
