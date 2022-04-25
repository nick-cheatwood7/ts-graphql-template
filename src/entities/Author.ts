import { Entity, Column, OneToMany } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { CustomEntity } from "./templates/CustomEntity";
import { Book } from "./Book";

@ObjectType()
@Entity({ name: "authors" })
export class Author extends CustomEntity {
  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}
