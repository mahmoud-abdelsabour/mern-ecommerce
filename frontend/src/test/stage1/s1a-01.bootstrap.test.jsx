import { render, screen } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '../../components/NotFound'
import { appSystem } from '../../theme/system'

describe('S1A-01 test bootstrap', () => {
  test('renders component with Chakra and Router providers', () => {
    render(
      <ChakraProvider value={appSystem}>
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      </ChakraProvider>
    )

    expect(screen.getByText('404 Not Found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
  })
})
