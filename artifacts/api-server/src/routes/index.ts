import { Router, type IRouter } from "express";
import healthRouter from "./health";
import parseQuotesRouter from "./parse-quotes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(parseQuotesRouter);

export default router;
