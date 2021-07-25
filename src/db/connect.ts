import { knex, Knex } from "knex";

export const connect = (port: number): Knex => {
  return knex({
    client: "sqlite3",
    connection: {
      filename: `db-${port}.sqlite`,
    },
    useNullAsDefault: true,
  });
};
