import express from 'express';
import { createPaymentUrl, vnpayReturn } from '../controllers/vnpayController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/create-payment', auth, createPaymentUrl);
router.get('/vnpay-return', vnpayReturn);

export default router;
