import { Entity, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { BaseEntity } from "./templates/BaseEntity";

@ObjectType()
@Entity({ tableName: "users" })
export class User extends BaseEntity {
  @Field()
  @Property()
  firstName!: string;

  @Field()
  @Property()
  lastName!: string;

  @Field()
  @Property({ unique: true })
  email!: string;

  @Property({ type: "text", hidden: true })
  password!: string;
}
