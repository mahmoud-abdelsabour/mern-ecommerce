import './App.css'
import Nav from './components/Nav'
import Footer from './components/Footer'
import { Box, Flex } from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import NotFound from './components/NotFound'
import Catalog from './pages/Catalog'
import Orders from './pages/Orders'
import Order from './pages/Order'
import CheckOut from './pages/CheckOut'
import Return from './pages/Return'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import ChangePassword from './pages/ChangePassword'
import ChangeEmail from './pages/ChangeEmail'

const App = () => {
  return(
    <Flex direction="column" minH="100vh">
      <Nav />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/catalog' element={<Catalog />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/order' element={<Order />} />
        <Route path='/order/check-out' element={<CheckOut />} />
        <Route path='/order/return' element={<Return />} />
        <Route path='/me' element={<Profile />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/me/edit' element={<EditProfile />} />
        <Route path='/me/change-password' element={<ChangePassword />} />
        <Route path='/me/change-email' element={<ChangeEmail />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Box flex="1" />
      <Footer />
    </Flex>
  )
}

export default App
