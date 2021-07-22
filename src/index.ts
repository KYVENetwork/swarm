import { Knex } from "knex";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { connect } from "./db/connect";
import { up } from "./db/initialize";
import router from "./router";

declare module "koa" {
  interface BaseContext {
    connection: Knex;
  }
}

(async () => {
  const app = new Koa();

  const connection = connect();
  await up(connection);
  app.context.connection = connection;

  app.use(bodyParser());
  app.use(router.routes());

  app.listen(4242);
})();
