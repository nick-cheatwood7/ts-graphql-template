import { Request, Response } from "express";
import { createAuthorLoader } from "../loaders/AuthorLoader";
import { Field, ObjectType } from "type-graphql";

export type MyContext = {
  req: Request;
  res: Response;
  authorLoader: ReturnType<typeof createAuthorLoader>;
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
