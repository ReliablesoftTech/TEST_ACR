const { GraphQLClient } = require("graphql-request");

exports.graphqlclient = async (
  query,
  variables,
  gqlUrl,
  isLogin,
  authToken,
  jServiceAttributes
) => {
  let url = gqlUrl; // ? gqlUrl : BMSAPI_SERVICE_URI.URL;

  // const { BMS_BASIC_AUTH_USERNAME, BMS_BASIC_AUTH_PASSWORD } =
  //   jServiceAttributes;

  // if (isLogin) {
  //   authToken =
  //     (process.env.BMS_BASIC_AUTH_USERNAME
  //       ? process.env.BMS_BASIC_AUTH_USERNAME
  //       : BMS_BASIC_AUTH_USERNAME) +
  //     ":" +
  //     (process.env.BMS_BASIC_AUTH_PASSWORD
  //       ? process.env.BMS_BASIC_AUTH_PASSWORD
  //       : BMS_BASIC_AUTH_PASSWORD);
  //   authToken = Buffer.from(authToken).toString("base64");
  // }

  const graphQLClient = new GraphQLClient(url, {
    headers: {
      authorization: `${isLogin ? `Basic` : `Bearer`} ${authToken}`,
    },
  });
  console.log("graphQLClient", graphQLClient);

  if (query) {
    return await graphQLClient.request(query.loc.source.body, variables);
  } else {
    return [];
  }
};
