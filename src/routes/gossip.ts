import Router from "@koa/router";
import { readContract } from "../utils/smartweave";

export const gossipRoute = async (ctx: Router.RouterContext) => {
  const { type, contract, height } = ctx.request.body as {
    type: "query";
    contract: string;
    height: number;
  };

  if (type === "query") {
    const { hash } = await readContract(ctx.connection, contract, height);
    ctx.body = hash;
  }

  // TODO: Other types of gossiping.
};
