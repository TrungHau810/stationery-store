import { FaHeart, FaHistory } from "react-icons/fa";
import {
    FiAward,
    FiHeart,
    FiMail,
    FiMapPin,
    FiPhone,
    FiShoppingBag,
    FiTruck,
    FiUsers,
} from "react-icons/fi";

const AboutMe = () => {
    const features = [
        {
            icon: <FiShoppingBag size={28} />,
            title: "Sản phẩm chất lượng",
            description:
                "Chúng tôi cung cấp nhiều sản phẩm chất lượng với giá cả hợp lý.",
        },

        {
            icon: <FiTruck size={28} />,
            title: "Giao hàng nhanh",
            description:
                "Hỗ trợ giao hàng nhanh chóng và an toàn trên toàn quốc.",
        },

        {
            icon: <FiUsers size={28} />,
            title: "Hỗ trợ khách hàng",
            description:
                "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn.",
        },

        {
            icon: <FiAward size={28} />,
            title: "Uy tín hàng đầu",
            description:
                "Cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng.",
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* HERO */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">

                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                            Về Chúng Tôi
                        </h1>

                        <p className="text-lg text-blue-100 leading-relaxed mb-8">
                            Chúng tôi mang đến trải nghiệm mua sắm hiện đại,
                            tiện lợi và đáng tin cậy dành cho mọi khách hàng.
                        </p>

                        <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-semibold hover:bg-blue-50 transition">
                            Khám phá ngay
                        </button>
                    </div>

                    <div className="flex justify-center">
                       <FaHeart size={200} className="text-red-500" />
                    </div>

                </div>
            </div>

            {/* ABOUT CONTENT */}
            <div className="max-w-6xl mx-auto px-6 py-16">

                <div className="grid lg:grid-cols-2 gap-14 items-center">

                    <div>
                       <FaHistory size={200} className="text-blue-500" />
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-5">
                            Câu chuyện của chúng tôi
                        </h2>

                        <p className="text-gray-600 leading-relaxed mb-5">
                            Chúng tôi được thành lập với mong muốn mang đến
                            nền tảng mua sắm trực tuyến đơn giản, hiện đại và
                            tiện lợi cho khách hàng.
                        </p>

                        <p className="text-gray-600 leading-relaxed mb-5">
                            Với đội ngũ trẻ trung, nhiệt huyết và luôn đổi mới,
                            chúng tôi không ngừng cải thiện chất lượng dịch vụ
                            để mang lại trải nghiệm tốt nhất.
                        </p>

                        <div className="flex items-center gap-3 text-blue-600 font-semibold">
                            <FiHeart />
                            Khách hàng luôn là ưu tiên hàng đầu
                        </div>
                    </div>

                </div>

                {/* FEATURES */}
                <div className="mt-20">

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">
                            Tại sao chọn chúng tôi?
                        </h2>

                        <p className="text-gray-500">
                            Những giá trị giúp chúng tôi tạo nên sự khác biệt
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        {features.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                                    {item.icon}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    {item.title}
                                </h3>

                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}

                    </div>
                </div>

                {/* CONTACT */}
                <div className="mt-20 bg-white rounded-3xl shadow-lg p-10">

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">
                            Liên hệ với chúng tôi
                        </h2>

                        <p className="text-gray-500">
                            Nếu bạn cần hỗ trợ, hãy liên hệ ngay với chúng tôi
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">

                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <FiPhone size={24} />
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-2">
                                Điện thoại
                            </h3>

                            <p className="text-gray-500">
                                0123 456 789
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <FiMail size={24} />
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-2">
                                Email
                            </h3>

                            <p className="text-gray-500">
                                <a href="mailto:tthau2004@gmail.com" className="hover:underline">
                                    tthau2004@gmail.com
                                </a>
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <FiMapPin size={24} />
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-2">
                                Địa chỉ
                            </h3>

                            <p className="text-gray-500">
                                TP. Hồ Chí Minh, Việt Nam
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutMe;