import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="text-white bg-blue-900">

            {/* MAIN */}
            <div className="px-6 py-14 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold tracking-wide">
                            Open Stationery Store
                        </h3>

                        <p className="text-sm text-blue-100 leading-relaxed">
                            Cung cấp văn phòng phẩm chất lượng cao cho học tập và công việc,
                            tối ưu trải nghiệm mua sắm với giá cả hợp lý và dịch vụ nhanh chóng.
                        </p>

                        <div className="flex gap-4 pt-2">
                            {[
                                { icon: FaFacebookF, link: "#" },
                                { icon: FaInstagram, link: "#" },
                                { icon: FaTwitter, link: "#" },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={i}
                                        href={item.link}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition transform hover:scale-110"
                                    >
                                        <Icon className="text-white text-sm" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-white/20 pb-2">
                            Hỗ trợ
                        </h3>

                        <ul className="space-y-3 text-sm text-blue-100">
                            {[
                                { label: "Về chúng tôi", link: "/about" },
                                { label: "Câu hỏi thường gặp", link: "/faq" },
                                { label: "Chính sách bảo mật", link: "/policy" },
                                { label: "Điều khoản sử dụng", link: "/terms" },
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link
                                        to={item.link}
                                        className="hover:text-white transition flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 bg-white/50 rounded-full"></span>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-white/20 pb-2">
                            Liên hệ
                        </h3>

                        <ul className="space-y-4 text-sm text-blue-100">
                            <li className="flex items-center gap-3">
                                <FiMail />
                                <a href="mailto:tthau2004@gmail.com" className="hover:text-white">
                                    tthau2004@gmail.com
                                </a>
                            </li>

                            <li className="flex items-center gap-3">
                                <FiPhone />
                                <a href="tel:0123456789" className="hover:text-white">
                                    0123 456 789
                                </a>
                            </li>

                            <li className="flex items-start gap-3">
                                <FiMapPin className="mt-1" />
                                <span>123 Đường ABC, Quận 1, TP.HCM</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="border-t border-white/10 bg-blue-950">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-blue-200">

                    <p>
                        © {new Date().getFullYear()} Open Stationery Store. All rights reserved.
                    </p>

                    <div className="flex gap-4 mt-2 md:mt-0">
                        <Link to="/terms" className="hover:text-white">
                            Terms
                        </Link>
                        <Link to="/policy" className="hover:text-white">
                            Privacy
                        </Link>
                        <Link to="/support" className="hover:text-white">
                            Support
                        </Link>
                    </div>

                </div>
            </div>

        </footer>
    );
};

export default Footer;