import wtConfig from './src/config'
import {
    Config
} from 'stellate'

const config: Config = {
    config: {
        ignoreOriginCacheControl: true,
        bypassCacheHeaders: [{
            name: 'skip-cache'
        }],
        injectHeaders: true,
        scopes: {
            AUTHENTICATED_SELF_ONLY: "header:Authorization",
            AUTHENTICATED_JWT: {
                definition: "header:Authorization",
                jwt: {
                    claim: 'sub',
                    algorithm: 'HS256',
                    secret: 'secret'
                }
            }
        },

        rootTypeNames: {
            query: 'Query',
            mutation: 'Mutation'
        },
        rules: [{
                types: {
                    Query: ['me']
                },
                maxAge: 900,
                swr: 900,
                scope: 'AUTHENTICATED_JWT',
                description: 'Cache current user and agency'
            }
        ],
        retries: {
            networkErrors: {
                isEnabled: true,
                whenGraphQLResponse: false
            },
            serverErrors: {
                isEnabled: false
            }
        },
        environments: {
            "staging": {
                "name": "mlocher-demo-yoga-staging",
                "schema": "https://4igd49-4000.csb.app/graphql",
                "originUrl": "https://4igd49-4000.csb.app/graphql",
            }
        },
        "name": "mlocher-demo-yoga",
        "schema": "https://4igd49-4000.csb.app/graphql",
        "originUrl": "https://4igd49-4000.csb.app/graphql",
    }
}

export default config