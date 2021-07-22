import { knex, Knex } from "knex";

export const connect = (): Knex => {
  return knex({
    client: "sqlite3",
    connection: {
      filename: "db.sqlite",
    },
    useNullAsDefault: true,
  });
};
