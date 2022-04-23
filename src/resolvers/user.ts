import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../utils/types";
import argon2 from "argon2";

@InputType()
class UserLoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

@InputType()
class UserRegisterInput extends UserLoginInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    const userId = req.session.userId;
    // User not logged in
    if (!userId) {
      return null;
    }
    const user = await em.findOne(User, { id: userId });
    return user;
  }

  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg("options") options: UserRegisterInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.email.length < 3) {
      return {
        errors: [
          {
            field: "email",
            message: "invalid email length",
          },
        ],
      };
    }
    if (options.firstName.length === 0) {
      return {
        errors: [
          {
            field: "firstName",
            message: "First name cannot be empty",
          },
        ],
      };
    }
    if (options.lastName.length === 0) {
      return {
        errors: [
          {
            field: "lastName",
            message: "Last name cannot be empty",
          },
        ],
      };
    }
    if (options.password.length < 4) {
      return {
        errors: [
          {
            field: "password",
            message: "Length must be greater than 3",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      firstName: options.firstName,
      lastName: options.lastName,
      email: options.email,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      // duplicate email error
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "an account with this email already exists",
            },
          ],
        };
      }
    }
    // Authenticate user
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg("options") options: UserLoginInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      email: options.email.toLowerCase(),
    });
    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "could not locate an account with that email",
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, options.password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid login",
          },
        ],
      };
    }
    // Authenticate user
    req.session.userId = user.id;
    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req }: MyContext) {
    const userId = req.session.userId;
    // User not logged in
    if (!userId) {
      return false;
    }
    req.session.destroy(() => {});
    return true;
  }

  @Query(() => User, { nullable: true })
  user(
    @Arg("id", () => String) id: string,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    return em.findOne(User, { id });
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Arg("id") id: string,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    try {
      await em.nativeDelete(User, { id });
      return true;
    } catch {
      return false;
    }
  }
}
