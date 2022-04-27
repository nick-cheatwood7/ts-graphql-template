import DataLoader from "dataloader";
import { In } from "typeorm";
import { Book } from "../entities/Book";

export const createBookLoader = () =>
  new DataLoader<string, Book | null>(async (bookIds) => {
    const books = await Book.findBy({ id: In(bookIds as string[]) });
    const data: Record<string, Book> = {};
    books.forEach((b) => {
      data[b.id] = b;
    });
    return bookIds.map((bookId) => data[bookId]);
  });
