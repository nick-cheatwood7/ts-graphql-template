import { User } from "./entities/User";
import { __prod__ } from "./utils/constants";
import { MikroORM } from "@mikro-orm/core";
import { TSMigrationGenerator } from "@mikro-orm/migrations";
import path from "path";

export default {
  dbName: "graphql_test",
  type: "postgresql",
  debug: !__prod__,
  entities: [User],
  allowGlobalContext: true,
  migrations: {
    tableName: "mikro_orm_migrations", // name of database table with log of executed transactions
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pathTs: undefined, // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    glob: "!(*.d).{js,ts}", // how to match migration files (all .js and .ts files, but not .d.ts)
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: false, // save snapshot when creating new migrations
    emit: "ts", // migration generation mode
    generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
  },
} as Parameters<typeof MikroORM.init>[0];
