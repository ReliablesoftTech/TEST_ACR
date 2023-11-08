const { getACSConfig } = require("../ExportQuery/ACSQuery");
const { ExceptionHandling } = require("@reliablesofttech/bmsmiddleware");
exports.getACSConfig = async (req, CONTEXT) => {
  let data = req.body;
  let pool = require("@reliablesofttech/bmspgdas");
  try {
    if (CONTEXT.iMessageCode === 0) {
      let sSql = getACSConfig(data);

      let result = await pool.query(req, sSql);
       console.log("result",result, sSql);
      if (
        result &&
        result.rows &&
        Array.isArray(result.rows) &&
        result.rows.length > 0
      ) {
        CONTEXT.data = result.rows;
        CONTEXT.iMessageCode = 100;
      } else {
        CONTEXT.iMessageCode = 99;
      }
    }
  } catch (ex) {
    CONTEXT = await ExceptionHandling(ex);
  }
  return CONTEXT;
};
