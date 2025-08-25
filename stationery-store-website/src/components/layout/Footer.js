import { Container, Row, Col, Nav } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 py-5">
      <Container >
        <Row>
          {/* Thông tin cửa hàng */}
          <Col md={4} className="mb-4">
            <h5 className="mb-3">Cửa hàng Văn phòng phẩm - TH Store</h5>
            <p>
              Cung cấp các sản phẩm văn phòng phẩm chất lượng cao, từ bút, giấy đến dụng cụ học tập.
            </p>
              <p><strong>Địa chỉ:</strong> Phường Long Bình, Thành phố Thủ Đức, Thành phố Hồ Chí Minh</p>
              <p><strong>Email:</strong> tthau2004@gmail.com</p>
              <p><strong>Điện thoại:</strong> (028) 1234-5678</p>
          </Col>

          {/* Liên kết nhanh */}
          <Col md={4} className="mb-4">
            <h5 className="mb-3">Liên kết nhanh</h5>
            <Nav className="flex-column">
              <Nav.Link href="/" className="text-white p-0 mb-2">Trang chủ</Nav.Link>
              <Nav.Link href="/products" className="text-white p-0 mb-2">Sản phẩm</Nav.Link>
              <Nav.Link href="/about" className="text-white p-0 mb-2">Giới thiệu</Nav.Link>
              <Nav.Link href="/contact" className="text-white p-0 mb-2">Liên hệ</Nav.Link>
            </Nav>
          </Col>

          {/* Thông tin bổ sung */}
          <Col md={4} className="mb-4">
            <h5 className="mb-3">Hỗ trợ khách hàng</h5>
            <Nav className="flex-column">
              <Nav.Link href="/faq" className="text-white p-0 mb-2">Câu hỏi thường gặp</Nav.Link>
              <Nav.Link href="/shipping" className="text-white p-0 mb-2">Chính sách vận chuyển</Nav.Link>
              <Nav.Link href="/returns" className="text-white p-0 mb-2">Chính sách đổi trả</Nav.Link>
            </Nav>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} TH Store. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;