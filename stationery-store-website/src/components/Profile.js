import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../configs/Context";
import { Badge, Button, Card, Col, Container, Form, Image, Nav, Row, Tab } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";


const Profile = () => {

    const [user, dispatch] = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const [time, setTime] = useState(15);

    const changeInfoUser = (e) => {
        e.preventDefault();
        // // dispatch({ type: "UPDATE_USER", payload: info });
    };

    console.log("User in Profile:", user);

    useEffect(() => {
        if (!user) {
            if (time <= 0) {
                nav("/login");
                return;
            }
            const timer = setTimeout(() => setTime(prev => prev - 1), 1000);
            return () => clearTimeout(timer); // cleanup
        }
    }, [time, user, nav]);
    return (
        <>
            {!user ? (
                <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
                    <Card className="p-4 text-center shadow-sm">
                        <h3 className="fw-bold text-danger mb-2">Bạn chưa đăng nhập</h3>
                        <p className="text-muted">Sẽ tự động chuyển trang sau <b>{time}</b> giây...</p>
                        <Button variant="primary" onClick={() => nav("/login")}>Đăng nhập ngay</Button>
                    </Card>
                </Container>
            ) : (
                <Container className="mt-5">
                    <Row className="justify-content-center">
                        <Col md={8} lg={6}>
                            <Card className="shadow border-0 rounded-4">
                                <Card.Body>
                                    {/* Avatar */}
                                    <div className="text-center mb-4">
                                        <Image
                                            src={user.avatar || "https://via.placeholder.com/150"}
                                            alt={user.full_name || "User"}
                                            roundedCircle
                                            style={{
                                                width: "140px",
                                                height: "140px",
                                                objectFit: "cover",
                                                border: "4px solid #0d6efd",
                                            }}
                                        />
                                        <h4 className="mt-3 fw-bold">{user.full_name}</h4>
                                        <p className="text-muted">@{user.username}</p>
                                        <Badge bg="info" className="text-white px-3 py-2 rounded-pill">
                                            {user.role === "customer" ? "Khách hàng" : user.role === "admin" ? "Quản trị viên" :
                                                user.role === "staff" ? "Nhân viên" : "Quản lý"}
                                        </Badge>
                                    </div>

                                    <Tab.Container defaultActiveKey="info">
                                        <Nav variant="tabs" className="justify-content-center mb-3">
                                            <Nav.Item>
                                                <Nav.Link eventKey="info">Thông tin cá nhân</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="password">Đổi mật khẩu</Nav.Link>
                                            </Nav.Item>
                                        </Nav>

                                        <Tab.Content>
                                            <Tab.Pane eventKey="info">
                                                <Form onSubmit={changeInfoUser}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Họ và tên</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="full_name"
                                                            value={user.full_name || ""}
                                                        // onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Email</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            name="email"
                                                            value={user.email || ""}
                                                        // onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Số điện thoại</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="number_phone"
                                                            value={user.number_phone || ""}
                                                        // onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Địa chỉ</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="address"
                                                            value={user.address || ""}
                                                        // onChange={handleChange}
                                                        />
                                                    </Form.Group>

                                                    <div className="text-center">
                                                        <Button type="submit" variant="primary" className="px-5 rounded-pill" disabled={loading}>
                                                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                                        </Button>
                                                    </div>
                                                </Form>
                                            </Tab.Pane>

                                            {/* Tab Đổi mật khẩu */}
                                            <Tab.Pane eventKey="password">
                                                <Form>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Mật khẩu hiện tại</Form.Label>
                                                        <Form.Control type="password" placeholder="Nhập mật khẩu hiện tại" />
                                                    </Form.Group>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Mật khẩu mới</Form.Label>
                                                        <Form.Control type="password" placeholder="Nhập mật khẩu mới" />
                                                    </Form.Group>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                                                        <Form.Control type="password" placeholder="Nhập lại mật khẩu mới" />
                                                    </Form.Group>

                                                    <div className="text-center">
                                                        <Button variant="warning" className="px-5 rounded-pill">Đổi mật khẩu</Button>
                                                    </div>
                                                </Form>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Tab.Container>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Link to="/loyalty">Điểm thành viên</Link>
                </Container>
            )}
        </>
    );
}

export default Profile;
