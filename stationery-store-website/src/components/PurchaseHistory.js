import { useContext } from "react";
import { Container } from "react-bootstrap";
import { MyUserContext } from "../configs/Context";
import { Link } from "react-router-dom";


const PurchaseHistory = () => {

    const [user,] = useContext(MyUserContext);

    const notUser = () => {
        return (
            (!user || user === null) && <>
                <h2>Bạn chưa đăng nhập</h2>
                <Link className="btn btn-primary" to="/login">Đăng nhập</Link>
            </>
        );
    }

    return (
        <>
            <Container>
                <h2>Lịch sử mua hàng</h2>
                {notUser()}
            </Container>
        </>
    );
}

export default PurchaseHistory;