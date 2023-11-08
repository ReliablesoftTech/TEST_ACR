let router = require("express").Router();
const {
  GETACSCONFIG,
  INSERTMACSCOMMANDQUEUE,
  updateACSCommandStatusFunction,
} = require("../Controller/ACSConfig");

router.post("/getacsconfig", GETACSCONFIG);
router.post("/insertmacscommandqueue", INSERTMACSCOMMANDQUEUE);

router.post("/updateacscommandstatus", updateACSCommandStatusFunction);
module.exports = router;
