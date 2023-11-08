import { gql } from "graphql-tag";

const ACSData = gql`
  type getACSDT {
    sCPEStatus: Boolean
    tUpSince: String
    sSerialNumber: String
    sMacAddress: String
    sIpv4Address: String
    sIpv6Address: String
    sFirmwareVersion: String
    tLastUpdated: String
  }

  type getSsIdDT {
    sSSIdName: String
    sMacAddress: String
    sSSIdKey: String
  }

  type getSsIdCurrentDetailsDT {
    sFrequency: String
    sStatus: Boolean
    bVisibility: Boolean
    bWPS: Boolean
    sSSIdName: String
    sSSIdPassword: String
    sMacAddress: String
  }
  type getCurrentPairedUserDT {
    sUserIpAddress: String
    sUserMacAddress: String
    sConnectedHostName: String
  }

  type getCurrentPairedUser {
    success: Boolean
    message: String
    messagecode: Int
    data: [getCurrentPairedUserDT]
  }

  type getACS {
    success: Boolean
    message: String
    messagecode: Int
    data: [getACSDT]
  }

  type getSsId {
    success: Boolean
    message: String
    messagecode: Int
    data: [getSsIdDT]
  }
  type getSsIdCurrentDetails {
    success: Boolean
    message: String
    messagecode: Int
    data: [getSsIdCurrentDetailsDT]
  }
  extend type Query {
    getACS(sMacAddress: String!): getACS
    getSsId(sMacAddress: String!): getSsId
    getSsIdCurrentDetails(
      sMacAddress: String!
      sSSIdName: String!
      sSSIdKey: String!
    ): getSsIdCurrentDetails
    getCurrentPairedUser(sMacAddress: String!): getCurrentPairedUser
  }
`;

module.exports = ACSData;
