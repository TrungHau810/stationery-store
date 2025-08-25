import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './components/Home';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProductDetail from './components/ProductDetail';
import Login from './components/Login';
import Register from './components/Register';
import { MyCartContext, MyUserContext } from './configs/Context';
import MyUserReducer from './reducers/MyUserReducer';
import { useReducer } from 'react';
import Profile from './components/Profile';
import MyCartReducer from './reducers/MyCartReducer';
import Cart from './components/Cart';
import LoyaltyPoint from './components/LoyaltyPoint';
import PurchaseHistory from './components/PurchaseHistory';

function App() {

  let [user, dispatch] = useReducer(MyUserReducer, null);
  let [cart, setCart] = useReducer(MyCartReducer, 0);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <MyCartContext.Provider value={[cart, setCart]}>
        <BrowserRouter>

          <Header />

          <Container>
            <Routes>

              <Route path='/' element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/profile' element={<Profile />} />

              <Route path='/loyalty' element={<LoyaltyPoint />} />

              <Route path='/product/:id' element={<ProductDetail />} />
              <Route path='/cart' element={<Cart />} />

              <Route path='/lich-su-mua-hang' element={<PurchaseHistory />} />

            </Routes>
          </Container>

          <Footer />

        </BrowserRouter>
      </MyCartContext.Provider>
    </MyUserContext.Provider>

  );
}

export default App;
