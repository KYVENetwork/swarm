import { Knex } from "knex";

export async function up(knex: Knex) {
  // await knex.schema.dropTableIfExists("contracts");

  return knex.schema
    .createTableIfNotExists("contracts", (table) => {
      table.string("id", 64).notNullable();
      table.bigInteger("height");
      table.string("hash");
      table.json("state");
      table.json("validity");
    })
    .createTableIfNotExists("peers", (table) => {
      table.string("ip").notNullable();
    });
}
