import express from "express";
import {
  getMyLoanRequests,
  acceptLoanRequest,
  getMyBrochures,
} from "../controllers/lenderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
// All routes below are restricted to users currently in the 'LENDER' role.
router.use(restrictTo("LENDER"));

// GET /api/v1/lender/brochures - Get all brochures for logged-in lender
router.get("/brochures", getMyBrochures);

// GET /api/v1/lender/requests
router.get("/requests", getMyLoanRequests);

// POST /api/v1/lender/requests/:id/accept
router.post("/requests/:id/accept", acceptLoanRequest);

export default router;
