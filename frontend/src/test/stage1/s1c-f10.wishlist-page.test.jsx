import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Wishlist from '../../pages/Wishlist'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useClearWishlist, useRemoveFromWishlist, useWishlist } from '../../hooks/useWishlist'
import { useQueries } from '@tanstack/react-query'

jest.mock('../../APIs/http', () => ({
  getToken: jest.fn(() => 'token-1'),
}))

jest.mock('../../hooks/useWishlist', () => ({
  useWishlist: jest.fn(),
  useClearWishlist: jest.fn(),
  useRemoveFromWishlist: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueries: jest.fn(),
}))

jest.mock('../../components/ProductList', () => () => <div>product-list</div>)

describe('S1C-F10 Wishlist Page', () => {
  test('clicking clear wishlist triggers clear mutation when wishlist has items', async () => {
    const user = userEvent.setup()
    const clearMutate = jest.fn()

    useWishlist.mockReturnValue({
      data: ['p1'],
      isLoading: false,
      isError: false,
      error: null,
    })

    useClearWishlist.mockReturnValue({ mutate: clearMutate, isPending: false })
    useRemoveFromWishlist.mockReturnValue({ mutateAsync: jest.fn(), isPending: false })

    useQueries.mockReturnValue([
      {
        isLoading: false,
        isError: false,
        data: {
          product: {
            id: 'p1',
            name: 'Laptop',
            price: 999,
            rating: { score: 4.5 },
            brand: { name: 'Dell' },
            category: { name: 'Computers' },
            photos: ['https://example.com/p1.jpg'],
          },
        },
      },
    ])

    renderWithProviders(<Wishlist />, { route: '/wishlist' })

    await user.click(screen.getByRole('button', { name: /clear wishlist/i }))

    expect(clearMutate).toHaveBeenCalledTimes(1)
  })
})
