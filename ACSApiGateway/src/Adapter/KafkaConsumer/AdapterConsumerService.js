exports.CONSUMER_SERVICE_URI = {
  URL:
    process.env.NODE_ENV === "dev" || false || +process.env.API_ENVR === 2
      ? "http://localhost:13902/api"
      : "http://acsconsumerservice:13902/api",
  ServiceName: "ACSConsumerService",
};
