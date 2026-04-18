import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Product from '../../pages/Product'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useProductById } from '../../hooks/useProducts'
import { useAddToCart, useCart, useDecrementCartItem } from '../../hooks/useCart'
import { useCartDrawer } from '../../hooks/useCartDrawer'

const mockNavigate = jest.fn()

if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (!global.IntersectionObserver) {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
  }
}

if (!window.HTMLElement.prototype.scrollTo) {
  window.HTMLElement.prototype.scrollTo = () => {}
}

if (!window.scrollTo) {
  window.scrollTo = () => {}
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ productId: 'prod-1' }),
  useNavigate: () => mockNavigate,
}))

jest.mock('../../APIs/http', () => ({
  getToken: jest.fn(() => 'token-1'),
}))

jest.mock('../../hooks/useProducts', () => ({
  useProductById: jest.fn(),
}))

jest.mock('../../hooks/useProductReviews', () => ({
  useCreateReview: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  useProductUserStatus: jest.fn(() => ({ data: { canReview: false, hasReviewed: false }, isLoading: false })),
}))

jest.mock('../../hooks/useWishlist', () => ({
  useWishlist: jest.fn(() => ({ data: [] })),
  useAddToWishlist: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  useRemoveFromWishlist: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}))

jest.mock('../../hooks/useCart', () => ({
  useCart: jest.fn(),
  useAddToCart: jest.fn(),
  useDecrementCartItem: jest.fn(),
}))

jest.mock('../../hooks/useCartDrawer', () => ({
  useCartDrawer: jest.fn(),
}))

jest.mock('../../components/ReviewRow', () => () => <div>review-row</div>)
jest.mock('../../components/skeletons/ReviewRowSkeleton', () => () => <div>review-row-skeleton</div>)

describe('S1C-F03 Product Details and Buy Actions', () => {
  test('clicking add to cart calls mutation and opens cart drawer on success', async () => {
    const user = userEvent.setup()
    const openCartDrawer = jest.fn()
    const addToCartMutate = jest.fn((variables, options) => {
      options?.onSuccess?.()
    })

    useProductById.mockReturnValue({
      data: {
        product: {
          id: 'prod-1',
          name: 'iPhone 15',
          brand: { name: 'Apple' },
          price: 999,
          photos: ['https://example.com/p1.jpg'],
          rating: { score: 4.5, voters: 10 },
        },
        reviewsPreview: [],
        reviewsCount: 0,
        hasMoreReviews: false,
      },
      isLoading: false,
      isError: false,
      error: null,
    })

    useCart.mockReturnValue({ data: [] })
    useAddToCart.mockReturnValue({ mutate: addToCartMutate, isPending: false })
    useDecrementCartItem.mockReturnValue({ mutate: jest.fn(), isPending: false })
    useCartDrawer.mockReturnValue({ openCartDrawer })

    renderWithProviders(<Product />, { route: '/product/prod-1' })

    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(addToCartMutate).toHaveBeenCalledWith(
      { productId: 'prod-1', quantity: 1 },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
    expect(openCartDrawer).toHaveBeenCalledTimes(1)
  })
})
