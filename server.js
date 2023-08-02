import 'dotenv/config'

import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { useJWT } from '@graphql-yoga/plugin-jwt'
import { schema } from "./schema.js";

const signingKey = process.env.JWT_SECRET;

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({
  schema,
  cors: {
    origin: 'http://localhost:4000',
    credentials: true,
    allowedHeaders: ['X-Custom-Header'],
    methods: ['POST']
  },
  plugins: [
    useDeferStream(),
    useJWT({
      issuer: 'http://demo.stellate.co',
      signingKey,
      algorithms: ['HS256'],
    })
  ]
});

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
