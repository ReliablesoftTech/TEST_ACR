/*
  ------------------------------------------------------------------------------------------------------------------------------------------------------
  --| Ticketno       | Datetime                      | Developer             | Action                       |--
  ------------------------------------------------------------------------------------------------------------------------------------------------------
*/
import { ExceptionHandling } from "@reliablesofttech/bmsmiddleware";

exports.APICalling = async (url, route, args, CONTEXT, isPermitSkip) => {
  let data = [];
  const { sConnStr, jServiceAttributes } = CONTEXT;

  let servicename = url.ServiceName;
  let bIsCallApi = true;

  if (bIsCallApi) {
    //NOTE COMMENT JSERVICE ATTRIBUTE WORK
    url =
      jServiceAttributes && jServiceAttributes[servicename]
        ? jServiceAttributes[servicename]
        : url.URL;

    // url = "http://localhost:13901/api";
    if (!args.jContext) args = { ...args, jContext: CONTEXT };
    const got = require("got");
    // console.log(`${URL}/${route}`);
    try {
      if (args) {
        args = { ...args, servicename: servicename };
      }
      // console.log("argss", `${url}/${route}/`);
      // InsertLogDataFn(args, url, route, {}, CONTEXT);
      data = await got
        .post(`${url}/${route}/`, {
          json: {
            ...args,
          },
          // headers: {
          //   token: global.token,
          //   ispcode: global.token,
          // },
          headers: {
            authorization: sConnStr,
          },
        })
        .json();

      // InsertLogDataFn(args, url, route, data, CONTEXT);
    } catch (ex) {
      //NOTE VALIDATION MSG TO THE UI
      console.log("ex", ex, route);
      data = ExceptionHandling();
    }
  } else {
    data = ExceptionHandling();
  }
  return data;
};
