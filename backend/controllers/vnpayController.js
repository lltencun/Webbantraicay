import querystring from 'querystring';
import crypto from 'crypto';
import { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } from '../config/vnpay.js';
import orderModel from '../models/orderModel.js';

// Hàm sắp xếp object theo key
function sortObject(obj) {
    let sorted = {};
    let str = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export const createPaymentUrl = async (req, res) => {
    try {
        const { orderId, amount, orderDescription, language } = req.body;

        // Kiểm tra order có tồn tại và chưa thanh toán
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        if (order.payment) {
            return res.status(400).json({
                success: false,
                message: "Order already paid"
            });
        }

        let date = new Date();
        let createDate = format_date(date);
        let expireDate = format_date(new Date(date.getTime() + 15 * 60000)); // Thêm 15 phút
        
        // Convert from USD to VND (1 USD = 23,000 VND approximately)
        const amountInVND = Math.round(amount * 23000);
        
        let vnpParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnp_TmnCode,
            vnp_Locale: language || 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderDescription || 'Thanh toan don hang ' + orderId,
            vnp_OrderType: 'billpayment',
            vnp_Amount: amountInVND * 100,
            vnp_ReturnUrl: vnp_ReturnUrl,
            vnp_IpAddr: req.ip || '127.0.0.1',
            vnp_CreateDate: createDate,
            vnp_BankCode: 'NCB'
        };

        // Sắp xếp các tham số theo alphabet
        const sortedParams = sortObject(vnpParams);
        
        // Tạo chuỗi ký tự cần ký
        const signData = querystring.stringify(sortedParams, { encode: false });
        
        // Tạo chữ ký
        const hmac = crypto.createHmac("sha512", vnp_HashSecret);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
        
        // Thêm chữ ký vào params
        vnpParams['vnp_SecureHash'] = signed;

        // Tạo URL thanh toán
        const paymentUrl = vnp_Url + "?" + querystring.stringify(vnpParams, { encode: true });

        // Trả về URL thanh toán
        res.json({
            success: true,
            paymentUrl: paymentUrl
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment URL'
        });
    }
};

// Format date theo yêu cầu của VNPAY
function format_date(date) {
    return date.getFullYear().toString() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
}

// Format mã giao dịch theo yêu cầu của VNPAY
function format_order_id(orderId, dateString) {
    // Lấy 8 ký tự đầu của orderId và thêm thời gian
    let shortOrderId = orderId.toString().substring(0, 8);
    return `${shortOrderId}_${dateString}`;
}

export const vnpayReturn = async (req, res) => {
    try {
        const vnpParams = req.query;
        const secureHash = vnpParams['vnp_SecureHash'];

        // Xóa chữ ký khỏi params để tạo chuỗi ký mới
        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];

        // Sắp xếp params
        const sortedParams = sortObject(vnpParams);
        
        // Tạo chuỗi ký tự cần verify
        const signData = querystring.stringify(sortedParams, { encode: false });
        
        // Tạo chữ ký mới
        const hmac = crypto.createHmac("sha512", vnp_HashSecret);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

        // So sánh chữ ký
        if (secureHash === signed) {
            // Thanh toán thành công
            const orderId = vnpParams['vnp_TxnRef'].split("_")[0];
            
            if (vnpParams['vnp_ResponseCode'] === '00' && vnpParams['vnp_TransactionStatus'] === '00') {
                // Cập nhật trạng thái thanh toán trong DB
                await orderModel.findByIdAndUpdate(orderId, {
                    payment: true,
                    paymentMethod: 'VNPAY',
                    paymentStatus: 'completed'
                });

                return res.status(200).json({
                    success: true,
                    message: 'Payment successful',
                    orderId: orderId
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Payment failed',
                    orderId: orderId
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('VNPAY return error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Payment verification failed'
        });
    }
};
