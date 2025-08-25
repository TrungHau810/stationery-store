import { useContext, useEffect } from "react";
import { MyCartContext, MyUserContext } from "../configs/Context";
import { useNavigate } from "react-router-dom";


const Cart = () => {
    const [cart, setCart] = useContext(MyCartContext);
    const [user,] = useContext(MyUserContext);
    const nav = useNavigate();


    const notLogin = () => {
        { user === null && nav("/login") }
    }

    useEffect(() => {
        notLogin();
    }, [user]);

    return (
        <>
            <div>
                <h1>Giỏ hàng</h1>
                <p>Total Items: {cart}</p>
            </div>
        </>

    );
}

export default Cart;
