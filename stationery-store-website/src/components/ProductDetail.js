import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import { Badge, Button, Card, Carousel, Col, Row } from "react-bootstrap";


const ProductDetail = () => {

    const { id } = useParams();
    const [product, setProduct] = useState([]);

    const loadProductDetail = async (id) => {
        let response = await Apis.get(endpoint['product_detail'](id));
        console.log(response.data);
        setProduct(response.data);
    }

    useEffect(() => {
        loadProductDetail(id);
    }, [id]);

    return (
        <>
            <div className="container mt-4">
                <Row>
                    {/* Ảnh sản phẩm */}
                    <Col md={6} className="mb-4">
                        <Card className="shadow-sm border-0">
                            <Carousel variant="dark">
                                {/* Ảnh chính */}
                                <Carousel.Item>
                                    <img
                                        className="d-block w-100"
                                        src={product.image}
                                        alt={product.name}
                                        style={{ maxHeight: "450px", objectFit: "contain" }}
                                    />
                                </Carousel.Item>

                                {/* Ảnh phụ */}
                                {product.images &&
                                    product.images.map((img) => (
                                        <Carousel.Item key={img.id}>
                                            <img
                                                className="d-block w-100"
                                                src={img.link}
                                                alt={`Ảnh ${img.id}`}
                                                style={{ maxHeight: "450px", objectFit: "contain" }}
                                            />
                                        </Carousel.Item>
                                    ))}
                            </Carousel>
                        </Card>
                    </Col>

                    {/* Thông tin sản phẩm */}
                    <Col md={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <Card.Title className="mb-3 fw-bold fs-3">{product.name}</Card.Title>

                                <h4 className="mb-3">
                                    <Badge bg="danger" className="fs-5 px-3 py-2">
                                        {Number(product.price).toLocaleString()} ₫
                                    </Badge>
                                </h4>

                                <Card.Text>
                                    <strong>Số lượng còn:</strong>{" "}
                                    <span className={product.quantity > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                                        {product.quantity > 0 ? product.quantity : "Hết hàng"}
                                    </span>
                                </Card.Text>

                                <hr />

                                {/* description từ CKEditor có HTML */}
                                <div
                                    className="mb-4"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                ></div>

                                <div className="d-flex gap-3">
                                    <Button variant="warning" className="flex-grow-1">
                                        🛒 Thêm vào giỏ
                                    </Button>
                                    <Button variant="success" className="flex-grow-1">
                                        💳 Mua ngay
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default ProductDetail;