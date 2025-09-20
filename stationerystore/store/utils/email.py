from django.conf import settings
from django.core.mail import EmailMultiAlternatives


def send_order_success_email(order):
    """
    Sends a styled email to the user when an order is successfully placed.
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = [order.user.email]
    subject = f"Đặt hàng thành công - Mã đơn hàng #{order.id}"

    order_status = {
        "PENDING": "Đã đặt hàng",
        "PAID": "Đã thanh toán",
        "SHIPPING": "Đang giao hàng",
        "DELIVERED": "Đã giao hàng",
        "CANCELED": "Đã huỷ",
    }.get(order.status, "Không xác định")

    html_content = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background: linear-gradient(90deg, #4f46e5, #3b82f6); padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">Open Stationery Store</h2>
                <p style="margin: 5px 0 0;">Xác nhận đơn hàng thành công</p>
            </div>

            <!-- Nội dung -->
            <div style="padding: 20px;">
                <p>Chào khách hàng <strong>{order.user.full_name}</strong>,</p>
                <p>Cảm ơn bạn đã đặt hàng tại <strong>Open Stationery Store</strong>! Chúng tôi vui mừng thông báo rằng đơn hàng của bạn đã được tiếp nhận thành công.</p>

                <h3 style="margin-top: 20px; color: #4f46e5;">Thông tin đơn hàng</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mã đơn hàng</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">#{order.id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Người nhận</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{order.name_customer}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Số điện thoại</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{order.number_phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Địa chỉ giao hàng</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{order.address}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tổng tiền</strong></td>
                       <td style="padding: 8px; border: 1px solid #ddd; color: red; font-weight: bold;">    {int(order.total_price):,} VND
</td>

                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phương thức thanh toán</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{order.get_payment_method_display()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Trạng thái</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd; color: #2563eb;">{order_status}</td>
                    </tr>
                </table>

                <p style="margin-top: 20px;">Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất và sẽ thông báo khi đơn hàng được giao.</p>
                <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng phản hồi email này hoặc liên hệ qua số hotline hỗ trợ khách hàng.</p>
            </div>

            <!-- Footer -->
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 14px; color: #555;">
                <p style="margin: 0;">Trân trọng,</p>
                <p style="margin: 0;"><strong>Đội ngũ Open Stationery Store</strong></p>
            </div>
        </div>
    </div>
    """

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


def send_reset_password_email(email, otp):
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = [email]
    subject = "Mã OTP đặt lại mật khẩu"
    html_content = f"""
                            <p>Chào bạn,</p>
                            <p>Mã OTP đặt lại mật khẩu của bạn là: <strong>{otp}</strong></p>
                            <p>Mã OTP này sẽ hết hạn sau 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                            <p>Nếu bạn không yêu cầu mã OTP này, vui lòng bỏ qua email này.</p>
                            <p>Trân trọng,</p>
                            <p>Đội ngũ cửa hàng văn phòng phẩm Open Stationery Store</p>
                            """

    msg = EmailMultiAlternatives(subject=subject, body=html_content, from_email=from_email, to=to_email)
    msg.attach_alternative(html_content, "text/html")
    msg.send()