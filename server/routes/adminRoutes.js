import express from 'express';
import { verifyAdmin } from '../middlewares/auth';
import {
  getAllUsers,
  getAllListings,
  getAllBookings,
  getAdminStats
} from '../controllers/adminController';

const router = express.Router();

// Admin protected routes
router.use(verifyAdmin);

router.get('/users', getAllUsers);
router.get('/listings', getAllListings);
router.get('/bookings', getAllBookings);
router.get('/stats', getAdminStats);

export default router;