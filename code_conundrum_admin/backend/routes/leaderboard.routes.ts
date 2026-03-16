import express, { Router } from 'express'
import {
  addScore,
  fetchLeaderboard,
  clearCache
} from '../controllers/leaderboard.controller.js'
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js'

const router: Router = express.Router()

router.post('/', authenticate, authorizeAdmin, addScore)
router.get('/:round', authenticate, authorizeAdmin, fetchLeaderboard)
router.post('/invalidate', authenticate, authorizeAdmin, clearCache)

export default router