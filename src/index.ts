import "reflect-metadata";
import express, { Express } from "express";
import "dotenv-safe/config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";
import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__ } from "./utils/constants";
import { MyContext } from "./utils/types";
import db from "./db";
import { BookResolver } from "./resolvers/book";
import { AuthorResolver } from "./resolvers/author";
import { createAuthorLoader } from "./loaders/AuthorLoader";

const main = async () => {
  await db
    .initialize()
    .then(() => {
      console.log("🚀 Connected to database.");
    })
    .catch(() => {
      console.error("⚠️ Could not connect to database.");
    });

  const app: Express = express();
  const port = parseInt(process.env.PORT) || 3000;

  const RedisStore = connectRedis(session);
  const redisClient = createClient({ legacyMode: true });
  redisClient
    .connect()
    .then(() => {
      console.log("⚡️ Redis db started");
    })
    .catch(() => {
      console.error("⚠️  Unable to connect to Redis");
    });

  app.set("trust proxy", !__prod__);
  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient as any,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: __prod__ ? "lax" : "none", //csrf
        secure: true, // if true, Apollo studio works, if false Postman works
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "",
      resave: false,
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, BookResolver, AuthorResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      authorLoader: createAuthorLoader(),
    }),
  });

  await server.start();
  if (!__prod__) {
    server.applyMiddleware({
      app,
      cors: {
        credentials: true,
        origin: [
          "https://studio.apollographql.com",
          `http://localhost:${port}/graphql`,
        ],
      },
    });
  } else {
    server.applyMiddleware({ app, cors: false });
  }

  app.listen(port, () => {
    console.log(`✨ Express server listening on http://localhost:${port}`);
  });
};

main().catch((err) => {
  console.error(err);
});
