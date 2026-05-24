import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import photographersRouter from "./photographers";
import bookingsRouter from "./bookings";
import paymentsRouter from "./payments";
import reviewsRouter from "./reviews";
import chatRouter from "./chat";
import couponsRouter from "./coupons";
import adminRouter from "./admin";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(photographersRouter);
router.use(bookingsRouter);
router.use(paymentsRouter);
router.use(reviewsRouter);
router.use(chatRouter);
router.use(couponsRouter);
router.use(adminRouter);
router.use(aiRouter);

export default router;
