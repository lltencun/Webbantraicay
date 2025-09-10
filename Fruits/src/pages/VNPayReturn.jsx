import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../config/config';
import { toast } from 'react-toastify';

const VNPayReturn = () => {
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy các tham số từ URL
        const params = new URLSearchParams(location.search);
        const responseCode = params.get('vnp_ResponseCode');
        const transactionStatus = params.get('vnp_TransactionStatus');
        const message = params.get('vnp_Message');
        const orderId = params.get('vnp_TxnRef');

        // Nếu có lỗi "Dữ liệu gửi sang không đúng định dạng"
        if (responseCode === '03') {
          setStatus('failed');
          toast.error('Invalid data format. Please try again.');
          setTimeout(() => {
            // Quay lại trang giỏ hàng sau 2 giây
            navigate('/cart');
          }, 2000);
          return;
        }

        // Gọi API để verify payment nếu không phải lỗi định dạng
        const response = await axios.get(
          `${backendUrl}/api/vnpay/vnpay-return${location.search}`
        );

        if (responseCode === '00' && transactionStatus === '00' && response.data.success) {
          setStatus('success');
          toast.success('Payment successful!');
          // Chờ 2 giây rồi chuyển đến trang orders
          setTimeout(() => {
            navigate('/orders');
          }, 2000);
        } else {
          setStatus('failed');
          let errorMessage = 'Payment failed';
          if (!responseCode || !transactionStatus) {
            errorMessage = 'Invalid payment response';
          } else if (responseCode !== '00') {
            errorMessage = 'Transaction was not successful';
          } else if (!response.data.success) {
            errorMessage = response.data.message || 'Payment verification failed';
          }
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        toast.error(error.response?.data?.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Payment {status === 'processing' ? 'Processing' : status === 'success' ? 'Successful' : 'Failed'}
        </h2>
        
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Processing your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center text-green-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>Payment successful! Redirecting to orders...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center text-red-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p>Payment failed. Please try again.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Return to Home
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Return to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VNPayReturn;
