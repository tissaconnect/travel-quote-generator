import { Router, type IRouter } from "express";
import healthRouter from "./health";
import parseQuotesRouter from "./parse-quotes";
import saveQuoteRouter from "./save-quote";
import subscriptionStatusRouter from "./subscription-status";

const router: IRouter = Router();

router.use(healthRouter);
router.use(parseQuotesRouter);
router.use(saveQuoteRouter);
router.use(subscriptionStatusRouter);

export default router;
