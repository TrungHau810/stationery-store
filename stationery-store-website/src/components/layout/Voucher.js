import { Button, Card } from "react-bootstrap";


const Voucher = () => {
    return (
        <>
            <div className="voucher-card d-flex mt-3 mb-2">
                {/* Phần trái */}
                <div className="voucher-left text-white d-flex flex-column justify-content-center align-items-center">
                    <div className="voucher-logo">S</div>
                    <div className="fw-bold">Không có</div>
                </div>

                {/* Phần phải */}
                <Card className="voucher-right flex-grow-1">
                    <Card.Body>
                        <h6 className="fw-bold">10%</h6>
                        <p className="mb-2 small">
                            Giảm tối đa 10% <br />
                            Đơn Tối Thiểu 200k
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                            <Button variant="danger" size="sm">
                                Lưu
                            </Button>
                            <a href="#" className="text-primary small">
                                Điều Kiện
                            </a>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </>



    )
}

export default Voucher;