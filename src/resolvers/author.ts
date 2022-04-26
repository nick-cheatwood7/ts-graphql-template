import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Author } from "../entities/Author";
import { BaseResponse } from "../utils/types";
import db from "../db";

@ObjectType()
class AuthorResponse extends BaseResponse {
  @Field(() => Author, { nullable: true })
  author?: Author;
}

@InputType()
class CreateAuthorInput {
  @Field()
  firstName: string;
  @Field()
  lastName: string;
}

@InputType()
class UpdateAuthorInput {
  @Field()
  id: string;
  @Field({ nullable: true })
  firstName?: string;
  @Field({ nullable: true })
  lastName?: string;
}

@Resolver(Author)
export class AuthorResolver {
  // Create Author
  @Mutation(() => AuthorResponse, { nullable: true })
  async createAuthor(
    @Arg("options") options: CreateAuthorInput
  ): Promise<AuthorResponse> {
    if (options.firstName.length === 0) {
      return {
        errors: [{ field: "firstName", message: "firstName cannot be empty" }],
      };
    }
    if (options.lastName.length === 0) {
      return {
        errors: [
          {
            field: "lastName",
            message: "lastName cannot be empty",
          },
        ],
      };
    }
    const author = await Author.create({ ...options }).save();
    return { author };
  }

  // Find Author
  @Query(() => Author, { nullable: true })
  async author(@Arg("id") id: string): Promise<Author | null> {
    return await Author.findOneBy({ id: id });
  }

  // Update Author
  @Mutation(() => Author, { nullable: true })
  async updateAuthor(
    @Arg("options") options: UpdateAuthorInput
  ): Promise<Author | null> {
    const author = await Author.findOneBy({ id: options.id });
    if (!author) {
      return null;
    }
    try {
      await Author.update(
        {
          id: author.id,
        },
        {
          firstName: options.firstName,
          lastName: options.lastName,
        }
      );
      await author.reload();
      return author;
    } catch {
      return null;
    }
  }

  // Delete Author
  @Mutation(() => Boolean)
  async deleteAuthor(@Arg("id") id: string): Promise<boolean> {
    try {
      Author.delete(id);
      return true;
    } catch {
      return false;
    }
  }

  // List all Authors
  @Query(() => [Author], { nullable: true })
  async authors(
    @Arg("limit") limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Author[]> {
    const realLimit = Math.min(50, limit); // cap list at 50
    const qb = db
      .getRepository(Author)
      .createQueryBuilder("a")
      .orderBy('"createdAt"', "DESC")
      .take(realLimit);
    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) }); // convert string to timestamp
    }
    return qb.getMany();
  }
}
