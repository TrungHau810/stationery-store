import json
import uuid
import requests
import hmac
import hashlib
import logging

from django.http import JsonResponse
from store.models import Payment, Order

logger = logging.getLogger(__name__)

# Thông tin test MoMo (production thay bằng thật khi deploy)
PARTNER_CODE = "MOMO"
ACCESS_KEY = "F8BBA842ECF85"
SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create"


def create_momo_url(order, redirect_url, ipn_url):
    """
    Tạo URL thanh toán MoMo và lưu Payment pending.
    """
    order_info = f"Thanh toán đơn hàng #{order.id} qua MoMo"
    amount = str(int(order.total_price))
    order_id = f"{order.id}-{uuid.uuid4()}"
    request_id = str(uuid.uuid4())
    request_type = "captureWallet"
    extra_data = ""

    raw_signature = (
        f"accessKey={ACCESS_KEY}&amount={amount}&extraData={extra_data}&ipnUrl={ipn_url}"
        f"&orderId={order_id}&orderInfo={order_info}&partnerCode={PARTNER_CODE}&redirectUrl={redirect_url}"
        f"&requestId={request_id}&requestType={request_type}"
    )
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        raw_signature.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    data = {
        'partnerCode': PARTNER_CODE,
        'partnerName': "Test",
        'storeId': "MomoTestStore",
        'requestId': request_id,
        'amount': amount,
        'orderId': order_id,
        'orderInfo': order_info,
        'redirectUrl': redirect_url,
        'ipnUrl': ipn_url,
        'lang': "vi",
        'extraData': extra_data,
        'requestType': request_type,
        'signature': signature
    }

    try:
        # Xoá các payment pending cũ của order này (nếu có)
        Payment.objects.filter(order=order, status=Payment.Status.PENDING).delete()
        # Lưu Payment pending
        Payment.objects.create(order=order,
                               method=Payment.Method.MOMO,
                               amount=order.total_price,
                               status=Payment.Status.PENDING)

        response = requests.post(
            ENDPOINT,
            data=json.dumps(data),
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        result = response.json()
        logger.info(f"MoMo create payment response: {result}")

        return result.get('payUrl')

    except requests.RequestException as e:
        logger.error(f"MoMo request failed: {str(e)}")
        return None


def momo_return(request):
    data = request.GET.dict()
    logger.info(f"MoMo callback data: {data}")

    # Tính signature server
    raw_signature = (
        f"accessKey={ACCESS_KEY}&amount={data.get('amount')}&extraData={data.get('extraData')}"
        f"&message={data.get('message')}&orderId={data.get('orderId')}&orderInfo={data.get('orderInfo')}"
        f"&orderType={data.get('orderType')}&partnerCode={data.get('partnerCode')}"
        f"&payType={data.get('payType')}&requestId={data.get('requestId')}&responseTime={data.get('responseTime')}"
        f"&resultCode={data.get('resultCode')}&transId={data.get('transId')}"
    )
    expected_signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        raw_signature.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    if expected_signature != data.get("signature"):
        logger.warning("MoMo signature invalid!")
        return JsonResponse({"success": False, "message": "Signature không hợp lệ"}, status=400)

    order_id = int(data.get('orderId').split('-')[0])
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        logger.warning(f"Order {order_id} not found!")
        return JsonResponse({"success": False, "message": "Không tìm thấy đơn hàng"}, status=404)

    # Lấy Payment pending gần nhất
    payment = Payment.objects.filter(order=order, method=Payment.Method.MOMO, status=Payment.Status.PENDING).last()

    if data.get("resultCode") == "0":
        if payment:
            payment.status = Payment.Status.SUCCESS
            payment.save()
        order.status = Order.Status.PAID
        order.save()
        logger.info(f"Payment MoMo success for order {order.id}")
        return JsonResponse({"success": True, "order_id": order_id, "message": "Thanh toán thành công"})
    else:
        if payment:
            payment.status = Payment.Status.FAIL
            payment.save()
        order.status = Order.Status.PENDING
        order.save()
        logger.info(f"Payment MoMo failed for order {order.id}")
        return JsonResponse({"success": False, "order_id": order_id, "message": "Thanh toán thất bại"}, status=400)
