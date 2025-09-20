import hashlib
import hmac
import logging
from datetime import datetime, timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.http import JsonResponse

from store.models import Payment, Order

logger = logging.getLogger(__name__)


def create_vnpay_url(request, order):
    """
    Creates a VNPAY payment URL for the given order.
    """
    vnpay_url = settings.VNPAY_URL

    vnp_params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': settings.VNPAY_TMNCODE,
        'vnp_Amount': int(order.total_price * 100),  # Nhân 100 để loại bỏ thập phân
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': str(order.id) + f"-{int(datetime.now().timestamp())}",  # Mã đơn hàng kèm timestamp để tránh trùng
        'vnp_OrderInfo': f"Thanh toan ma don hang #{order.id}",
        'vnp_OrderType': 'other',  # Loại hàng hóa, có thể tùy chỉnh
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
        'vnp_IpAddr': request.META.get('REMOTE_ADDR', '127.0.0.1'),  # Lấy IP từ request
        'vnp_CreateDate': order.created_date.strftime('%Y%m%d%H%M%S'),
        'vnp_ExpireDate': (datetime.now() + timedelta(minutes=15)).strftime('%Y%m%d%H%M%S'),
    }

    sorted_params = sorted(vnp_params.items())
    vnp_query = urlencode(sorted_params)

    # Create the secure hash
    secret_key = settings.VNPAY_HASH_SECRET_KEY.encode('utf-8')
    secure_hash = hmac.new(secret_key, vnp_query.encode('utf-8'), hashlib.sha512).hexdigest()

    vnp_query += f"&vnp_SecureHash={secure_hash}"

    return f"{vnpay_url}?{vnp_query}"


def payment_ipn(request):
    """
    Callback VNPay (Return/IPN), trả JSON cho SPA
    """
    input_data = request.GET.dict()
    vnp_secure_hash = input_data.pop('vnp_SecureHash', None)

    if not input_data:
        return JsonResponse({'RspCode': '99', 'Message': 'Invalid request'}, status=400)

    # Tính hash server
    hash_data = '&'.join([f"{k}={v}" for k, v in sorted(input_data.items())])
    secure_hash = hmac.new(
        settings.VNPAY_HASH_SECRET_KEY.encode('utf-8'),
        hash_data.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()

    # Kiểm tra chữ ký
    if secure_hash != vnp_secure_hash:
        logger.warning(f"VNPay signature invalid: {input_data}")
        return JsonResponse({'RspCode': '97', 'Message': 'Invalid Signature'}, status=400)

    # Lấy order
    order_id = input_data.get('vnp_TxnRef')
    amount = int(input_data.get('vnp_Amount', 0))
    vnp_ResponseCode = input_data.get('vnp_ResponseCode')

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return JsonResponse({'RspCode': '01', 'Message': 'Order not found'}, status=404)

    expected_amount = int(order.total_price * 100)
    if amount != expected_amount:
        return JsonResponse({'RspCode': '04', 'Message': 'Invalid amount'}, status=400)

    # Lấy payment mới nhất
    payment = Payment.objects.filter(order=order, method=Payment.Method.VNPAY).last()
    if not payment:
        return JsonResponse({'RspCode': '01', 'Message': 'Payment not found'}, status=404)

    if payment.status == Payment.Status.SUCCESS:
        return JsonResponse({'RspCode': '02', 'Message': 'Order already confirmed'}, status=200)

    # Cập nhật trạng thái
    if vnp_ResponseCode == '00':
        payment.status = Payment.Status.SUCCESS
        order.status = Order.Status.PAID
        payment.save()
        order.save()
        return JsonResponse({'RspCode': '00', 'Message': 'Success'}, status=200)
    else:
        payment.status = Payment.Status.FAIL
        order.status = Order.Status.PENDING
        payment.save()
        order.save()
        return JsonResponse({'RspCode': '01', 'Message': 'Payment failed'}, status=400)
