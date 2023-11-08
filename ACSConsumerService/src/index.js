require("dotenv").config();
var bodyParser = require("body-parser");
var cors = require("cors");
var express = require("express");
var cookieParser = require("cookie-parser");
var router = express.Router();
const url = require("url");
const client = require("prom-client");
const path = require("path");

global.appRoot = path.resolve(__dirname);
const app = express();

//var usersRouter = require("./Routes/routes");

// const register = new client.Registry();

const consumerRouter = require("./Routes/routes");

// register.setDefaultLabels({
//   app: "bmsispservice",
// });

// client.collectDefaultMetrics({ register });

// Create a histogram metric
// const httpRequestDurationMicroseconds = new client.Histogram({
//   name: "http_request_duration_seconds",
//   help: "Duration of HTTP requests in microseconds",
//   labelNames: ["method", "route", "code"],
//   buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
// });

// Register the histogram
// register.registerMetric(httpRequestDurationMicroseconds);

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.use((error, req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  return res.status(500).json({
    message: error.message,
  });
});

router.use(async function (req, res, next) {
  // global.ispcode = req.body.ispcode;
  //   const end = httpRequestDurationMicroseconds.startTimer();
  //   const route = url.parse(req.url).pathname;
  //   if (route === "/metrics") {
  //     res.setHeader("Content-Type", register.contentType);
  //     res.end(await register.metrics());
  //   }
  //   end({ route, code: res.statusCode, method: req.method });
  next();
});
app.use("/", router);
//app.use("/api", usersRouter);
app.use("/api", consumerRouter);

app.head("/api", (req, res) => {
  return res.status(200).json({ success: true });
});

// Health Check route for User Service
app.get("/health/consumerservice", (req, res) => {
  try {
    return res.status(200).json({
      message: "This is heath check route for consumer service",
      timestamp: new Date().toLocaleString(),
      statusCode: res.statusCode,
    });
  } catch (error) {
    return res.status(200).json({
      message: error.message.toString(),
      timestamp: new Date().toLocaleString(),
      statusCode: res.statusCode,
    });
  }
});

const PORT = process.env.PORT || 13902;

app.listen(PORT, "::", async () => {
  console.log(`CONSUMER Service UP ${PORT}`);

  // await loginController(
  //   variables,
  //   '{"usertoken":"BI-00138","logdbtoken":"623ed29304a2278763983be1","entityid":12,"entity":"Area","employee":12,"IspCode":"bmsdev","iDefaultCompanyId":"1"}'
  // );
  //graphqlclient();
  // bulkconnector(
  //   '{"usertoken":"BI-00138","logdbtoken":"623ed29304a2278763983be1","entityid":12,"entity":"Area","employee":12,"IspCode":"bmsdev","iDefaultCompanyId":"1"}'
  // );
});
