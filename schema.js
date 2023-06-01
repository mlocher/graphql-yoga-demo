import { createSchema } from "graphql-yoga";

const wait = (time) =>
  new Promise((resolve) => setTimeout(resolve, time))

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    scalar File
    type Query {
      hello(name: String): String
      alphabet: [String!]!
      fastField: String!
      slowField(waitFor: Int! = 5000): String
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
      async *alphabet() {
        for (const character of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
          yield character
          await wait(1000)
        }
      },
      fastField: async () => {
        await wait(100)
        return 'I am speedy'
      },
      slowField: async (_, { waitFor }) => {
        await wait(waitFor)
        return 'I am slow'
      }
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
