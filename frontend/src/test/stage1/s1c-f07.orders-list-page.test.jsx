import Orders from '../../pages/Orders'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useOrders } from '../../hooks/useOrders'

if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

jest.mock('../../APIs/http', () => ({
  getToken: jest.fn(() => 'token-1'),
}))

jest.mock('../../hooks/useOrders', () => ({
  useOrders: jest.fn(),
}))

jest.mock('../../components/OrderCard', () => () => <div>order-card</div>)
jest.mock('../../components/skeletons/OrderCardSkeleton', () => () => <div>order-card-skeleton</div>)
jest.mock('../../components/PaginationControls', () => () => <div>pagination-controls</div>)

describe('S1C-F07 Orders List Page', () => {
  test('maps search params into useOrders query payload', () => {
    useOrders.mockReturnValue({
      data: { orders: [], pagination: { totalOrders: 0, currentPage: 2, limit: 12 } },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    })

    renderWithProviders(<Orders />, {
      route: '/orders?sort=price-asc&deliveryStatus=delivered&page=2',
    })

    expect(useOrders).toHaveBeenCalledWith({
      page: 2,
      limit: 12,
      sort: 'price-asc',
      deliveryStatus: 'delivered',
    })
  })
})
