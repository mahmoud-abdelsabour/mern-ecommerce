import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import cartApi from '../../APIs/cart.api'
import { useAddToCart } from '../../hooks/useCart'

jest.mock('../../APIs/cart.api', () => ({
  __esModule: true,
  default: {
    addToCart: jest.fn(),
    getCart: jest.fn(),
    decrementCartItem: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
  },
}))

describe('S1B-H02 useCart hook family', () => {
  test('useAddToCart calls API and invalidates cart query on success', async () => {
    cartApi.addToCart.mockResolvedValueOnce([{ product: 'p1', quantity: 2 }])

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

    const { result } = renderHook(() => useAddToCart(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ productId: 'p1', quantity: 2 })
    })

    expect(cartApi.addToCart).toHaveBeenCalledWith({ productId: 'p1', quantity: 2 })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['cart'] })
  })
})
