import json
import uuid
import requests
import hmac
import hashlib

from django.http import JsonResponse

from store.models import Payment, Order


def create_momo_url(order, redirect_url, ipn_url):
    endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
    partnerCode = "MOMO"
    accessKey = "F8BBA842ECF85"
    secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
    orderInfo = f"Thanh toán đơn hàng #{order.id} qua MoMo"
    amount = str(int(order.total_price))
    orderId = f"{order.id}-{uuid.uuid4()}"
    requestId = str(uuid.uuid4())
    requestType = "captureWallet"
    extraData = ""

    rawSignature = (
        f"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipn_url}"
        f"&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirect_url}"
        f"&requestId={requestId}&requestType={requestType}"
    )
    h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
    signature = h.hexdigest()

    data = {
        'partnerCode': partnerCode,
        'partnerName': "Test",
        'storeId': "MomoTestStore",
        'requestId': requestId,
        'amount': amount,
        'orderId': orderId,
        'orderInfo': orderInfo,
        'redirectUrl': redirect_url,
        'ipnUrl': ipn_url,
        'lang': "vi",
        'extraData': extraData,
        'requestType': requestType,
        'signature': signature
    }
    response = requests.post(endpoint, data=json.dumps(data), headers={'Content-Type': 'application/json'})
    result = response.json()
    return result.get('payUrl', None)


def momo_ipn(request):
    data = json.loads(request.body)
    momo_order_id = data.get("orderId")
    result_code = data.get("resultCode")
    trans_id = data.get("transId")

    try:
        payment = Payment.objects.get(momo_order_id=momo_order_id)
        if result_code == 0:
            payment.status = Payment.Status.SUCCESS
            payment.order.status = Order.Status.PAID
            payment.order.save()
        else:
            payment.status = Payment.Status.FAIL
        payment.transaction_id = trans_id
        payment.save()
    except Payment.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Payment not found"}, status=404)

    return JsonResponse({"status": "ok"})
