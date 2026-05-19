import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { authApis, endpoint } from "../configs/Apis";

const Payment = () => {
  const location = useLocation();
  const { orderId, paymentMethod } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createPayment = async () => {
    if (!orderId || !paymentMethod) {
      setError("Thông tin thanh toán không hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      const response = await authApis().post(endpoint['create_payment'], {
        amount: 0,
        order: orderId,
        method: paymentMethod,
      });


      if (response.status === 201 && response.data.payment_url) {
        // Redirect sang cổng thanh toán
        window.location.href = response.data.payment_url;
      } else {
        setError("Không tạo được phiên thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createPayment();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Xử lý thanh toán</h2>
        {loading && <p>Đang kết nối tới cổng thanh toán...</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default Payment;