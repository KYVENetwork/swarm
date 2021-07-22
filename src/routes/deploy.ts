import Router from "@koa/router";
import { readContract } from "../utils/smartweave";

export const deployRoute = async (ctx: Router.RouterContext) => {
  const { contract } = ctx.request.body as { contract: string };

  if (contract) {
    const { state, validity } = await readContract(
      ctx.connection,
      contract,
      undefined,
      true
    );

    ctx.body = state;
  }
};
