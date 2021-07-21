import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .withSchema(process.env.DB_SCHEMA ?? "public")
    .dropTableIfExists("some_table")
    .createTable("some_table", (table) => {
      table.string("some_column");
    });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema
    .withSchema(process.env.DB_SCHEMA ?? "public")
    .dropTableIfExists("some_table");
}
