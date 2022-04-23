import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
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
// import cors from "cors";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app: Express = express();
  const port = parseInt(process.env.PORT) || 3000;

  const RedisStore = connectRedis(session);
  const redisClient = createClient({ legacyMode: true });
  redisClient
    .connect()
    .then(() => {
      console.log("✨ Redis started");
    })
    .catch(console.error);

  !__prod__ && app.set("trust proxy", 1);
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
        sameSite: "lax", //csrf
        secure: __prod__, // only works in https
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "",
      resave: false,
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`✨ Express server listening on http://localhost:${port}`);
  });
};

main().catch((err) => {
  console.error(err);
});
