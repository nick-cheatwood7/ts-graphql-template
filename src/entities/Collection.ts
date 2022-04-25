import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { CustomEntity } from "./templates/CustomEntity";
import { Book } from "./Book";

@ObjectType()
@Entity({ name: "collections" })
export class Collection extends CustomEntity {
  @Field()
  @Column()
  name: string;

  @ManyToMany(() => Book, (book) => book.collections)
  @JoinTable({ name: "books_collections_join" })
  books: Book[];
}
