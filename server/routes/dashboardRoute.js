import express from "express";
import {
  getMyStats,
  getMyActiveContracts,
  getMyPendingActions,
  getMyTiHistory,
  getMyEndorsers,
  getEligibleGuarantors,
  getEligibleBrochures,
} from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All dashboard routes require a user to be logged in.
router.use(protect);

// Route to get the user's main statistics
router.get("/my-stats", getMyStats);

// Route to get a list of the user's active contracts
router.get("/my-active-contracts", getMyActiveContracts);

// Route to get a list of items requiring the user's action
router.get("/my-pending-actions", getMyPendingActions);

// Route to get the user's TrustIndex history
router.get("/ti-history", getMyTiHistory);

router.get("/my-endorsers", getMyEndorsers);

router.get("/eligible-guarantors", getEligibleGuarantors);

router.get("/eligible-brochures", getEligibleBrochures);

export default router;
