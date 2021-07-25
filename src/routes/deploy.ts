import Router from "@koa/router";
import { query } from "../utils/query";
import { readContract } from "../utils/smartweave";

export const deployRoute = async (ctx: Router.RouterContext) => {
  const { contract } = ctx.request.body as { contract: string };

  if (contract) {
    ctx.body = { status: 201, message: "Recieved" };

    readContract(ctx.connection, contract).then(({ height, hash }) => {
      query(ctx.connection, contract, height, hash);
    });
  }
};
