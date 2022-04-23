import { Entity, Property, PrimaryKey } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";

@ObjectType()
@Entity({ abstract: true })
export class BaseEntity {
  @Field()
  @PrimaryKey()
  id: string = v4();

  @Field(() => String)
  @Property({ type: "date" })
  createdAt?: Date = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
