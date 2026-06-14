import express from 'express';
import { getAITripPlan, getAICostAnalysis } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/plan - Generate a full AI trip plan with schedule and cost analysis
router.post('/plan', getAITripPlan);

// POST /api/ai/cost-analysis - Just get cost analysis
router.post('/cost-analysis', getAICostAnalysis);

export default router;