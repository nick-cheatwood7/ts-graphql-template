import { Entity, Column, ManyToOne, ManyToMany } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { CustomEntity } from "./templates/CustomEntity";
import { Author } from "./Author";
import { Collection } from "./Collection";

@ObjectType()
@Entity({ name: "books" })
export class Book extends CustomEntity {
  @Field()
  @Column()
  title: string;

  @Field(() => Int)
  @Column()
  year: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  authorId: string;

  @Field(() => Author, { nullable: true })
  @ManyToOne(() => Author, (author) => author.books)
  author: Author;

  @ManyToMany(() => Collection, (collection) => collection.books)
  collections: Collection[];
}
