import { useEffect, useState } from "react";
import { authApis, endpoint } from "../../../configs/Apis";
import * as XLSX from "xlsx";

const ReceiptDetail = ({ receipt, showModal }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReceiptDetail = async (id) => {
        try {
            setLoading(true);
            const response = await authApis().get(endpoint["goods_receipt_detail"](id));
            setDetails(response.data); // API trả về mảng detail
        } catch (error) {
            console.error("Error fetching receipt detail:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (receipt?.id) {
            fetchReceiptDetail(receipt.id);
        }
    }, [receipt]);

    // Tính tổng tiền và tổng số lượng
    const total = details.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
    );

    const totalQuantity = details.reduce((sum, item) => sum + item.quantity, 0);

    // Xuất Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws_data = [];

        // Tiêu đề phiếu nhập
        ws_data.push([`Phiếu nhập hàng #${receipt?.id}`]);
        ws_data.push([`Người nhập: ${receipt?.user?.full_name}`]);
        ws_data.push([`Mã nhân viên: #${receipt?.user?.id}`]);
        ws_data.push([`Nhà cung cấp: ${receipt?.supplier?.name}`]);
        ws_data.push([`Mã nhà cung cấp: #${receipt?.supplier?.id}`]);
        ws_data.push([`Ngày tạo: ${new Date(receipt?.created_date).toLocaleString("vi-VN")}`]);
        ws_data.push([]); // dòng trống

        // Header cột
        ws_data.push(["Mã sản phẩm", "Tên sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"]);

        // Dữ liệu sản phẩm
        details.forEach(item => {
            ws_data.push([
                item.product.id,
                item.product.name,
                item.quantity,
                Number(item.product.price),
                item.quantity * Number(item.product.price)
            ]);
        });

        // Dòng tổng cộng
        ws_data.push([]);
        ws_data.push([
            "",
            "Tổng số lượng:",
            totalQuantity,
            "Tổng tiền:",
            total
        ]);

        // Chuyển mảng dữ liệu thành sheet
        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // Định dạng cột rộng
        ws["!cols"] = [
            { wpx: 100 },
            { wpx: 250 },
            { wpx: 100 },
            { wpx: 120 },
            { wpx: 120 },
        ];

        // Style header
        const headerRow = 6; // header nằm ở dòng thứ 7 (index 6)
        for (let C = 0; C < 5; ++C) {
            const cell_address = XLSX.utils.encode_cell({ r: headerRow, c: C });
            if (!ws[cell_address]) continue;
            ws[cell_address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F81BD" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
            };
        }

        // Format số tiền không hiện .00
        for (let R = 7; R < ws_data.length - 2; ++R) {
            const priceCell = XLSX.utils.encode_cell({ r: R, c: 3 }); // cột Đơn giá
            const totalCell = XLSX.utils.encode_cell({ r: R, c: 4 }); // cột Thành tiền
            if (ws[priceCell]) ws[priceCell].z = "#,##0₫";
            if (ws[totalCell]) ws[totalCell].z = "#,##0₫";
        }

        // Dòng tổng
        const totalRow = ws_data.length - 1;
        const totalCell = XLSX.utils.encode_cell({ r: totalRow, c: 4 }); // cột Thành tiền
        if (ws[totalCell]) ws[totalCell].z = "#,##0₫";

        XLSX.utils.book_append_sheet(wb, ws, `Phiếu nhập hàng #${receipt?.id}`);
        XLSX.writeFile(wb, `Phieu_nhap_hang_${receipt?.id}.xlsx`);
    };

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showModal]);


    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Chi tiết phiếu nhập #{receipt?.id}
            </h2>

            <div className="space-y-2 mb-6">
                <p><span className="font-semibold">Nhà cung cấp:</span> {receipt?.supplier?.name}</p>
                <p><span className="font-semibold">Ngày tạo:</span> {new Date(receipt?.created_date).toLocaleString("vi-VN")}</p>
                <p><span className="font-semibold">Người tạo:</span> {receipt?.user?.full_name}</p>
                <p><span className="font-semibold">Tổng cộng:</span> {total.toLocaleString("vi-VN")} đ</p>
            </div>

            {/* Danh sách sản phẩm */}
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Sản phẩm nhập</h3>
            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <div className="overflow-x-auto mb-4">
                    <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left border">Hình ảnh</th>
                                <th className="px-4 py-2 text-left border">Mã sản phẩm</th>
                                <th className="px-4 py-2 text-left border">Tên sản phẩm</th>
                                <th className="px-4 py-2 text-center border">Số lượng</th>
                                <th className="px-4 py-2 text-right border">Đơn giá</th>
                                <th className="px-4 py-2 text-right border">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border text-center">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="h-12 w-auto mx-auto rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-2 border">#{item.product.id}</td>
                                    <td className="px-4 py-2 border">{item.product.name}</td>
                                    <td className="px-4 py-2 border text-center">{item.quantity}</td>
                                    <td className="px-4 py-2 border text-right">{Number(item.product.price).toLocaleString("vi-VN")} đ</td>
                                    <td className="px-4 py-2 border text-right font-medium">{(item.quantity * Number(item.product.price)).toLocaleString("vi-VN")} đ</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="px-4 py-2 text-right border font-semibold">Tổng số lượng:</td>
                                <td className="px-4 py-2 text-center border font-semibold">{totalQuantity}</td>
                                <td className="px-4 py-2 text-right border font-semibold">Tổng tiền:</td>
                                <td className="px-4 py-2 text-right border font-semibold">{total.toLocaleString("vi-VN")} đ</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            <button
                onClick={exportToExcel}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Xuất Excel
            </button>
        </div>
    );
};

export default ReceiptDetail;