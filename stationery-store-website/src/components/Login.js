import { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import Apis, { authApis, endpoint } from "../configs/Apis";
import cookie from 'react-cookies';
import { MyUserContext } from "../configs/Context";
import { useNavigate } from "react-router-dom";


const Login = () => {

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [, dispatch] = useContext(MyUserContext);
  const [message, setMessage] = useState(null);
  const nav = useNavigate();

  const validated = () => {
    if (!user.username || user.username === "" || !user.password || user.password === "") {
      setMessage("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return false;
    }
    return true;
  }


  const handleLogin = async (e) => {
    e.preventDefault();
    if (validated()) {
      try {
        setLoading(true);
        let response = await Apis.post(endpoint['login'], {
          ...user,
          "client_id": "H9NEh1H8FbCa6g7LaUbQJwUJHrGx5mqkMbJB7wW7",
          "client_secret": "MLXdmCFbDWcf8d4i3uRheC6IUeJjPeFcjC59ztuLMDllTjbEiQl9gPbwt8dnZiOThix2AtlvbOHaEzsHDZG3WvkKZlxbHlTMv8QuLcBJS2VRzE4933FObB59zP4FBswD",
          "grant_type": "password",
        });
        cookie.save("token", response.data.access_token);

        let res = await authApis().get(endpoint['profile']);

        dispatch({
          type: "login",
          payload: res.data
        });

        nav("/");

      } catch (error) {
        console.error("Login failed:", error);
        setMessage("Đăng nhập không thành công. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.");

      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 10000); // 10 giây

      return () => clearTimeout(timer); // cleanup nếu message đổi trước 10 giây
    }
  }, [message]);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow-lg p-4">
            <Card.Body>
              <h3 className="text-center mb-4">Đăng nhập</h3>

              <Alert variant="danger" show={message !== null} onClose={() => setMessage(null)} dismissible>
                {message}
              </Alert>

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  {loading ? <><Spinner animation="border" size="sm" /> Đang đăng nhập...</> : "Đăng nhập"}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <a href="/forgot-password">Quên mật khẩu?</a>
              </div>
              <div className="text-center mt-2">
                Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;