// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

export const vnp_TmnCode = process.env.VNP_TMN_CODE || "NCB";
export const vnp_HashSecret = process.env.VNP_HASH_SECRET || "CDGZQMLTEPIXQBSLAXXUHELTWFTXEUAP";
export const vnp_Url = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
export const vnp_ReturnUrl = process.env.VNP_RETURN_URL || "http://localhost:5173/vnpay-return";
