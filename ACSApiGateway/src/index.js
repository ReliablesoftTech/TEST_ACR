require("dotenv").config();
import { ApolloServer } from "@apollo/server";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import resolvers from "./Graphql/Resolvers";
import typeDefs from "./Graphql/typedefs";
import context from "../src/Middleware/context";
import http, { Server } from "http";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { json } from "body-parser";
const { makeExecutableSchema } = require("@graphql-tools/schema");

const url = require("url");
const app = express();
const httpServer = http.createServer(app);
const client = require("prom-client");
const register = new client.Registry();
let router = express.Router();

register.setDefaultLabels({
  app: "bmsapigateway",
});

client.collectDefaultMetrics({ register });

//NOTE Create a histogram metric
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in microseconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

//NOTE Register the histogram
register.registerMetric(httpRequestDurationMicroseconds);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const apolloSever = new ApolloServer({
  resolvers,
  typeDefs,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  // rootValue: root,
  context,
  formatError: (err) => {
    return { message: err.message };
  },
});

app.use(cookieParser());
app.use(
  cors({
    origin: (orgin, cb) => cb(null, true),
    credentials: true,
  })
);

router.use(async function (req, res, next) {
  const end = httpRequestDurationMicroseconds.startTimer();
  const route = url.parse(req.url).pathname;
  if (route === "/metrics") {
    res.setHeader("Content-Type", register.contentType);
    res.end(await register.metrics());
  }
  end({ route, code: res.statusCode, method: req.method });
  next();
});
app.use("/", router);

const corsOptions = {
  credentials: true,
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
};
apolloSever.start().then((res) => {
  app.use(
    "/graphql",
    cors(corsOptions),
    json(),
    expressMiddleware(apolloSever, {
      context,
    })
  );
});

const PORT = process.env.PORT || 13900;

new Promise((resolve) => httpServer.listen({ port: PORT }, resolve)).then(
  (res) => {
    console.log(`ACS Gateway Server UP`);
  }
);
