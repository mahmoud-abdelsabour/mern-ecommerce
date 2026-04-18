import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Return from '../../pages/Return'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useOrderById, useRequestReturn } from '../../hooks/useOrders'

if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ orderId: 'ord-1' }),
  useNavigate: () => jest.fn(),
}))

jest.mock('../../APIs/http', () => ({
  getToken: jest.fn(() => 'token-1'),
}))

jest.mock('../../hooks/useOrders', () => ({
  useOrderById: jest.fn(),
  useRequestReturn: jest.fn(),
}))

jest.mock('../../components/ProductList', () => ({ items, renderItem }) => (
  <div>
    {items.map((item) => (
      <div key={item.id}>{renderItem(item)}</div>
    ))}
  </div>
))

jest.mock('../../components/ProductCard', () => ({ ProductCard: ({ data, onToggleSelected }) => (
  <button type="button" onClick={() => onToggleSelected(true)}>
    Select {data.title}
  </button>
)}))

describe('S1C-F09 Return Page', () => {
  test('confirm return submits selected items and reason payload', async () => {
    const user = userEvent.setup()
    const mutate = jest.fn()

    useOrderById.mockReturnValue({
      data: {
        id: 'ord-1',
        deliveryStatus: 'delivered',
        products: [
          {
            product: 'p1',
            name: 'Laptop',
            quantity: 2,
            priceAtPurchase: 1000,
            photos: ['https://example.com/p1.jpg'],
            brand: 'Dell',
            category: 'Computers',
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    })

    useRequestReturn.mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
      error: null,
    })

    renderWithProviders(<Return />, { route: '/order/ord-1/return' })

    await user.click(screen.getByRole('button', { name: /select laptop/i }))
    await user.type(screen.getByPlaceholderText(/why are you returning these items/i), ' Damaged item ')
    await user.click(screen.getByRole('button', { name: /^return$/i }))
    await user.click(screen.getByRole('button', { name: /confirm return/i }))

    expect(mutate).toHaveBeenCalledWith({
      orderId: 'ord-1',
      returnedItems: [{ product: 'p1', quantity: 1 }],
      reason: 'Damaged item',
    })
  })
})
