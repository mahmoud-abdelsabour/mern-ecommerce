import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductReviews from '../../pages/ProductReviews'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useProductById } from '../../hooks/useProducts'
import { useProductReviewsInfinite } from '../../hooks/useProductReviews'

if (!global.IntersectionObserver) {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ productId: 'prod-1' }),
}))

jest.mock('../../hooks/useProducts', () => ({
  useProductById: jest.fn(),
}))

jest.mock('../../hooks/useProductReviews', () => ({
  useProductReviewsInfinite: jest.fn(),
}))

jest.mock('../../components/ReviewRow', () => ({ review }) => <div>{review.comment}</div>)
jest.mock('../../components/skeletons/ReviewRowSkeleton', () => () => <div>review-skeleton</div>)

describe('S1C-F04 Product Reviews (Preview and Full Page)', () => {
  test('clicking load more reviews triggers fetchNextPage', async () => {
    const user = userEvent.setup()
    const fetchNextPage = jest.fn()

    useProductById.mockReturnValue({
      data: { product: { id: 'prod-1', name: 'iPhone 15' } },
      isLoading: false,
      isError: false,
      error: null,
    })

    useProductReviewsInfinite.mockReturnValue({
      data: {
        pages: [
          {
            reviews: [{ id: 'r1', comment: 'Great phone' }],
            pagination: { total: 4 },
          },
        ],
      },
      fetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    })

    renderWithProviders(<ProductReviews />, { route: '/product/prod-1/reviews' })

    expect(screen.getByText('Great phone')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /load more reviews/i }))
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })
})
