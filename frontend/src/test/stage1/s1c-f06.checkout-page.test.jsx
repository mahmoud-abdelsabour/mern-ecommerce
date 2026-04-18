import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckOut from '../../pages/CheckOut'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useCart } from '../../hooks/useCart'
import { useCreateOrder } from '../../hooks/useOrders'
import { useProductById } from '../../hooks/useProducts'
import { useCreateAddress, useMe } from '../../hooks/useUser'

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

jest.mock('../../hooks/useCart', () => ({
  useCart: jest.fn(),
}))

jest.mock('../../hooks/useOrders', () => ({
  useCreateOrder: jest.fn(),
}))

jest.mock('../../hooks/useProducts', () => ({
  useProductById: jest.fn(),
}))

jest.mock('../../hooks/useUser', () => ({
  useMe: jest.fn(),
  useCreateAddress: jest.fn(),
}))

jest.mock('../../components/ProductList', () => () => <div>product-list</div>)
jest.mock('../../components/AddressForm', () => () => <div>address-form</div>)
jest.mock('../../components/GlobalNotification', () => () => null)

describe('S1C-F06 Checkout Page', () => {
  test('place order sends expected payload for cart checkout', async () => {
    const user = userEvent.setup()
    const mutate = jest.fn()

    useCart.mockReturnValue({
      data: [
        {
          product: {
            id: 'p1',
            name: 'Laptop',
            price: 1000,
            rating: { score: 4.2 },
            brand: { name: 'Dell' },
            category: { name: 'Computers' },
            photos: ['https://example.com/p1.jpg'],
          },
          quantity: 2,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    })

    useProductById.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    })

    useMe.mockReturnValue({
      data: {
        firstName: 'Mahmoud',
        lastName: 'Ahmed',
        phone: '01012345678',
        addresses: [
          {
            _id: 'addr-1',
            address_name: 'Home',
            country: 'Egypt',
            city: 'Cairo',
            postalcode: '11511',
            street: 'Nasr Rd',
            building: '10',
            floor: 5,
            special_mark: 'Near mall',
          },
        ],
      },
      isLoading: false,
    })

    useCreateAddress.mockReturnValue({ mutate: jest.fn(), isPending: false })
    useCreateOrder.mockReturnValue({ mutate, isPending: false })

    renderWithProviders(<CheckOut />, { route: '/order/check-out' })

    await user.click(screen.getByText('COD'))
    await user.click(screen.getByRole('button', { name: /place order/i }))

    expect(mutate).toHaveBeenCalledWith({
      products: [{ product: 'p1', quantity: 2 }],
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
      source: 'cart',
      paymentMethod: 'COD',
    })
  })
})
