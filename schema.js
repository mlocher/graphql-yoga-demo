import { createSchema } from "graphql-yoga";

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    scalar File
    type Query {
      hello(name: String): String
    }
    type Mutation {
      echo(message: String!): String
      readFile(file: File!): String!
    }
  `,
  resolvers: {
    Query: {
      hello(_, _args, context) {
        console.log(context.request.headers);
        return _args["name"] || "world";
      },
    },
    Mutation: {
      echo: (_, _args, context) => {
        console.log(context.request.headers);
        return _args["message"];
      },
      readFile: async (_, { file }, context) => {
        console.log(context.request.headers);
        return `${file.name}, ${file.size}, ${file.type}`;
      },
    },
  },
});
