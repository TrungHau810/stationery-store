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
import ListProduct from './components/ListProduct';
import Register from './components/Register';
import Footer from './components/layout/Footer';


function App() {

  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [cart, dispatchCart] = useReducer(CartReducer, 0);

  console.log("Cart: ", cart);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <MyCartContext.Provider value={[cart, dispatchCart]}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {user && <Route path='/profile' element={<Profile />} />}

            <Route path='/product/:id' element={<ProductDetail />} />
            <Route path='/' element={<ListProduct />} />

            <Route path='/cart' element={<Cart />} />
            <Route path='/purchase' element={<Purchase />} />
            <Route path='/purchase/order/:id' element={<OrderDetail />} />
            <Route path='/loyalty-point' element={<LoyaltyPoint />} />
          </Routes>

          <Footer />
        </BrowserRouter>
      </MyCartContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;
