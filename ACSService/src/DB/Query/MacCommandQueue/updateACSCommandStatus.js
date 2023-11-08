const {
  commandStatusIdNotExistsQuery,
  insertMacCommandQueueT,
} = require("../ExportQuery/ACSQuery");

exports.updateACSCommandStatus = async (req, CONTEXT) => {
  let data = req.body;
  const pool = require("@reliablesofttech/bmspgdas");

  CONTEXT = {
    name: "ACS",
    defaultData: data,
    iMessageCode: 0,
  };
  const DefaultData = CONTEXT.defaultData;
  if (CONTEXT.iMessageCode === 0) {
    let { iCommandStatusId, sResponse, iTransId } = DefaultData;

    let iMaxTransSno;
    try {
      if (CONTEXT.iMessageCode === 0) {
        let sSql = `select Max(transsno)+1 "iMaxTransSno" from acs.macscommandqueuet
                    where transid = ${iTransId};
                    `;

        const result = await pool.query(req, sSql);
        if (
          result &&
          result.rows &&
          Array.isArray(result.rows) &&
          result.rows.length > 0
        ) {
          iMaxTransSno = result.rows[0].iMaxTransSno;
          if (iMaxTransSno) {
            CONTEXT.iMessageCode = 100;
          } else {
            CONTEXT.iMessageCode = 135;
            CONTEXT.name = "Transaction ID";
          }
        }
      }
      //NOTE VALIDATE COMMAND STATUS ID
      if (CONTEXT.iMessageCode === 100) {
        const commandStatusIdNotExistsQueryResult = await pool.query(
          req,
          commandStatusIdNotExistsQuery(iCommandStatusId)
        );

        if (
          commandStatusIdNotExistsQueryResult &&
          commandStatusIdNotExistsQueryResult.rowCount === 0
        ) {
          CONTEXT.iMessageCode = 135;
          CONTEXT.name = "Command Status";
        }
      }

      if (CONTEXT.iMessageCode === 100) {
        let sSql = ` INSERT INTO acs.macscommandqueuet(
            transid, transsno, acscommandstatusid, updatedate, response)
            VALUES (${iTransId}, ${iMaxTransSno}, ${iCommandStatusId}, now(), '${sResponse}')`;

        const result = await pool.query(req, sSql);
        if (result.rowCount > 0) {
          CONTEXT.iMessageCode = 101;
        } else {
          CONTEXT.iMessageCode = 104;
        }
      }

      if (CONTEXT.iMessageCode === 101) {
        let sSql = `UPDATE acs.macscommandqueue SET maxtranssno = ${iMaxTransSno} WHERE transid = ${iTransId}`;

        const result = await pool.query(req, sSql);
        if (result.rowCount > 0) {
          CONTEXT.iMessageCode = 250;
          CONTEXT.name = "Status";
          CONTEXT.data = "";
        } else CONTEXT.iMessageCode = 99;
      }
    } catch (ex) {
      CONTEXT.sMessage = ex.toString();
      CONTEXT.iMessageCode = -9999;
    }
  }

  return CONTEXT;
};
