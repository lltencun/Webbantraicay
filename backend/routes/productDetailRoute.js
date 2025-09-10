import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import * as productDetailController from '../controllers/productDetailControllers.js';

const router = express.Router();

router.post('/add', adminAuth, productDetailController.addProductDetail);
router.get('/all', adminAuth, productDetailController.getAllProductDetails);
router.get('/active', productDetailController.getActiveProductDetails); // Route mới cho frontend
router.get('/product/:product_id', productDetailController.getProductDetailByProductId);
router.put('/update/:id', adminAuth, productDetailController.updateProductDetail);
router.delete('/delete/:id', adminAuth, productDetailController.deleteProductDetail);

export default router;
