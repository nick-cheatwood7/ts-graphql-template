import DataLoader from "dataloader";
import { In } from "typeorm";
import { Author } from "../entities/Author";

export const createAuthorLoader = () =>
  new DataLoader<string, Author | null>(async (authorIds) => {
    const authors = await Author.findBy({ id: In(authorIds as string[]) });
    const authorIdToAuthor: Record<string, Author> = {};
    authors.forEach((a) => {
      authorIdToAuthor[a.id] = a;
    });
    return authorIds.map((authorId) => authorIdToAuthor[authorId]);
  });
