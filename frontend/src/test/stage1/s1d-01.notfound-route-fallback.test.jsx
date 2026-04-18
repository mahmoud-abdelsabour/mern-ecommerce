import { screen } from '@testing-library/react'
import App from '../../App'
import { renderWithProviders } from '../utils/renderWithProviders'

jest.mock('../../components/Nav', () => () => <div>nav</div>)
jest.mock('../../components/Footer', () => () => <div>footer</div>)
jest.mock('../../components/ScrollToTop', () => () => null)
jest.mock('../../hooks/useAuthAutoLogout', () => ({ useAuthAutoLogout: jest.fn() }))

jest.mock('../../pages/Home', () => () => <div>home-page</div>)
jest.mock('../../pages/auth/Login', () => () => <div>login-page</div>)
jest.mock('../../pages/auth/Register', () => () => <div>register-page</div>)
jest.mock('../../pages/Product', () => () => <div>product-page</div>)
jest.mock('../../pages/ProductReviews', () => () => <div>product-reviews-page</div>)
jest.mock('../../pages/Cart', () => () => <div>cart-page</div>)
jest.mock('../../pages/Wishlist', () => () => <div>wishlist-page</div>)
jest.mock('../../pages/Catalog', () => () => <div>catalog-page</div>)
jest.mock('../../pages/Orders', () => () => <div>orders-page</div>)
jest.mock('../../pages/Order', () => () => <div>order-page</div>)
jest.mock('../../pages/CheckOut', () => () => <div>checkout-page</div>)
jest.mock('../../pages/Return', () => () => <div>return-page</div>)
jest.mock('../../pages/Profile', () => () => <div>profile-page</div>)
jest.mock('../../pages/EditProfile', () => () => <div>edit-profile-page</div>)
jest.mock('../../pages/ChangePassword', () => () => <div>change-password-page</div>)
jest.mock('../../pages/ChangeEmail', () => () => <div>change-email-page</div>)

jest.mock('../../components/ProtectedRoute', () => {
  const { Outlet } = jest.requireActual('react-router-dom')
  return () => <Outlet />
})

describe('S1D-01 NotFound and Route Fallbacks', () => {
  test('unmatched route renders 404 fallback screen', () => {
    renderWithProviders(<App />, { route: '/this-route-does-not-exist' })

    expect(screen.getByText(/404 not found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  })
})
