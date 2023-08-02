import 'dotenv/config'

import { createSchema } from "graphql-yoga";
import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'

const signingKey = process.env.JWT_SECRET;
const wait = (time) =>
  new Promise((resolve) => setTimeout(resolve, time))

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    scalar File
    type Query {
      hello(name: String): String
      me: String
      alphabet: [String!]!
      fastField: String!
      slowField(waitFor: Int! = 5000): String
    }
    type Mutation {
      echo(message: String!): String
      login(email: String!, password: String!): String
      readFile(file: File!): String!
    }
  `,
  resolvers: {
    Query: {
      hello(_, _args, context) {
        console.log(context.request.headers);
        return _args["name"] || "world";
      },
      me(_, _args, context) {
        if (!context.jwt) {
          throw new GraphQLError('Unauthorized')
          //return null
        }
        return context.jwt.sub
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
      login: (_, { email, password }) => {
          if (email != password) {
            throw new GraphQLError('Invalid Credentials')
          }

          return jwt.sign({ username: email }, signingKey, {
            algorithm: 'HS256',
            issuer: 'http://demo.stellate.co',
            subject: email
          })
      },
      readFile: async (_, { file }, context) => {
        console.log(context.request.headers);
        return `${file.name}, ${file.size}, ${file.type}`;
      },
    },
  },
});
