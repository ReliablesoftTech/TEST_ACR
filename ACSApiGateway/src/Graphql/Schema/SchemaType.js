import { gql } from "graphql-tag";
const SchemaType = gql`
  scalar Date

  type Query {
    root: String
  }
  type Mutation {
    root: String
  }
`;

module.exports = SchemaType;
