import { Entity, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { BaseEntity } from "./templates/BaseEntity";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @Property()
  firstName: string;

  @Field()
  @Property()
  lastName: string;

  @Field()
  @Property({ unique: true })
  email: string;

  @Field()
  @Property({ hidden: true })
  password: string;
}
