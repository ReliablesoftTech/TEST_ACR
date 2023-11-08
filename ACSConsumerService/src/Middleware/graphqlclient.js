const { GraphQLClient } = require("graphql-request");
const { BMSAPI_SERVICE_URI } = require("./general");

exports.graphqlclient = async (
  query,
  variables,
  gqlUrl,
  authorization,
  isLogin,
  bIsHeader
) => {
  let url = gqlUrl ? gqlUrl : BMSAPI_SERVICE_URI.URL;
  let auth = (isLogin ? "Basic " : "Bearer ") + authorization; //? authorization : "Bearer " + global.AuthToken;
  let header = {
    authorization: auth,
    // iDocumentEntityTypeId: bIsHeader ? "13,14,6,16,17" : "0",
  };
  if (bIsHeader) {
    header = { ...header, iDocumentEntityTypeId: "13,14,6,16,17" };
  }
  const graphQLClient = new GraphQLClient(url, {
    headers: header,
  });
  console.log("query.loc.source.body", query.loc.source.body);
  console.log("variables", variables);
  if (query) {
    // return (results = await graphQLClient.request(
    //   query.loc.source.body,
    //   variables
    // ));
    const results = await graphQLClient.request(
      query.loc.source.body,
      variables
    );
    return results;
  } else {
    return [];
  }
};
