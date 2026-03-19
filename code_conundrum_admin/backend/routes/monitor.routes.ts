import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import {
  banTeamByAdmin,
  fetchMonitoringLogs,
  fetchMonitoringSummary,
  logFullscreenExit,
  logTabSwitch,
  penalizeTeamByAdmin,
} from "../controllers/monitoring.controller.js";

const router = express.Router();

router.post("/monitor/fullscreen-exit", authenticate, logFullscreenExit);
router.post("/monitor/tab-switch", authenticate, logTabSwitch);

router.get("/admin/monitoring", authenticate, authorizeAdmin, fetchMonitoringSummary);
router.get("/admin/monitoring/logs", authenticate, authorizeAdmin, fetchMonitoringLogs);
router.post("/admin/ban-team", authenticate, authorizeAdmin, banTeamByAdmin);
router.post("/admin/penalize-team", authenticate, authorizeAdmin, penalizeTeamByAdmin);

export default router;
