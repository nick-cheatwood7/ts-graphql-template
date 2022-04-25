import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Book } from "../entities/Book";
import { BaseResponse } from "../utils/types";

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
}

@InputType()
class UpdateBookInput {
  @Field()
  id: string;
  @Field({ nullable: true })
  title?: string;
  @Field(() => Int, { nullable: true })
  year?: number;
}

@Resolver()
export class BookResolver {
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
  async getBook(@Arg("id") id: string): Promise<Book | null> {
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
  async getBooks(): Promise<Book[] | undefined> {
    return Book.find();
  }
}