import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Header from './components/layout/Header';
import Login from './components/Login';
import { useEffect, useReducer } from 'react';
import MyUserReducer from './reducers/MyUserReducer';
import { MyCartContext, MyUserContext } from './configs/Contexts';
import Cart from './components/Cart';
import 'sweetalert2/dist/sweetalert2.min.css';
import Profile from './components/Profile';
import ProductDetail from './components/ProductDetail';
import Purchase from './components/Purchase';
import OrderDetail from './components/OrderDetail';
import LoyaltyPoint from './components/LoyaltyPoint';
import CartReducer from './reducers/CartReducer';
import Register from './components/Register';
import Footer from './components/layout/Footer';
import OrderList from './components/staff/OrderList';
import ReceivingProducts from './components/staff/ReceivingProducts';
import ReceiptList from './components/staff/ReceiptList.js';
import HomeStaff from './components/staff/HomeStaff.js';
import ProductPending from './components/manager/ProductPending.js';
import UserManage from './components/manager/UserManage.js';
import Payment from './components/Payment.js';
import ProductList from './components/ProductList.js';
import VoucherList from './components/VoucherList.js';
import RevenueDashboard from './components/staff/RevenueDashboard.js';
import PendingOrder from './components/staff/PendingOrder.js';
import UpdateOrder from './components/UpdateOrder.js';
import ResetPassword from './components/ResetPassword.js';
import PaymentCallback from './components/PaymentResult.js';
import AddProduct from './components/staff/AddProduct.js';
import VoucherDetail from './components/VoucherDetail.js';
import NotFound from './components/NotFound.js';
import { authApis, endpoint } from './configs/Apis.js';
import cookie from "react-cookies";
import { Toaster } from 'react-hot-toast';
import AboutMe from './components/AboutMe.js';

function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [cart, dispatchCart] = useReducer(CartReducer, 0);

  const loadUserFromCookie = () => {
    const token = cookie.load("token");
    if (token) {
      let res = authApis().get(endpoint["profile"]);
      res.then((response) => {
        dispatch({ type: "login", payload: response.data });
      });
    }
  };

  useEffect(() => {
    loadUserFromCookie();
  }, []);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <MyCartContext.Provider value={[cart, dispatchCart]}>
        <BrowserRouter>
          <Header />
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='/products' element={<ProductList />} />
            <Route path='/product/:id' element={<ProductDetail />} />

            <Route path='/about' element={<AboutMe />} />

            {/* Customer routes */}
            {(user?.role === "customer" || !user) && (
              <>
                <Route path='/vouchers' element={<VoucherList />} />
                <Route path='/vouchers/:id' element={<VoucherDetail />} />
                {/* <Route path='/products' element={<ListProduct />} /> */}
                <Route path='/cart' element={<Cart />} />
                <Route path='/purchase' element={<Purchase />} />
                <Route path='/purchase/orders/:id' element={<OrderDetail />} />
                <Route path='/loyalty-point' element={<LoyaltyPoint />} />
                <Route path='/payment' element={<Payment />} />
                <Route path='/payment/callback' element={<PaymentCallback />} />
              </>
            )}

            {/* Staff routes */}
            {user?.role === "staff" && (
              <>
                <Route path='/staff/orders/pending' element={<PendingOrder />} />
                <Route path='/staff/orders/pending/:id' element={<UpdateOrder />} />
                <Route path='/staff/home' element={<HomeStaff />} />
                <Route path='/staff/orders' element={<OrderList />} />
                <Route path='/staff/revenue' element={<RevenueDashboard />} />
                <Route path='/staff/receipts' element={<ReceiptList />} />
                <Route path='/staff/receipts/new' element={<ReceivingProducts />} />
                {/* Thêm các route staff ở đây */}
              </>
            )}

            {/* Manager routes */}
            {user?.role === "manager" && (
              <>
                {/* <Route path='/manager-dashboard' element={<ManagerDashboard />} /> */}
                <Route path='/manager/orders/pending' element={<PendingOrder />} />
                <Route path='/manager/orders/pending/:id' element={<UpdateOrder />} />
                <Route path='/manager/home' element={<HomeStaff />} />
                <Route path='/manager/orders' element={<OrderList />} />
                <Route path='/manager/revenue' element={<RevenueDashboard />} />
                <Route path='/manager/receipts' element={<ReceiptList />} />
                <Route path='/manager/receipts/new' element={<ReceivingProducts />} />
                <Route path='/manager/products/pending' element={<ProductPending />} />
                <Route path='/manager/users' element={<UserManage />} />
                <Route path='/manager/receipts/new' element={<ReceivingProducts />} />
                {/* Thêm các route manager ở đây */}
              </>
            )}

            {(user?.role === "staff" || user?.role === "manager") && (
              <Route path='/products/add' element={<AddProduct />} />
            )}
            <Route path='*' element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </MyCartContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;
