import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Header from './components/layout/Header';
import Login from './components/Login';
import { useReducer } from 'react';
import MyUserReducer from './reducers/MyUserReducer';
import { MyCartContext, MyUserContext, SearchProvider } from './configs/Contexts';
import Cart from './components/Cart';
import 'sweetalert2/dist/sweetalert2.min.css';
import Profile from './components/Profile';
import ProductDetail from './components/ProductDetail';
import Purchase from './components/Purchase';
import OrderDetail from './components/OrderDetail';
import LoyaltyPoint from './components/LoyaltyPoint';
import CartReducer from './reducers/CartReducer';
// import ListProduct from './components/ListProduct';
import Register from './components/Register';
import Footer from './components/layout/Footer';
import OrderList from './components/staff/OrderList';
import RevenueStore from './components/staff/RevenueStore';
import ReceivingProducts from './components/staff/ReceivingProducts';
import ReceiptList from './components/staff/ReceiptList.js';
import HomeStaff from './components/staff/HomeStaff.js';


function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [cart, dispatchCart] = useReducer(CartReducer, 0);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <MyCartContext.Provider value={[cart, dispatchCart]}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/profile' element={<Profile />} />

            {/* Customer routes */}
            {(user?.role === "customer" || !user) && (
              <>
                <Route path='/product/:id' element={<ProductDetail />} />
                {/* <Route path='/products' element={<ListProduct />} /> */}
                <Route path='/cart' element={<Cart />} />
                <Route path='/purchase' element={<Purchase />} />
                <Route path='/purchase/order/:id' element={<OrderDetail />} />
                <Route path='/loyalty-point' element={<LoyaltyPoint />} />
              </>
            )}

            {/* Staff routes */}
            {user?.role === "staff" && (
              <>
                <Route path='/staff/home' element={<HomeStaff />} />
                {/* <Route path='/staff-dashboard' element={<StaffDashboard />} /> */}
                <Route path='/staff/orders' element={<OrderList />} />
                <Route path='/staff/revenue' element={<RevenueStore />} />
                <Route path='/staff/receipts' element={<ReceiptList />} />
                <Route path='/staff/receipts/new' element={<ReceivingProducts />} />
                {/* Thêm các route staff ở đây */}
              </>
            )}

            {/* Manager routes */}
            {user?.role === "manager" && (
              <>
                {/* <Route path='/manager-dashboard' element={<ManagerDashboard />} /> */}
                {/* Thêm các route manager ở đây */}
              </>
            )}
          </Routes>
          <Footer />
        </BrowserRouter>
      </MyCartContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;
