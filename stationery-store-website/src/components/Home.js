import { use, useEffect, useState } from "react";
import Apis, { endpoint } from "../configs/Apis";
import { Button, Card, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Voucher from "./layout/Voucher";


const Home = () => {

    const nav = useNavigate();
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadProducts = async () => {
        let url = endpoint['product'];
        if (category) {
            url += `?category=${category}`;
            console.log("URL: ", url);
        }
        try {
            let response = await Apis.get(url);
            console.log(response);
            setProducts(response.data.results);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, [category]);

    return (
        <>
            <Row xs={1} md={3} className="g-4">
                {loading && <Spinner animation="border" variant="primary" role="status" className="m-auto" title="Đang tải sản phẩm" />}
                {products.map(product =>
                    <Card key={product.id} style={{ width: '18rem' }}>
                        <Card.Img variant="top" src={product.image} />
                        <Card.Body>
                            <Card.Title>{product.name}</Card.Title>
                            <Button variant="primary" onClick={() => nav(`/product/${product.id}`)}>Xem chi tiết</Button>
                            <Button variant="danger">Mua ngay</Button>
                        </Card.Body>
                    </Card>
                )}
            </Row>

            <Container className="mt-4">
                <h5 className="mb-3">Voucher của bạn</h5>
                <Voucher />
                <Voucher />
                <Voucher />
                <Voucher />
                <Voucher />
                <Voucher />
            </Container>
        </>
    );
}

export default Home;