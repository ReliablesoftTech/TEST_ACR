const { erhandler } = require("@reliablesofttech/bmsmessagehandler");
let { fnCONTEXT } = require("@reliablesofttech/bmsmiddleware");
const {
  insertMacCommandQueue,
} = require("../DB/Query/MacCommandQueue/insertMacCommandQueue");

const { getACSConfig } = require("../DB/Query/ACSConfiguration/getACSConfig");

const {
  updateACSCommandStatus,
} = require("../DB/Query/MacCommandQueue/updateACSCommandStatus");
module.exports = {
  GETACSCONFIG: async (req, res) => {
    let CONTEXT = fnCONTEXT();
    CONTEXT = await getACSConfig(req, CONTEXT);
    res.status(200).json(erhandler(CONTEXT.iMessageCode, CONTEXT));
  },
  INSERTMACSCOMMANDQUEUE: async (req, res) => {
    let CONTEXT = fnCONTEXT();
    CONTEXT = await insertMacCommandQueue(req, CONTEXT);
    res.status(200).json(erhandler(CONTEXT.iMessageCode, CONTEXT));
  },
  updateACSCommandStatusFunction: async (req, res) => {
    let CONTEXT = fnCONTEXT();
    CONTEXT = await updateACSCommandStatus(req, CONTEXT);
    res.status(200).json(erhandler(CONTEXT.iMessageCode, CONTEXT));
  },
};
