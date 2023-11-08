const { Kafka } = require("kafkajs");
const { ascController } = require("./acsController");
const { graphqlclient } = require("./graphqlclient");
const { loginController } = require("./loginController");
const { BMSAPI_SERVICE_URI, ACS_GATEWAY } = require("./general");
const BMSGraphql = require("@reliablesofttech/bmsgraphqlquery");
const ACSGraphql = require("@reliablesofttech/acsgraphqlquery");
const { ACS } = BMSGraphql;
const { ACSService } = ACSGraphql;
const { getAcsAuthToken: GETACSAUTHTOKEN } = ACS;
const { updateACSCommandStatus: UPDATEACSCOMMANDSTATUS } = ACSService;
const sApiEnv = String(process.env.API_ENVR).trim();

const getConsumer = async (brokers, client, topic, group) => {
  const kkafka = new Kafka({ client, brokers });
  const kConsumer = kkafka.consumer({ groupId: group });
  await kConsumer.connect();
  await kConsumer.subscribe({ topic });
  return kConsumer;
};
exports.acsConsumer = async (arrBrokers, sClientName, sTopicName, req) => {
  const radiusConsumer = await getConsumer(
    arrBrokers ? arrBrokers : [process.env.KAFKA_BROKER],
    sClientName ? sClientName : "acsClient" + sApiEnv,
    sTopicName ? sTopicName : "acsTopic" + sApiEnv,
    sClientName ? sClientName : "acsConsumer" + sApiEnv
  );

  const kakfaMembers = (await radiusConsumer.describeGroup()).members;

  const kakfaMembersLength =
    kakfaMembers && Array.isArray(kakfaMembers) ? kakfaMembers.length : 0;

  //   if (kakfaMembersLength === 0) {
  await radiusConsumer.run({
    eachMessage: async ({ message }) => {
      let jServiceAttributes;
      const acsUpdateData = JSON.parse(message.value);

      const { sIspCode, iTransId } = acsUpdateData;

      let vars = {
        iTransId: +iTransId,
        iCommandStatusId: 2,
        sResponse: "",
      };

      if (req.body) {
        let { jContext } = req.body;

        if (jContext && jContext.jServiceAttributes) {
          jServiceAttributes = req.body.jContext.jServiceAttributes;
        }
      }

      const sBmsUrl =
        jServiceAttributes && jServiceAttributes.BMS_GATEWAY
          ? jServiceAttributes.BMS_GATEWAY
          : BMSAPI_SERVICE_URI.URL;

      const sAcsUrl =
        jServiceAttributes && jServiceAttributes.ACS_GATEWAY
          ? jServiceAttributes.ACS_GATEWAY
          : ACS_GATEWAY.URL;

      // NOTE BMSAPI Auth Token
      const sAuthToken = await loginController(
        "RADIUS",
        sIspCode,
        jServiceAttributes
      );
      if (sAuthToken) {
        // NOTE GET ACS SERVER AUTH TOKEN

        let sACSToken = await graphqlclient(
          GETACSAUTHTOKEN(),
          {},
          sBmsUrl,
          sAuthToken
        );

        sACSToken = sACSToken.getAcsAuthToken;
        if (
          sACSToken &&
          sACSToken.success &&
          sACSToken.data &&
          Array.isArray(sACSToken.data) &&
          sACSToken.data.length > 0
        ) {
          const { sToken: sACSGateWayToken } = sACSToken.data[0];

          await graphqlclient(
            UPDATEACSCOMMANDSTATUS(),
            vars,
            sAcsUrl,
            sACSGateWayToken
          );
          if (acsUpdateData && acsUpdateData.variable && acsUpdateData.URL) {
            ascController({
              ...acsUpdateData,
              sAcsUrl: sAcsUrl,
              sACSGateWayToken: sACSGateWayToken,
            });
          }
        }
      }
    },
  });
};
