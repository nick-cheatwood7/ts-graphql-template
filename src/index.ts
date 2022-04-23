import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import express, { Express } from "express";
import "dotenv-safe/config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app: Express = express();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  await server.start();
  server.applyMiddleware({ app });

  const port = parseInt(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`✨Express server listening on localhost:${port}✨`);
  });
};

main().catch((err) => {
  console.error(err);
});
