import { useContext, useEffect, useState } from "react";
import { Badge, Button, Container, Image, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Apis, { endpoint } from "../../configs/Apis";
import { Link } from "react-router-dom";
import { MyCartContext, MyUserContext } from "../../configs/Context";

const Header = () => {

    const [categories, setCategories] = useState([]);
    const [user, dispatch] = useContext(MyUserContext);
    const [cart, setCart] = useContext(MyCartContext);

    const loadCategories = async () => {
        let response = await Apis.get(endpoint['category']);
        setCategories(response.data);
    }

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <>
            <Navbar expand="lg" bg="light" className="shadow-sm sticky-top">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4">TH Store</Navbar.Brand>

                    <Navbar.Toggle aria-controls="main-navbar" />
                    <Navbar.Collapse id="main-navbar">
                        {/* Menu chính */}
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                            <Nav.Link as={Link} to="/products">Sản phẩm</Nav.Link>
                            <NavDropdown title="Danh mục" id="nav-categories">
                                {categories.map((category) => (
                                    <NavDropdown.Item
                                        as={Link}
                                        key={category.id}
                                        to={`?category=${category.id}`}
                                    >
                                        {category.name}
                                    </NavDropdown.Item>
                                ))}
                            </NavDropdown>
                        </Nav>

                        {/* Giỏ hàng */}
                        <Nav className="me-3">
                            <Nav.Link as={Link} to="/cart" className="position-relative">
                                <i className="fas fa-shopping-cart fs-5"></i>
                                {cart > 0 && (
                                    <Badge
                                        pill
                                        bg="danger"
                                        className="position-absolute top-0 start-100 translate-middle"
                                    >
                                        {cart}
                                    </Badge>
                                )}
                            </Nav.Link>
                        </Nav>

                        {/* User info */}
                        {user ? (
                            <Nav>
                                <NavDropdown
                                    title={
                                        <span className="d-flex align-items-center">
                                            <Image
                                                src={user.avatar}
                                                roundedCircle
                                                width={40}
                                                height={40}
                                                className="me-2 border"
                                            />
                                            <span>{user.full_name}</span>
                                        </span>
                                    }
                                    id="user-dropdown"
                                    align="end"
                                >
                                    <NavDropdown.Item as={Link} to="/profile">
                                        Thông tin cá nhân
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item
                                        onClick={() => dispatch({ type: "logout" })}
                                        className="text-danger"
                                    >
                                        Đăng xuất
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        ) : (
                            <div>
                                <Button as={Link} to="/login" variant="outline-primary" className="me-2">
                                    Đăng nhập
                                </Button>
                                <Button as={Link} to="/register" variant="primary">
                                    Đăng ký
                                </Button>
                            </div>
                        )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default Header;