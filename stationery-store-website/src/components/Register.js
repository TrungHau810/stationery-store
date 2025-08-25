import { type } from "@testing-library/user-event/dist/type";
import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import Apis, { endpoint } from "../configs/Apis";


const Register = () => {

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const info_register = [{
        label: "Tên đăng nhập",
        name: "username",
        type: "text",
        required: true
    }, {
        label: "Mật khẩu",
        name: "password",
        type: "password",
        required: true
    }, {
        label: "Xác nhận mật khẩu",
        name: "confirm_password",
        type: "password",
        required: true
    }, {
        label: "Họ và tên",
        name: "full_name",
        type: "text",
        required: true
    }, {
        label: "Số điện thoại",
        name: "number_phone",
        type: "text",
        required: true
    }, {
        label: "Email",
        name: "email",
        type: "email",
        required: true
    }, {
        label: "Địa chỉ",
        name: "address",
        type: "text",
        required: true
    }];

    const validated = () => {
        if (user.password !== user.confirm_password) {
            setMessage("Mật khẩu không khớp");
            return false;
        }
        if (user.password.length < 6) {
            setMessage("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(user.email)) {
            setMessage("Email không hợp lệ");
            return false;
        }
        if (!/^\d{10,11}$/.test(user.number_phone)) {
            setMessage("Số điện thoại không hợp lệ");
            return false;
        }
        return true;
    }



    const handleRegister = async (e) => {
        e.preventDefault();
        if (validated()) {
            try {
                setLoading(true);
                setMessage(null);
                const formData = new FormData();
                for (let key in user) {
                    if (key !== "confirm_password") {
                        formData.append(key, user[key]);
                    }
                }

                formData.append("role", "customer");

                let response = await Apis.post(endpoint['register'], formData);
                if (response.status === 201) {
                    setSuccessMessage("Đăng ký thành công! Vui lòng đăng nhập.");
                    setUser({});
                } else {
                    setMessage("Đăng ký thất bại! Vui lòng thử lại.");
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <Container className="mt-4">
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <h3 className="text-center mb-3">Đăng ký tài khoản</h3>
                        {message && <Alert variant="danger">{message}</Alert>}
                        {successMessage && <Alert variant="success">{successMessage}</Alert>}
                        <Form onSubmit={handleRegister}>
                            {info_register.map(item => (
                                <Form.Group className="mb-3" key={item.label}>
                                    <Form.Label>{item.label}</Form.Label>
                                    <Form.Control
                                        type={item.type}
                                        name={item.name}
                                        required={item.required}
                                        value={user[item.name] || ""}
                                        onChange={(e) => setUser({ ...user, [item.name]: e.target.value })}
                                    />
                                </Form.Group>
                            ))}
                            <Form.Group className="mb-3">
                                <Form.Label>Avatar</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="avatar"
                                    required
                                    onChange={(e) => setUser({ ...user, avatar: e.target.files[0] })}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <><Spinner animation="border" size="sm" /> Đang đăng ký...</> : "Đăng ký"}
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Register;