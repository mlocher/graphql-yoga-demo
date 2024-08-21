import { Config } from "stellate";

const config: Config = {
  config: {
    name: "mlocher-demo-yoga",
    originUrl: "https://f7gxsr-5000.csb.app/graphql",
    schema: "https://f7gxsr-5000.csb.app/graphql",
    schemaPolling: {
      enabled: true,
    },
    cacheIntrospection: true,
    mutationPolicy: "List",
    rootTypeNames: {
      query: "Query",
      mutation: "Mutation",
    },
    rules: [
      {
        types: ["Query"],
        maxAge: 86400,
        swr: 600,
      },
      {
        types: ["Category"],
        maxAge: 5,
        swr: 0,
      },
    ],
    nonCacheable: [],
    requestSigning: {
      secret: "my-super-secret-secret",
    },
  },
};
export default config;
