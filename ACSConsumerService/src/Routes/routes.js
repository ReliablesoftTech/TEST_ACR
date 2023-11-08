let router = require("express").Router();

const {
  initiateConsumerFunction,
} = require("../Controller/ConsumerController");

router.post("/initiateConsumer", initiateConsumerFunction);

module.exports = router;
