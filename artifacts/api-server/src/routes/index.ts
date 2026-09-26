import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventBookerRouter from "./event-booker";

const router: IRouter = Router();
router.use(healthRouter);
router.use(eventBookerRouter);
export default router;
