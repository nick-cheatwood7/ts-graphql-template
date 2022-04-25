import { DataSource } from "typeorm";
import { Author } from "./entities/Author";
import { Book } from "./entities/Book";
import { Collection } from "./entities/Collection";
import { User } from "./entities/User";
import { __prod__ } from "./utils/constants";

const AppDataSource = new DataSource({
  type: "postgres",
  port: 5432,
  database: "graphql_dev",
  synchronize: !__prod__,
  logging: !__prod__ && ["schema", "error"],
  entities: [User, Book, Author, Collection],
  migrations: ["./migrations/**/*"],
});

export default AppDataSource;
