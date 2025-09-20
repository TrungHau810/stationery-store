const cartReducer = (state, action) => {
    switch(action.type){
        case "update":
            return action.payload; // set tổng số lượng
        case "increment":
            return state + action.payload; // tăng số lượng
        case "clear":
            return 0; // xóa giỏ hàng
        default:
            return state;
    }
};

export default cartReducer;