import { gql } from "graphql-tag";

const UpdateACSData = gql`
  type response {
    success: Boolean
    messagecode: Int
    message: String
  }

  extend type Mutation {
    update_ACS_SSId(
      sMacAddress: String!
      sSSIdName: String!
      iConnectionId: Int!
      sNewSSIdName: String!
      sSSIdKey: String!
    ): response

    updateACSCommandStatus(
      iTransId: Int!
      iCommandStatusId: Int!
      sResponse: String
    ): response

    update_ACS_SSID_Status(
      sMacAddress: String!
      sSSIdName: String!
      iConnectionId: Int!
      bSSIdStatus: Boolean!
      sSSIdKey: String!
    ): response

    update_SSId_Password(
      sMacAddress: String!
      sSSIdName: String!
      iConnectionId: Int!
      sSSIdPassword: String!
      sSSIdKey: String!
    ): response

    reboot_ACS(sMacAddress: String!, iConnectionId: Int): response

    update_Auth_Detail(
      sMacAddress: String!
      sUserName: String!
      sPassword: String!
      iConnectionId: Int
      sServiceName: String
    ): response

    update_ACS_SSID_Visibility(
      sMacAddress: String!
      sSSIdName: String!
      iConnectionId: Int
      bSSIDVisibility: Boolean!
      sSSIdKey: String!
    ): response

    update_ACS_SSID_WPS_Status(
      sMacAddress: String!
      sSSIdName: String!
      iConnectionId: Int
      bSSIDWPS: Boolean!
      sSSIdKey: String!
    ): response
  }
`;

module.exports = UpdateACSData;
