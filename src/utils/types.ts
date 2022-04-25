import { Request, Response } from "express";
import { Field, ObjectType } from "type-graphql";
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

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
export class BaseResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
