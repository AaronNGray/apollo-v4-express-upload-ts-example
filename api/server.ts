// @ts-check

import { fileURLToPath } from "node:url";
import http from "node:http";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";

import cors from "cors";
import express from "express";
import { graphqlUploadExpress } from "graphql-upload-ts";
import makeDir from "make-dir";

import UPLOAD_DIRECTORY_URL from "./config/UPLOAD_DIRECTORY_URL";
import schema from "./schema";


async function startServer() {
    // Ensure the upload directory exists.
    await makeDir(fileURLToPath(UPLOAD_DIRECTORY_URL));
//    await makeDir(UPLOAD_DIRECTORY_URL);


    const app = express();
    const httpServer = http.createServer(app);
    const apolloServer = new ApolloServer({
      schema,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await apolloServer.start();

    app.use(cors());

    app.use(
      '/graphql',
      express.json(),
      graphqlUploadExpress({
        // Limits here should be stricter than config for surrounding infrastructure
        // such as NGINX so errors can be handled elegantly by `graphql-upload`.
        maxFileSize: 100000000, // 100 MB
        maxFiles: 20,
      }),
      expressMiddleware(apolloServer)
    );

    httpServer.listen(process.env.PORT, () => {
      console.info(
        `Serving http://localhost:${process.env.PORT} for ${process.env.NODE_ENV}.`
      );
    });
}

startServer();
