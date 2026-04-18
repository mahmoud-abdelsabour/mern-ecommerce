import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ordersApi from '../../APIs/orders.api'
import { useCreateOrder } from '../../hooks/useOrders'

jest.mock('../../APIs/orders.api', () => ({
  __esModule: true,
  default: {
    createOrder: jest.fn(),
    getOrders: jest.fn(),
    getOrderById: jest.fn(),
    cancelOrder: jest.fn(),
    requestReturn: jest.fn(),
  },
}))

describe('S1B-H03 useOrders hook family', () => {
  test('useCreateOrder calls API and invalidates orders/cart queries on success', async () => {
    const payload = {
      products: [{ product: 'p1', quantity: 1 }],
      shippingInfo: { firstName: 'A', lastName: 'B', phone: '01012345678', address: { city: 'Cairo' } },
      source: 'cart',
      paymentMethod: 'COD',
    }

    ordersApi.createOrder.mockResolvedValueOnce({ id: 'order-1' })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateOrder(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(ordersApi.createOrder).toHaveBeenCalledWith(payload)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cart'] })
  })
})
