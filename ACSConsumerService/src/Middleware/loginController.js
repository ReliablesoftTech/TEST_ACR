// const FETCH = require("node-fetch");
//const { BMSUSER_SERVICE_URI, BMSISP_SERVICE_URI } = require("./general");
const { graphqlclient } = require("./graphqlclient");
const jwt = require("jsonwebtoken");
const BMSGraphql = require("@reliablesofttech/bmsgraphqlquery");
const { BMSAPI_SERVICE_URI } = require("./general");

let jAuthObj = {};
let pLogin, bIsPending;

exports.loginController = async (
  sServiceType,
  sIspCode,
  jServiceAttributes
) => {
  if (!bIsPending) {
    if (
      !jAuthObj[sServiceType] ||
      !jAuthObj[sServiceType][sIspCode] ||
      !jAuthObj[sServiceType][sIspCode].sAuthToken ||
      !jAuthObj[sServiceType][sIspCode].sRefreshToken
    ) {
      pLogin = fnLogin(sServiceType, sIspCode, jServiceAttributes);
    } else {
      const { sAuthToken, sRefreshToken } = jAuthObj[sServiceType][sIspCode];
      const jAuthToken = jwt.decode(sAuthToken);
      if (
        jAuthToken &&
        Object.keys(jAuthToken).length > 0 &&
        jAuthToken.payload &&
        jAuthToken.exp
      ) {
        const { exp } = jAuthToken;
        const remainingSessionTime = (exp - new Date().getTime() / 1000) / 60;
        const iRefreshThresold =
          jServiceAttributes && jServiceAttributes.TOKEN_REFRESH_THRESHOLD
            ? jServiceAttributes.TOKEN_REFRESH_THRESHOLD
            : +process.env.TOKEN_REFRESH_THRESHOLD;
        if (
          remainingSessionTime &&
          remainingSessionTime > 0 &&
          remainingSessionTime < iRefreshThresold
        ) {
          pLogin = fnRefreshToken(
            sServiceType,
            sIspCode,
            sAuthToken,
            sRefreshToken
          );
        } else if (remainingSessionTime && remainingSessionTime <= 0) {
          pLogin = fnLogin(sServiceType, sIspCode, jServiceAttributes);
        }
      } else {
        pLogin = fnLogin(sServiceType, sIspCode, jServiceAttributes);
      }
    }
  }
  return await Promise.resolve(pLogin)
    .then(() => {
      bIsPending = false;
      return jAuthObj[sServiceType][sIspCode].sAuthToken;
    })
    .catch((ex) => {
      bIsPending = false;
      console.log("loginError", ex);
      return null;
    });
};

const fnLogin = async (sServiceType, sIspCode, jServiceAttributes) => {
  bIsPending = true;
  let jNewAuthObj = {};
  jNewAuthObj[sServiceType] = jAuthObj[sServiceType]
    ? jAuthObj[sServiceType]
    : {};
  jAuthObj = { ...jAuthObj, ...jNewAuthObj };
  jAuthObj[sServiceType][sIspCode] = {};

  const jBMSLoginObj =
    jServiceAttributes && jServiceAttributes.BMS_LOGIN_OBJ
      ? jServiceAttributes.BMS_LOGIN_OBJ
      : process.env.BMS_LOGIN_OBJ;

  const sQuery = BMSGraphql.UserLogin.userLogin();

  const jLoginObj =
    typeof jBMSLoginObj === "string" ? JSON.parse(jBMSLoginObj) : jBMSLoginObj;

  const jVariables = {
    username: jLoginObj[sServiceType].sUserName,
    password: jLoginObj[sServiceType].sPassword,
    ispcode: sIspCode,
  };

  const sBasicAuthUserName =
    jServiceAttributes && jServiceAttributes.BMS_BASIC_AUTH_USERNAME
      ? jServiceAttributes.BMS_BASIC_AUTH_USERNAME
      : process.env.BMS_BASIC_AUTH_USERNAME;

  const sBasicAuthPassword =
    jServiceAttributes && jServiceAttributes.BMS_BASIC_AUTH_PASSWORD
      ? jServiceAttributes.BMS_BASIC_AUTH_PASSWORD
      : process.env.BMS_BASIC_AUTH_PASSWORD;

  let sAuthToken = sBasicAuthUserName + ":" + sBasicAuthPassword;

  sAuthToken = Buffer.from(sAuthToken).toString("base64");

  const sBMSGatewayUrl =
    jServiceAttributes && jServiceAttributes.BMS_GATEWAY
      ? jServiceAttributes.BMS_GATEWAY
      : BMSAPI_SERVICE_URI.URL;

  const jLoginResp = await graphqlclient(
    sQuery,
    jVariables,
    sBMSGatewayUrl,
    sAuthToken,
    true
  );

  if (
    jLoginResp &&
    jLoginResp.userLogin &&
    jLoginResp.userLogin.success &&
    jLoginResp.userLogin.data &&
    Array.isArray(jLoginResp.userLogin.data) &&
    jLoginResp.userLogin.data.length > 0 &&
    jLoginResp.userLogin.data[0].token
  ) {
    jAuthObj[sServiceType][sIspCode].sAuthToken =
      jLoginResp.userLogin.data[0].token;
    jAuthObj[sServiceType][sIspCode].sRefreshToken =
      jLoginResp.userLogin.data[0].refreshToken;
  }
};

const fnRefreshToken = async (
  sServiceType,
  sIspCode,
  sAuthToken,
  sRefreshToken,
  jServiceAttributes
) => {
  bIsPending = true;
  const sQuery = BMSGraphql.UserLogin.refreshUserSession();
  const jVariables = { refreshToken: sRefreshToken };
  const sBMSGatewayUrl =
    jServiceAttributes && jServiceAttributes.BMS_GATEWAY
      ? jServiceAttributes.BMS_GATEWAY
      : BMSAPI_SERVICE_URI.URL;
  const jRefreshResp = await graphqlclient(
    sQuery,
    jVariables,
    sBMSGatewayUrl,
    sAuthToken
  );
  if (
    jRefreshResp &&
    jRefreshResp.refreshUserSession.success &&
    jRefreshResp.refreshUserSession.data &&
    Object.keys(jRefreshResp.refreshUserSession.data).length > 0 &&
    jRefreshResp.refreshUserSession.data.token
  ) {
    jAuthObj[sServiceType][sIspCode].sAuthToken =
      jRefreshResp.refreshUserSession.data.token;
  } else {
    pLogin = fnLogin(sServiceType, sIspCode, jServiceAttributes);
  }
};
