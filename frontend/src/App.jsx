import './App.css'
import Nav from './components/utils/Nav'
import Footer from './components/utils/Footer'
import { Box, Flex } from '@chakra-ui/react'

const App = () => {
  return(
    <Flex direction="column" minH="100vh">
      <Nav />
      <Box flex="1" />
      <Footer />
    </Flex>
  )
}

export default App
