import { Router, type IRouter } from "express";
import healthRouter from "./health";
import parseQuotesRouter from "./parse-quotes";
import saveQuoteRouter from "./save-quote";
import subscriptionStatusRouter from "./subscription-status";
import testSubscriberRouter from "./test-subscriber";

const router: IRouter = Router();

router.use(healthRouter);
router.use(parseQuotesRouter);
router.use(saveQuoteRouter);
router.use(subscriptionStatusRouter);
router.use(testSubscriberRouter);

export default router;
