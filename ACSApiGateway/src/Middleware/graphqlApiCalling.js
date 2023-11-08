import bmsgraphqlquery from "@reliablesofttech/bmsgraphqlquery";
import { graphqlclient } from "../Middleware/graphqlclient";

exports.graphqlApiCalling = async (jGqlData, sGqlCls, sGql, CONTEXT) => {
  let gql = bmsgraphqlquery[sGqlCls][sGql]();

  const { sIspCode, jServiceAttributes } = CONTEXT;
  const { BMS_LOGIN_OBJ, BMS_GATEWAY } = jServiceAttributes;
  const { sUserName, sPassword } = BMS_LOGIN_OBJ.RADIUS;
  const gatewayUrl = BMS_GATEWAY
    ? BMS_GATEWAY
    : process.env.BMS_API_GATEWAY_URL;
  const loginGql = bmsgraphqlquery.UserLogin.userLogin();

  let jLoginResp = [];

  try {
    jLoginResp = await graphqlclient(
      loginGql,
      {
        username: sUserName,
        password: sPassword,
        ispcode: sIspCode,
      },
      gatewayUrl,
      true,
      "",
      jServiceAttributes
    );
  } catch (ex) {
    console.log("ex", ex);
  }

  try {
    if (
      jLoginResp &&
      jLoginResp.userLogin &&
      jLoginResp.userLogin.data &&
      Array.isArray(jLoginResp.userLogin.data) &&
      jLoginResp.userLogin.data.length > 0
    ) {
      const resutl = await graphqlclient(
        gql,
        jGqlData,
        gatewayUrl,
        false,
        jLoginResp.userLogin.data[0].token,
        jServiceAttributes
      );
      return resutl;
    }
  } catch (ex) {
    console.log("ex", ex);
  }
};
