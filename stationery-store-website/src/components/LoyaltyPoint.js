import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../configs/Context";
import Apis, { authApis, endpoint } from "../configs/Apis";
import { Badge, Container, Table } from "react-bootstrap";
import LoyaltyChart from "./layout/LoyaltyChart";


const LoyaltyPoint = () => {

    const [user,] = useContext(MyUserContext);
    const [loyalty, setLoyalty] = useState({});
    const [loyaltyHistory, setLoyaltyHistory] = useState([]);


    const loadLoyaltPoint = async () => {

        let response = await authApis().get(endpoint['loyalty']);
        setLoyalty(response.data);
    }

    const loadLoyaltPointHistory = async () => {
        let response = await authApis().get(endpoint['loyalty_history']);
        setLoyaltyHistory(response.data);
    }

    useEffect(() => {
        loadLoyaltPoint();
        loadLoyaltPointHistory();
    }, [])

    return (
        <>
            <h1>Điểm thành viên</h1>
            <h2>Điểm hiện tại: {loyalty.total_point}</h2>

            <Container>
                <LoyaltyChart history={loyaltyHistory} />
            </Container>

            <Container className="mt-4">
                <h2 className="mb-3">Lịch sử tích điểm</h2>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Đơn hàng</th>
                            <th>Loại</th>
                            <th>Số điểm</th>
                            <th>Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loyaltyHistory.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">Chưa có lịch sử</td>
                            </tr>
                        ) : (
                            loyaltyHistory.map(h => (
                                <tr key={h.id}>
                                    <td>{h.id}</td>
                                    <td>{h.order ?? "-"}</td>
                                    <td>
                                        {h.type === "EARN" ? (
                                            <Badge bg="success">Tích điểm</Badge>
                                        ) : (
                                            <Badge bg="danger">Tiêu điểm</Badge>
                                        )}
                                    </td>
                                    <td>{h.point}</td>
                                    <td>{new Date(h.created_date).toLocaleString("vi-VN")}</td>
                                </tr>
                            ))
                        )}
                    </tbody>


                </Table>
            </Container>
        </>
    );
}

export default LoyaltyPoint;