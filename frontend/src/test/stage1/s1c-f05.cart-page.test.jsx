import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Cart from '../../pages/Cart'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useAddToCart, useCart, useClearCart, useDecrementCartItem } from '../../hooks/useCart'

jest.mock('../../APIs/http', () => ({
  getToken: jest.fn(() => 'token-1'),
}))

jest.mock('../../hooks/useCart', () => ({
  useCart: jest.fn(),
  useAddToCart: jest.fn(),
  useDecrementCartItem: jest.fn(),
  useClearCart: jest.fn(),
}))

jest.mock('../../components/ProductList', () => () => <div>product-list</div>)

describe('S1C-F05 Cart Page', () => {
  test('clicking clear cart triggers clear mutation in logged-in cart state', async () => {
    const user = userEvent.setup()
    const clearMutate = jest.fn()

    useCart.mockReturnValue({
      data: [
        {
          product: {
            id: 'p1',
            name: 'Laptop',
            price: 999,
            photos: ['https://example.com/p1.jpg'],
            rating: { score: 4.6 },
          },
          quantity: 2,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    })

    useAddToCart.mockReturnValue({ mutate: jest.fn(), isPending: false })
    useDecrementCartItem.mockReturnValue({ mutate: jest.fn(), isPending: false })
    useClearCart.mockReturnValue({ mutate: clearMutate, isPending: false })

    renderWithProviders(<Cart />, { route: '/cart' })

    await user.click(screen.getByRole('button', { name: /clear cart/i }))

    expect(clearMutate).toHaveBeenCalledTimes(1)
  })
})
