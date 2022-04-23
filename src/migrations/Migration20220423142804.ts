import { Migration } from '@mikro-orm/migrations';

export class Migration20220423142804 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "users" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "password" text not null);');
    this.addSql('alter table "users" add constraint "users_email_unique" unique ("email");');
    this.addSql('alter table "users" add constraint "users_pkey" primary key ("id");');

    this.addSql('drop table if exists "user" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table "user" ("id" varchar not null default null, "created_at" timestamptz not null default null, "updated_at" timestamptz not null default null, "first_name" varchar not null default null, "last_name" varchar not null default null, "email" varchar not null default null, "password" varchar not null default null);');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("id");');

    this.addSql('drop table if exists "users" cascade;');
  }

}
