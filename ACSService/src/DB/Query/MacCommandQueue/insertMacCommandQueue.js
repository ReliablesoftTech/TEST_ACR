const {
  insertMacCommandQueue,
  insertMacCommandQueueT,
} = require("../ExportQuery/ACSQuery");
const { ExceptionHandling } = require("@reliablesofttech/bmsmiddleware");
exports.insertMacCommandQueue = async (req, CONTEXT) => {
  let data = req.body;
  let pool = require("@reliablesofttech/bmspgdas");
  try {
    if (CONTEXT.iMessageCode === 0) {
      let sSql = insertMacCommandQueue(data);

      let result = await pool.query(req, sSql);

      let iTransId = 0;
      if (
        result &&
        result.rowCount > 0 &&
        result.rows &&
        Array.isArray(result.rows) &&
        result.rows.length > 0
      ) {
        iTransId = result.rows[0].iTransId;

        data = { ...data.variable, iTransId: iTransId };

        let sSql = insertMacCommandQueueT(data);

        result = await pool.query(req, sSql);

        if (
          result &&
          result.rowCount > 0 &&
          result.rows &&
          Array.isArray(result.rows) &&
          result.rows.length > 0
        ) {
          CONTEXT.iMessageCode = 101;
          CONTEXT.data = { iTransId: iTransId };
        } else {
          CONTEXT.iMessageCode = 104;
        }
      } else {
        CONTEXT.iMessageCode = 104;
      }
    }
  } catch (ex) {
    CONTEXT = await ExceptionHandling(ex);
  }
  return CONTEXT;
};
