import express from 'express'
import {
  createOrUpdateSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission
} from '../controllers/submission.controller.js'
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.route('/')
  .post(authenticate, createOrUpdateSubmission)
  .get(authenticate, getSubmissions)

router.route('/:submissionId')
  .get(authenticate, getSubmissionById)
  .patch(authenticate, authorizeAdmin, updateSubmission)
  .delete(authenticate, authorizeAdmin, deleteSubmission)

export default router
