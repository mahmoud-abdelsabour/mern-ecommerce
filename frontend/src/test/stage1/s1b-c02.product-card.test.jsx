import { screen } from '@testing-library/react'
import { renderWithProviders } from '../utils/renderWithProviders'
import { ProductCard } from '../../components/ProductCard'

jest.mock('../../hooks/useCartDrawer', () => ({
  useCartDrawer: () => ({ openCartDrawer: jest.fn() }),
}))

jest.mock('../../hooks/useCart', () => ({
  useCart: () => ({ data: [] }),
  useAddToCart: () => ({ isPending: false, mutate: jest.fn() }),
  useDecrementCartItem: () => ({ isPending: false, mutate: jest.fn() }),
}))

jest.mock('../../hooks/useWishlist', () => ({
  useWishlist: () => ({ data: [] }),
  useAddToWishlist: () => ({ isPending: false, mutate: jest.fn() }),
  useRemoveFromWishlist: () => ({ isPending: false, mutate: jest.fn() }),
}))

jest.mock('../../APIs/http', () => ({
  getToken: () => 'test-token',
}))

describe('S1B-C02 ProductCard component', () => {
  test('renders core product fields and default action buttons', () => {
    renderWithProviders(
      <ProductCard
        data={{
          id: 'p-1',
          title: 'Noise Cancelling Headset',
          brand: 'AudioPro',
          category: 'Electronics',
          price: 129.9,
          rating: 4.56,
          image: 'https://example.com/headset.jpg',
        }}
      />
    )

    expect(screen.getByRole('img', { name: 'Noise Cancelling Headset' })).toBeInTheDocument()
    expect(screen.getByText('Noise Cancelling Headset')).toBeInTheDocument()
    expect(screen.getByText('AudioPro • Electronics')).toBeInTheDocument()
    expect(screen.getByText('$129.9')).toBeInTheDocument()
    expect(screen.getByText('4.6')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buy now' })).toBeInTheDocument()
    expect(screen.getByLabelText('Add to wishlist')).toBeInTheDocument()
  })
})
