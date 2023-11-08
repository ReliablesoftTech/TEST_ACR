exports.BMSUSER_SERVICE_URI = {
  URL:
    process.env.NODE_ENV === "dev" || false || +process.env.API_ENVR === 2
      ? "http://localhost:13401/api/userLogin"
      : "http://bmsuserservice:13401/api/userLogin",

  ServiceName: "bmsuserservice",
};
exports.BMSISP_SERVICE_URI = {
  URL:
    process.env.NODE_ENV === "dev" || false || +process.env.API_ENVR === 2
      ? "http://localhost:13402/api/ispValidate"
      : process.env.ISP_SERVICE,

  ServiceName: "bmsispservice",
};
exports.BMSAPI_SERVICE_URI = {
  URL:
    process.env.NODE_ENV === "dev" || false || +process.env.API_ENVR === 2
      ? "http://localhost:13400/graphql"
      : "http://bmsapigateway:13400/graphql",

  ServiceName: "bmsapigateway",
};


exports.ACS_GATEWAY = {
  URL:
    process.env.NODE_ENV === "dev" || false || +process.env.API_ENVR === 2
      ? "http://localhost:13900/graphql"
      : "http://192.168.2.212:13900/graphql",

  ServiceName: "acsapigateway",
};
