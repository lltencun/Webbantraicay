import express from 'express'
import { placeOrder, allOrders,updateAllPayments, userOrders, updateStatus, updatePaymentStatus, checkProductInOrders } from "../controllers/orderControllers.js";
import { adminAuth } from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
const orderRouter = express.Router()

//admin routes
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.post('/payment/all', adminAuth, updateAllPayments)
orderRouter.post('/payment', adminAuth, updatePaymentStatus)

//user routes
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.get('/check-product/:productId', authUser, checkProductInOrders)

export default orderRouter