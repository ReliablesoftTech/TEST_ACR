import { Kafka } from "kafkajs";
import KafkaConsumer from "../Adapter/KafkaConsumer/kafkaConsumer";

export async function kafkaProducer(
  data,
  clientName,
  topicName,
  CONTEXT,
  sConsumerName
) {
  const sApiEnv = String(process.env.API_ENVR).trim();

  let clientId = "my-app";
  let topic = "Bulk-Topic-100";
  const { jServiceAttributes } = CONTEXT;
  const brokers = [
    jServiceAttributes && jServiceAttributes["KAFKA_BROKER"]
      ? jServiceAttributes["KAFKA_BROKER"]
      : process.env.KAFKA_BROKER,
  ];
  // const brokers = [sKafkaBroker];

  let jQueueData = { sIspCode: CONTEXT.sIspCode, ...JSON.parse(data) };

  const { sIspCode } = jQueueData;
  topic = (topicName ? topicName : topic) + "_" + sApiEnv + "_" + sIspCode;
  clientId =
    (clientName ? clientName : clientId) + "_" + sApiEnv + "_" + sIspCode;

  // if (
  //   CONTEXT &&
  //   CONTEXT.sIspCode &&
  //   CONTEXT.sIspCode.toLowerCase() !== "bmsradtest" &&
  //   topic.includes("radius")
  // ) {
  //   return;
  // }
  data = JSON.stringify(jQueueData);

  const args = {
    arrKafkaBrokers: brokers,
    sIspCode: sIspCode,
    sTopicName: topic,
    sClientName: clientId,
    sConsumerName: sConsumerName,
  };

  console.log("args", args);
  await KafkaConsumer.initiateConsumer(args, CONTEXT);
  // console.log("topic", topic);
  const kafka = new Kafka({ clientId, brokers });
  const producer = kafka.producer();
  let i = 0;
  await producer.connect();
  await producer.send({
    topic: topic,
    partition: 0,
    messages: [
      {
        key: String(i),
        value: data,
      },
    ],
  });
  // console.log("CONTEXT", CONTEXT);
  // console.log("args", args);
}
