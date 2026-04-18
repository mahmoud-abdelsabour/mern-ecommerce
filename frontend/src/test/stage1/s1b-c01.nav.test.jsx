import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../utils/renderWithProviders'
import Nav from '../../components/Nav'

jest.mock('../../hooks/useBrands', () => ({
  useBrands: () => ({
    data: { brands: [{ id: 'b1', slug: 'brand-one', name: 'Brand One' }] },
    isLoading: false,
  }),
}))

jest.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    data: { categories: [{ id: 'c1', slug: 'cat-one', name: 'Category One' }] },
    isLoading: false,
  }),
}))

jest.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    data: [{ quantity: 2 }, { quantity: 3 }],
  }),
}))

jest.mock('../../hooks/useStoredUser', () => ({
  useStoredUser: () => null,
}))

jest.mock('../../theme/use-color-mode', () => ({
  useColorMode: () => ({
    colorMode: 'light',
    toggleColorMode: jest.fn(),
  }),
}))

describe('S1B-C01 Nav component', () => {
  test('renders expected guest navigation actions and aggregated cart count', () => {
    renderWithProviders(<Nav />, { route: '/' })

    expect(screen.getByLabelText('Open cart')).toBeInTheDocument()
    expect(screen.getByLabelText('Open wishlist')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()

    const menuButton = screen.getByRole('button', { name: /Open navigation menu/i })
    expect(menuButton).toBeInTheDocument()

    fireEvent.click(menuButton)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })
})
