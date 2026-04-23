import { Router, type IRouter } from "express";
import healthRouter from "./health";
import parseQuotesRouter from "./parse-quotes";
import saveQuoteRouter from "./save-quote";

const router: IRouter = Router();

router.use(healthRouter);
router.use(parseQuotesRouter);
router.use(saveQuoteRouter);

export default router;
