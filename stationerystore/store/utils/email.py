from django.conf import settings
from django.core.mail import EmailMultiAlternatives


def send_order_success_email(order):
    """
    Sends an email to the user when an order is successfully placed.
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = [order.user.email]
    subject = f"Đặt hàng thành công - Mã đơn hàng #{order.id}"

    html_content = (f"""
                    <p>Chào khách hàng {order.user.full_name},</p>
                    <p>Cảm ơn bạn đã đặt hàng tại cửa hàng văn phòng phẩm Open Stationery Store!</p>
                    <p>Chúng tôi rất vui thông báo rằng đơn hàng của bạn đã được đặt thành công.</p>
                    <p>Thông tin đơn hàng:</p>
                    <ul>
                        <li><strong>Mã đơn hàng:</strong> {order.id}</li>
                        <li><strong>Trạng thái:</strong> {order.status}</li>
                    </ul>
                    <p>Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất và sẽ thông báo cho bạn khi đơn hàng được giao.</p>
                    <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng của mình, vui lòng liên hệ với chúng tôi qua email này hoặc gọi đến số điện thoại hỗ trợ khách hàng của chúng tôi.</p>
                    <p>Chúng tôi xin chân thành cảm ơn bạn đã tin tưởng và lựa chọn cửa hàng của chúng tôi.</p>
                    <p>Trân trọng,</p>
                    <p>Đội ngũ cửa hàng văn phòng phẩm Open Stationery Store</p>
                    """)

    msg = EmailMultiAlternatives(subject=subject, body=html_content, from_email=from_email, to=to_email)
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def send_otp_via_email(email, otp):
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = [email]
    subject = "Mã OTP xác thực tài khoản"
    html_content = f"""
                        <p>Chào bạn,</p>
                        <p>Mã OTP của bạn là: <strong>{otp}</strong></p>
                        <p>Mã OTP này sẽ hết hạn sau 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                        <p>Nếu bạn không yêu cầu mã OTP này, vui lòng bỏ qua email này.</p>
                        <p>Trân trọng,</p>
                        <p>Đội ngũ cửa hàng văn phòng phẩm Open Stationery Store</p>
                        """

    msg = EmailMultiAlternatives(subject=subject, body=html_content, from_email=from_email, to=to_email)
    msg.attach_alternative(html_content, "text/html")
    msg.send()
