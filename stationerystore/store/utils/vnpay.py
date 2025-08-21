import hashlib
import hmac
from datetime import datetime, timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.http import JsonResponse


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
        'vnp_TxnRef': str(order.id),
        'vnp_OrderInfo': f"Thanh toan ma don hang #{order.id}",
        'vnp_OrderType': 'other',  # Loại hàng hóa, có thể tùy chỉnh
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
        'vnp_IpAddr': request.META.get('REMOTE_ADDR', '127.0.0.1'),  # Lấy IP từ request
        'vnp_CreateDate': order.created_date.strftime('%Y%m%d%H%M%S'),
        'vnp_ExpireDate': (datetime.now() + timedelta(minutes=15)).strftime('%Y%m%d%H%M%S'),
    }

    print("DEBUG RETURN URL từ settings:", settings.VNPAY_RETURN_URL)
    print("DEBUG RETURN URL gửi sang VNPay:", vnp_params["vnp_ReturnUrl"])

    sorted_params = sorted(vnp_params.items())
    vnp_query = urlencode(sorted_params)

    # Create the secure hash
    secret_key = settings.VNPAY_HASH_SECRET_KEY.encode('utf-8')
    secure_hash = hmac.new(secret_key, vnp_query.encode('utf-8'), hashlib.sha512).hexdigest()

    vnp_query += f"&vnp_SecureHash={secure_hash}"

    return f"{vnpay_url}?{vnp_query}"


def payment_ipn(request):
    input_data = request.GET.dict()
    vnp_secure_hash = input_data.pop('vnp_SecureHash', None)

    if not input_data:
        return JsonResponse({'RspCode': '99', 'Message': 'Invalid request'})

    # Sắp xếp params để tính hash
    sorted_params = sorted(input_data.items())
    query_string = urlencode(sorted_params)

    # Tính hash server
    secret_key = settings.VNPAY_HASH_SECRET_KEY.encode('utf-8')
    secure_hash = hmac.new(secret_key, query_string.encode('utf-8'), hashlib.sha512).hexdigest()

    if secure_hash != vnp_secure_hash:
        return JsonResponse({'RspCode': '97', 'Message': 'Invalid Signature'})

    # Lấy thông tin giao dịch
    order_id = input_data.get('vnp_TxnRef')
    amount = input_data.get('vnp_Amount')
    vnp_ResponseCode = input_data.get('vnp_ResponseCode')

    # TODO: kiểm tra order trong DB và update trạng thái
    first_time_update = True  # ví dụ: check chưa update trước đó
    valid_amount = True  # ví dụ: so sánh số tiền trong DB

    if not valid_amount:
        return JsonResponse({'RspCode': '04', 'Message': 'Invalid amount'})

    if not first_time_update:
        return JsonResponse({'RspCode': '02', 'Message': 'Order Already Updated'})

    if vnp_ResponseCode == '00':
        # Thành công
        return JsonResponse({'RspCode': '00', 'Message': 'Thanh toán thành công'})
        # update Order.status = PAID
    else:
        # Thất bại
        return JsonResponse({'RspCode': '01', 'Message': 'Thanh toán thất bại'})