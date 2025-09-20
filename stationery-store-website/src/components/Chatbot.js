import { useState, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import Apis, { endpoint } from "../configs/Apis";

const ChatBot = ({ mode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!question.trim()) return;

        const userMsg = { sender: "user", text: question };
        setMessages((prev) => [...prev, userMsg]);
        setQuestion("");
        setLoading(true);

        try {
            let res;
            if (mode === "customer") {
                res = await Apis.post(endpoint["chatbot_customer"], { question });
            } else {
                res = await Apis.post(endpoint["chatbot_staff"], { question });
            }

            const botMsg = { sender: "bot", text: res.data.answer || "Lỗi khi nhận phản hồi." };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            setMessages((prev) => [...prev, { sender: "bot", text: "Lỗi server!" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Nút mở chat */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}

            {/* Hộp chat */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 h-96 bg-white border rounded-xl shadow-lg flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-blue-600 text-white px-3 py-2 rounded-t-xl">
                        <span className="font-semibold">
                            {mode === "customer" ? "Hỗ trợ khách hàng" : "AI Chat"}
                        </span>
                        <button onClick={() => setIsOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nội dung chat */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`p-2 rounded-lg max-w-[75%] ${msg.sender === "user"
                                    ? "ml-auto bg-blue-500 text-white"
                                    : "mr-auto bg-gray-200"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {loading && (
                            <div className="mr-auto bg-gray-200 px-3 py-2 rounded-lg text-gray-700 text-sm flex gap-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.2s]"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.4s]"></span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Ô nhập */}
                    <div className="p-2 border-t flex">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            className="flex-1 px-2 py-1 border rounded-l-md text-sm focus:outline-none"
                            placeholder="Nhập câu hỏi..."
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700"
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;