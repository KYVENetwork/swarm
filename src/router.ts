import Router from "@koa/router";
import { deployRoute } from "./routes/deploy";
import { gossipRoute } from "./routes/gossip";
import { infoRoute } from "./routes/info";

const router = new Router();

router.get("/info", infoRoute);
router.post("/deploy", deployRoute);
router.post("/gossip", gossipRoute);
// TODO: /graphql

export default router;
