import { Request, Response } from "express";
// import { createUserLoader } from "src/loaders/UserLoader";

export type MyContext = {
  req: Request;
  res: Response;
  // userLoader: ReturnType<typeof createUserLoader>;
};

// Used to store session data
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
