import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Order from '../../pages/Order'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useCancelOrder, useOrderById } from '../../hooks/useOrders'

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
}))

jest.mock('../../APIs/http', () => ({
  getToken: jest.fn(() => 'token-1'),
}))

jest.mock('../../hooks/useOrders', () => ({
  useOrderById: jest.fn(),
  useCancelOrder: jest.fn(),
}))

jest.mock('../../components/ProductList', () => () => <div>product-list</div>)
jest.mock('../../components/AddressCard', () => () => <div>address-card</div>)
jest.mock('../../components/GlobalNotification', () => () => null)

describe('S1C-F08 Single Order Page', () => {
  test('confirming cancel on pending order triggers cancel mutation with order id', async () => {
    const user = userEvent.setup()
    const mutate = jest.fn((id, options) => {
      options?.onSuccess?.()
    })

    useOrderById.mockReturnValue({
      data: {
        id: 'ord-1',
        createdAt: '2026-04-10T10:00:00.000Z',
        deliveryStatus: 'pending',
        shippingInfo: {
          firstName: 'Mahmoud',
          lastName: 'Ahmed',
          phone: '01012345678',
          address: {
            country: 'Egypt',
            city: 'Cairo',
            postalcode: '11511',
            street: 'Nasr Rd',
            building: '10',
            floor: 5,
            special_mark: 'Near mall',
          },
        },
        products: [
          {
            product: 'p1',
            name: 'Laptop',
            quantity: 1,
            priceAtPurchase: 1200,
            photos: ['https://example.com/p1.jpg'],
          },
        ],
        shippingPrice: 25,
        codFees: 10,
        totalPrice: 1235,
        paymentMethod: 'COD',
      },
      isLoading: false,
      isError: false,
      error: null,
    })

    useCancelOrder.mockReturnValue({ mutate, isPending: false })

    renderWithProviders(<Order />, { route: '/order/ord-1' })

    await user.click(screen.getByRole('button', { name: /cancel order/i }))
    await user.click(screen.getByRole('button', { name: /yes, cancel order/i }))

    expect(mutate).toHaveBeenCalledWith('ord-1', expect.objectContaining({ onSuccess: expect.any(Function) }))
  })
})
