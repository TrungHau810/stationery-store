import { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authApis, endpoint } from "../configs/Apis";
import { CheckCircle, XCircle } from "lucide-react";
import { MyUserContext } from "../configs/Contexts";

const PaymentCallback = () => {
    const [, dispatch] = useContext(MyUserContext);
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("Đang xác nhận...");
    const [success, setSuccess] = useState(false);
    const nav = useNavigate();

    let orderId = searchParams.get("partnerCode")
        ? searchParams.get("orderId")
        : searchParams.get("vnp_TxnRef");

    if (orderId) orderId = orderId.split("-")[0];

    const verifyPayment = async () => {

        const res = await authApis().get(endpoint['profile']);
        dispatch({ type: "login", payload: res.data });

        if (!orderId) {
            setStatus("Thông tin thanh toán không hợp lệ.");
            return;
        }

        const method = searchParams.get("partnerCode") ? "momo" : "vnpay";
        const resultCode = searchParams.get("resultCode") || searchParams.get("vnp_ResponseCode");

        console.log("Verifying payment for order:", orderId, "method:", method, "resultCode:", resultCode);

        try {
            const url = `${endpoint['verify_payment']}?order_id=${orderId}&method=${method}&result_code=${resultCode}`;
            const response = await authApis().get(url);
            console.log("Payment verification response:", response.data);
            setSuccess(response.data.success);
            setStatus(response.data.success ? "Thanh toán thành công!" : "Thanh toán thất bại!");
        } catch (err) {
            setStatus("Xác nhận thanh toán thất bại. Vui lòng thử lại.");
        }
    };

    useEffect(() => {
        verifyPayment();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className={`bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center 
                            ${success ? 'border-green-500' : 'border-red-500'} border-2`}>
                <div className="flex justify-center mb-4 animate-pulse">
                    {success ?
                        <CheckCircle className="text-green-500 w-16 h-16" /> :
                        <XCircle className="text-red-500 w-16 h-16" />
                    }
                </div>
                <h2 className="text-2xl font-bold mb-2">{status}</h2>
                <p className="text-gray-600 mb-6">
                    {success
                        ? "Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý."
                        : "Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ."}
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => nav("/")}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        Về trang chủ
                    </button>
                    {success && (
                        <button
                            onClick={() => nav(`/purchase/orders/${orderId}`)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                            Xem đơn hàng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;