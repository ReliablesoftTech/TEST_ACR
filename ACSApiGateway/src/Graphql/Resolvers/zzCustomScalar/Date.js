const { GraphQLScalarType, Kind } = require("graphql");
const moment = require("moment");

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    let aDate = moment(
      value,
      ["DD-MMM-YYYY", "DD-MMM-YYYY hh:mm a", "DD-MMM-YYYY hh:mm A"],
      true
    ); //no longer valid!
    if (aDate.isValid()) 
    {
      let date = new Date(value);
      date = date.getTime() - date.getTimezoneOffset() * 60 * 1000;
      return new Date(date);
      //return new Date(value);
    } // Convert incoming integer to Date
    throw new UserInputError("Provided value is not an Date");
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

module.exports = dateScalar;
