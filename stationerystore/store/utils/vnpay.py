import hashlib
from urllib.parse import urlencode

from django.conf import settings


def create_vnpay_url(request, order):
    """
    Creates a VNPAY payment URL for the given order.
    """
    vnpay_url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"

    vnp_params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': settings.VNPAY_TMNCODE,
        'vnp_Amount': order.total_amount * 100,
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': str(order.id),
        'vnp_OrderInfo': f"Thanh toan ma don hang #{order.id}",
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': request.build_absolute_uri('/payment/vnpay/return/'),
        'vnp_IpAddr': request.META.get('REMOTE_ADDR'),
        'vnp_CreateDate': order.created_at.strftime('%Y%m%d%H%M%S'),
    }

    vnp_query = urlencode(sorted(vnp_params.items()))

    # Create the secure hash
    secret_key = settings.VNPAY_SECRET_KEY
    secure_hash = hashlib.sha256((vnp_query + secret_key).encode('utf-8')).hexdigest().upper()

    vnp_query += f"&vnp_SecureHash={secure_hash}"

    return f"{vnpay_url}?{vnp_query}"
