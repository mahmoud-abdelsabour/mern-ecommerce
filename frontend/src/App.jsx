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
import Orders from './pages/Orders'
import Order from './pages/Order'
import CheckOut from './pages/CheckOut'
import Return from './pages/Return'

const App = () => {
  return(
    <Flex direction="column" minH="100vh">
      <Nav />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/product' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/order' element={<Order />} />
        <Route path='/order/check-out' element={<CheckOut />} />
        <Route path='/order/return' element={<Return />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Box flex="1" />
      <Footer />
    </Flex>
  )
}

export default App
