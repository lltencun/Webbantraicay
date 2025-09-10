import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { 
    addProductType, 
    getAllProductTypes, 
    updateProductType, 
    deleteProductType 
} from '../controllers/productTypeControllers.js';

const router = express.Router();

// Routes cho product type
router.post('/add', adminAuth, addProductType);
router.get('/all', getAllProductTypes);
router.put('/update/:id', adminAuth, updateProductType);
router.delete('/delete/:id', adminAuth, deleteProductType);

export default router;
