exports.getACSConfig = ({ iConfigId }) => {
  let sSql = `
    SELECT ID "iConfigId",VALUE "sConfigValue" FROM "acs".acsconfig
      WHERE 0 = 0
      `;

  if (iConfigId && !isNaN(iConfigId) && iConfigId > 0) {
    sSql += ` AND id = ${iConfigId} `;
  }
  sSql += `;`;
  return sSql;
};

exports.insertMacCommandQueue = (args) => {
  console.log("ider aaya data mai", args);
  const {
    iMaxTransSno,
    iConnectionId,
    iPriority,
    sCommandParam,
    iCommandId,
    iEmployeeId,
    sMacAddress,
    iIspId,
  } = args.variable;

  let sSql = `INSERT INTO acs.macscommandqueue(
     maxtranssno, transdate, connectionid, priority, commandparam, commandid, employeeid, macaddress, ispid)
     VALUES (${iMaxTransSno}, now(), ${iConnectionId}, ${iPriority}, '${sCommandParam}', ${iCommandId}, ${iEmployeeId}, '${sMacAddress}', ${iIspId}) 
     RETURNING transid as "iTransId"`;

  return sSql;
};

exports.insertMacCommandQueueT = (args) => {
  const { iTransId } = args;
  console.log("iTransId", iTransId);
  let sSql = `
    INSERT INTO acs.macscommandqueuet(
    transid, transsno, acscommandstatusid, updatedate, response)
    VALUES (${iTransId}, 1, 1, now(), '')
     RETURNING transid AS "iTransId", transsno as "iTransSno"`;

  return sSql;
};

exports.commandStatusIdNotExistsQuery = (iCommandStatusId) => {
  let sSql = `select 1 from acs.iacscommandstatus where statusid = ${iCommandStatusId} limit 1`;
  return sSql;
};
