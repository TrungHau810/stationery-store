import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="text-white shadow-inner">
            {/* Nội dung chính gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-extrabold tracking-wide mb-2">TH Stationery</h3>
                        <p className="text-sm text-blue-100 leading-relaxed">
                            Chúng tôi mang đến văn phòng phẩm chất lượng cao, phục vụ học tập và công việc.
                            Sản phẩm tốt nhất, giá cả hợp lý.
                        </p>
                        <div className="flex space-x-4 mt-2">
                            <a href="#" className="hover:text-white transition-colors duration-300"><FaFacebookF /></a>
                            <a href="#" className="hover:text-white transition-colors duration-300"><FaInstagram /></a>
                            <a href="#" className="hover:text-white transition-colors duration-300"><FaTwitter /></a>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-2">Hỗ trợ</h3>
                        <ul className="space-y-2 text-sm text-blue-100">
                            <li><a href="/about" className="hover:text-white transition-colors duration-300">Về chúng tôi</a></li>
                            <li><a href="/faq" className="hover:text-white transition-colors duration-300">Câu hỏi thường gặp</a></li>
                            <li><a href="/policy" className="hover:text-white transition-colors duration-300">Chính sách bảo mật</a></li>
                            <li><a href="/terms" className="hover:text-white transition-colors duration-300">Điều khoản sử dụng</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold mb-2">Liên hệ</h3>
                        <ul className="space-y-2 text-sm text-blue-100">
                            <li>Email: <a href="mailto:tthau2004@gmail.com" className="hover:text-white transition-colors duration-300">tthau2004@gmail.com</a></li>
                            <li>Điện thoại: <a href="tel:0123456789" className="hover:text-white transition-colors duration-300">0123 456 789</a></li>
                            <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bản quyền riêng */}
            <div className="bg-blue-800 text-center py-4 text-sm text-white">
                © {new Date().getFullYear()} TH Stationery. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
