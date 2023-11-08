import { CONSUMER_SERVICE_URI } from "./AdapterConsumerService";
import { APICalling } from "../../Middleware/ApiCalling";
export default class KafkaConsumer {
  static async initiateConsumer(args, CONTEXT) {
    const BODY = await APICalling(
      CONSUMER_SERVICE_URI,
      "initiateConsumer",
      args,
      CONTEXT,
      true
    );
    return BODY;
  }
}
