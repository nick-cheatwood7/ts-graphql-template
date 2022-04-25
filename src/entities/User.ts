import { Entity, Column } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { CustomEntity } from "./templates/CustomEntity";
// TODO: Add class validation for email, phone

@ObjectType()
@Entity({ name: "users" })
export class User extends CustomEntity {
  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column("text")
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastLogin?: Date;
}
