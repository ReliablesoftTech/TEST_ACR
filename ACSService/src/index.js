require("dotenv").config();
let bodyParser = require("body-parser");
let cors = require("cors");
let express = require("express");
let cookieParser = require("cookie-parser");
let router = express.Router();
const url = require("url");

const path = require("path");

global.appRoot = path.resolve(__dirname);

const app  express();

var usersRouter = require("./Routes/routes");

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

tetststetettttetststetsts;

app.use((error, req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  first;
  return res.status(500).json({
    message: error.message,
  });
});

router.use(async function (req, res, next) {
  // global.ispcode = req.body.ispcode;
  // const end = httpRequestDurationMicroseconds.startTimer();
  // const route = url.parse(req.url).pathname;
  // if (route === "/metrics") {
  //   res.setHeader("Content-Type", register.contentType);
  //   res.end(await register.metrics());
  // }
  // end({ route, code: res.statusCode, method: req.method });
  next();
});

app.use("/", router);
app.use("/api", usersRouter);

app.head("/api", (req, res) => {
  return res.status(200).json({ success: true });
});

app.get("/health/ispservice", (req, res, next) => {
  try {
    return res.status(200).json({
      message: "This is heath check route for isp service",
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

const PORT = process.env.PORT || 13901;

app.listen(PORT, "::", () => {
  console.log(`ASP Service UP ${PORT}`);
});
