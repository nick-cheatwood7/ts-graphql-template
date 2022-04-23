import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import { createUserLoader } from "src/loaders/UserLoader";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
};

// Used to store session data
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
