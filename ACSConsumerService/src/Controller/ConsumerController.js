const kafkaConsumers = require("../Middleware/kafkaConsumer");

module.exports = {
  initiateConsumerFunction: async (req, res) => {
    try {
      const {
        arrKafkaBrokers,
        sClientName,
        sTopicName,
        sConsumerName,
        // jContext,
      } = req.body;

      // const { jServiceAttributes } = jContext;
      await kafkaConsumers[sConsumerName](
        arrKafkaBrokers,
        sClientName,
        sTopicName,
        req
      );

      res.status(200).json({ success: true });
    } catch (ex) {
      console.log("Error : ", ex);
      res.status(500).json({ success: false });
    }
  },
};
