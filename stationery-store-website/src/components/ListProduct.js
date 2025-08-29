import { useParams } from "react-router-dom";


const ListProduct = () => {

    const {kw} = useParams();

    return (
        <div>
            Danh sách sản phẩm: {kw}
        </div>
    );
}

export default ListProduct;