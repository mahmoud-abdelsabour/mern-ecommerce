import { renderWithProviders } from '../utils/renderWithProviders'
import ProductGridSkeleton from '../../components/skeletons/ProductGridSkeleton'
import ProductCardSkeleton from '../../components/skeletons/ProductCardSkeleton'

jest.mock('../../components/skeletons/ProductCardSkeleton', () => {
  const MockProductCardSkeleton = jest.fn(() => <div>product-card-skeleton</div>)
  return {
    __esModule: true,
    default: MockProductCardSkeleton,
  }
})

describe('S1D-03 Skeleton Components Contract Tests', () => {
  test('ProductGridSkeleton renders requested count and forwards variant prop', () => {
    renderWithProviders(<ProductGridSkeleton count={3} variant="order" />)

    expect(ProductCardSkeleton).toHaveBeenCalledTimes(3)
    for (const call of ProductCardSkeleton.mock.calls) {
      expect(call[0]).toEqual(expect.objectContaining({ variant: 'order' }))
    }
  })
})
