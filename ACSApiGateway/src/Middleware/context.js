/*
  ------------------------------------------------------------------------------------------------------------------------------------------------------
  --| Ticketno       | Datetime                      | Developer             | Action                       |--
  ------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------
*/

const fs = require("fs");
const jwt = require("jsonwebtoken");
let path = require("path");

const { Encrypter } = require("@reliablesofttech/bmsmiddleware");
const crypto = require("crypto");
import { GraphQLError as AuthenticationError } from "graphql";
import IspValidate from "../Adapter/IspService/ispValidate";

const context = async ({ req, res, adad, dasdasd, dasdfasd }) => {
  const token = req.headers.authorization || "";
  return await validateToken(token);
};
const validateToken = async (token) => {
  let DATA = false;
  try {
    const TOKENKEY = token.split(" ")[1];

    const PRIVATEKEY = fs.readFileSync(
      path.resolve(__dirname + "/private.pem"),
      "utf8"
    );

    const sSalt = crypto
      .createHash("sha256")
      .update(PRIVATEKEY.replace(/\s/g, ""), "binary")
      .digest("hex")
      .substring(0, 32);

    DATA = jwt.verify(TOKENKEY, sSalt);

    if (!DATA) {
      throw new AuthenticationError(
        JSON.stringify({
          success: false,
          message: `You are not authorized to use this functionality`,
          errorcode: 500,
        })
      );
    } else {
      const oEncrypter = new Encrypter("aes-256-cbc", sSalt);
      DATA = JSON.parse(oEncrypter.decrypt(DATA.payload));
      console.log("DATA", DATA);
      const { sIspCode, iEmployeeId, iIspId, tokenType } = DATA;
      console.log("ACS", tokenType);
      if (tokenType === "ACS") {
        const CONTEXT = { sFormMode: "get", iMenuId: "mnuGeneral" };

        let BODY = await IspValidate.ispValidate(
          {
            ispcode: sIspCode,
            iOpConnId: 6,
            iServiceId: process.env.SERVICEID,
          },
          CONTEXT
        );

        if (
          BODY &&
          BODY.success &&
          BODY.data &&
          Array.isArray(BODY.data) &&
          BODY.data.length > 0
        ) {
          let jServiceRegistry =
            BODY.data[0].jServiceRegistry &&
            BODY.data[0].jServiceRegistry.serviceAttributes
              ? JSON.parse(BODY.data[0].jServiceRegistry.serviceAttributes)
              : undefined;

          const sEnv =
            process.env.NODE_ENV === "dev" || +process.env.API_ENVR === 2
              ? "dev"
              : "prod";
          DATA = {
            sIspCode: sIspCode,
            iEmployeeId: iEmployeeId,
            iIspId: iIspId,
            sConnStr: BODY.data[0].ispcode,
            jServiceAttributes: jServiceRegistry
              ? jServiceRegistry[sEnv]
              : undefined,
          };
        } else {
          return false;
        }
      } else {
        throw new AuthenticationError(
          JSON.stringify({
            success: false,
            message: `You are not authorized to use this functionality`,
            errorcode: 500,
          })
        );
      }
    }
    return DATA;
  } catch (ex) {
    // console.log("ex", ex);
    throw new AuthenticationError(
      JSON.stringify({
        success: false,
        message: `You are not authorized to use this functionality`,
        errorcode: 500,
      })
    );
  }
};
export default context;
