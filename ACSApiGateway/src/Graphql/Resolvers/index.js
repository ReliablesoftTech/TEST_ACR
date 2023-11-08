import * as Query from "./exportQueryResolver";
import * as Mutation from "./exportMutationResolver";
import dateScalar from "./zzCustomScalar/Date";

//const { GraphQLScalarType, Kind } = require("graphql");

// Validation function for checking "oddness"

const resolvers = {
  Query,
  Mutation,
  Date: dateScalar,
};
export default resolvers;
