import "dotenv/config";
import crypto from "crypto";
import { createSchema } from "graphql-yoga";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";

const jwtSigningKey = process.env.JWT_SECRET;
const stellateSigningKey = process.env.STELLATE_SECRET;
const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

function checkStellateSignature(context) {
  const stellateSignature = context.request.headers.get("stellate-signature");
  const errors = [];

  if (!stellateSignature) {
    errros.push(
      new GraphQLError("You aren't authorized to request this API.", {
        extensions: {
          code: "SIGNATURE_NOT_PRESENT",
          http: {
            status: 401,
          },
        },
      })
    );
  }

  const payload = JSON.stringify({
    query: context.params.query,
    variables: context.params.variables,
    operationName: context.params.operationName,
  });

  const values = stellateSignature.split(",");
  const obj = {
    signature: "",
    expiry: "",
  };

  values.forEach((val) => {
    if (val.startsWith("v1:")) {
      obj.signature = val.replace("v1:", "");
    } else if (val.startsWith("expiry:")) {
      obj.expiry = val.replace("expiry:", "");
    }
  });

  const sig = crypto
    .createHmac("sha256", stellateSigningKey)
    .update(payload)
    .digest("base64");

  if (
    !obj.signature ||
    !crypto.timingSafeEqual(
      Buffer.from(obj.signature, "base64"),
      Buffer.from(sig, "base64")
    )
  ) {
    errors.push(
      new GraphQLError("You aren't authorized to request this API.", {
        extensions: {
          code: "SIGNATURE_MISMATCH",
          http: {
            status: 401,
          },
        },
      })
    );
  }

  const date = Date.now();
  if (date > Number(obj.expiry)) {
    errors.push(
      new GraphQLError("You aren't authorized to request this API.", {
        extensions: {
          code: "SIGNATURE_EXPIRED",
          http: {
            status: 401,
          },
        },
      })
    );
  }
  console.log({
    incoming_signature: obj.signature,
    computed_signature: sig,
    incoming_date: obj.expiry,
    current_date: String(date),
    payload: payload,
    errors: errors,
  });
  if (errors.length > 0) {
    throw errors;
  }
}

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    scalar File
    type Query {
      hello(name: String): String
      me: String
      alphabet: [String!]!
      fastField: String!
      slowField(waitFor: Int! = 5000): String
      categories(onlyRoots: Boolean): [Category]
    }
    type Category {
      id: String!
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
        checkStellateSignature(context);
        return _args["name"] || "world";
      },
      me(_, _args, context) {
        if (!context.jwt) {
          throw new GraphQLError("Unauthorized");
        }
        return context.jwt.sub;
      },
      categories(_, _args, context) {
        console.log(context.params);
        checkStellateSignature(context);
        return ["categoryA", "categoryB"];
      },
      async *alphabet() {
        for (const character of ["a", "b", "c", "d", "e", "f", "g"]) {
          yield character;
          await wait(1000);
        }
      },
      fastField: async () => {
        await wait(100);
        return "I am speedy";
      },
      slowField: async (_, { waitFor }) => {
        await wait(waitFor);
        return "I am slow";
      },
    },
    Category: {
      id(_, _args, context) {
        return "categoryA";
      },
    },
    Mutation: {
      echo: (_, _args, context) => {
        console.log(context.request.headers);
        return _args["message"];
      },
      login: (_, { email, password }) => {
        if (email != password) {
          throw new GraphQLError("Invalid Credentials");
        }

        return jwt.sign({ username: email }, jwtSigningKey, {
          algorithm: "HS256",
          issuer: "http://demo.stellate.co",
          subject: email,
        });
      },
      readFile: async (_, { file }, context) => {
        console.log(context.request.headers);
        return `${file.name}, ${file.size}, ${file.type}`;
      },
    },
  },
});
