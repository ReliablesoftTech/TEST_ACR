exports.BMSACS_SERVICE_URI = {
  URL:
    process.env.NODE_ENV === "dev" || false || +process.env.API_ENVR === 2
      ? "http://localhost:13901/api"
      : "http://acsservice:13901/api",
  ServiceName: "ACSService",
};


exports.BMSISP_SERVICE_URI = {
  URL:
    process.env.NODE_ENV === "dev" || false || +process.env.API_ENVR === 2
      ? "http://localhost:13402/api"
      : "http://172.17.0.1:13402/api",
  ServiceName: "ISPService",
};
