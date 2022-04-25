import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entities/User";
import { BaseResponse, MyContext } from "../utils/types";
import argon2 from "argon2";
import { isAuth } from "../middleware/isAuth";

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
class UserResponse extends BaseResponse {
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async me(@Ctx() { req }: MyContext) {
    const userId = req.session.userId;
    // User not logged in
    if (!userId) {
      return null;
    }
    const user = await User.findOneBy({ id: userId });
    return user;
  }

  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg("options") options: UserRegisterInput,
    @Ctx() { req }: MyContext
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
    const user = User.create({
      firstName: options.firstName,
      lastName: options.lastName,
      email: options.email,
      password: hashedPassword,
    });
    try {
      await user.save();
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOneBy({
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
  @UseMiddleware(isAuth)
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
  async user(@Arg("id", () => String) id: string): Promise<User | null> {
    return await User.findOneBy({ id });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUser(@Arg("id") id: string): Promise<Boolean> {
    try {
      await User.delete({ id });
      return true;
    } catch {
      return false;
    }
  }
}
