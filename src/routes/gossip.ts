import Router from "@koa/router";
import { readContract } from "../utils/smartweave";

export const gossipRoute = async (ctx: Router.RouterContext) => {
  const {
    type,
    contract,
    height,
    hash: compareHash,
  } = ctx.request.body as {
    type: "consensus";
    contract: string;
    height: number;
    hash: string;
  };

  if (type === "consensus") {
    const { hash } = await readContract(ctx.connection, contract, height);

    // TODO: Consensus algorithm.
  }

  // TODO: Other types of gossiping.
};
