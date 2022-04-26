import { Entity, Column, ManyToOne } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { CustomEntity } from "./templates/CustomEntity";
import { Author } from "./Author";

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
}
