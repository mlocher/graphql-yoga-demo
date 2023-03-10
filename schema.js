import { createSchema } from "graphql-yoga";

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello(name: String): String
    }
  `,
  resolvers: {
    Query: {
      hello(_, _args, context) {
        console.log(context.request.headers);
        return _args["name"] || "world";
      }
    }
  }
});
