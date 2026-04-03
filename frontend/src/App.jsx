import './App.css'
import Nav from './components/utils/Nav'
import Footer from './components/utils/Footer'
import { Box, Flex } from '@chakra-ui/react'
import { Routes, Route, useMatch } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

const App = () => {
  return(
    <Flex direction="column" minH="100vh">
      <Nav />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
      <Box flex="1" />
      <Footer />
    </Flex>
  )
}

export default App
