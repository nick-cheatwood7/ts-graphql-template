import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Book } from "../entities/Book";
import { BaseResponse, MyContext } from "../utils/types";
import db from "../db";
import { Author } from "../entities/Author";

@ObjectType()
class BookResponse extends BaseResponse {
  @Field(() => Book, { nullable: true })
  book?: Book;
}

@InputType()
class CreateBookInput {
  @Field()
  title: string;
  @Field(() => Int)
  year: number;
  @Field({ nullable: true })
  authorId?: string;
}

@InputType()
class UpdateBookInput {
  @Field()
  id: string;
  @Field({ nullable: true })
  title?: string;
  @Field(() => Int, { nullable: true })
  year?: number;
  @Field({ nullable: true })
  authorId?: string;
}

@Resolver(Book)
export class BookResolver {
  @FieldResolver(() => Author, { nullable: true })
  author(@Root() book: Book, @Ctx() { authorLoader }: MyContext) {
    if (book.authorId !== null) {
      return authorLoader.load(book.authorId);
    } else {
      return null;
    }
  }

  // Create Book
  @Mutation(() => BookResponse, { nullable: true })
  async createBook(
    @Arg("options") options: CreateBookInput
  ): Promise<BookResponse> {
    if (options.title.length === 0) {
      return {
        errors: [{ field: "title", message: "title cannot be empty" }],
      };
    }
    if (options.year.toString().length !== 4) {
      return {
        errors: [
          {
            field: "year",
            message: "year must be a 4-digit value",
          },
        ],
      };
    }
    const book = await Book.create({ ...options }).save();
    return { book };
  }

  // Find Book
  @Query(() => Book, { nullable: true })
  async book(@Arg("id") id: string): Promise<Book | null> {
    return await Book.findOneBy({ id: id });
  }

  // Update Book
  @Mutation(() => Book, { nullable: true })
  async updatebook(
    @Arg("options") options: UpdateBookInput
  ): Promise<Book | null> {
    const book = await Book.findOneBy({ id: options.id });
    if (!book) {
      return null;
    }
    try {
      await Book.update(
        {
          id: book.id,
        },
        {
          authorId: options.authorId,
          title: options.title,
          year: options.year,
        }
      );
      await book.reload(); // Refresh the book ref.
      return book;
    } catch {
      return null;
    }
  }

  // Delete Book
  @Mutation(() => Boolean)
  async deleteBook(@Arg("id") id: string): Promise<boolean> {
    try {
      Book.delete(id);
      return true;
    } catch {
      return false;
    }
  }

  // List all Books
  @Query(() => [Book], { nullable: true })
  async books(
    @Arg("limit") limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Book[]> {
    const realLimit = Math.min(50, limit); // cap list at 50
    const qb = db
      .getRepository(Book)
      .createQueryBuilder("b")
      .orderBy('"createdAt"', "DESC")
      .take(realLimit);
    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) }); // convert string to timestamp
    }
    return qb.getMany();
  }
}
