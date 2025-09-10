import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import * as originController from '../controllers/originControllers.js';

const router = express.Router();

router.post('/add', adminAuth, originController.addOrigin);
router.get('/all', originController.getAllOrigins);
router.get('/:id', originController.getOriginById);
router.put('/update/:id', adminAuth, originController.updateOrigin);
router.delete('/delete/:id', adminAuth, originController.deleteOrigin);

export default router;
