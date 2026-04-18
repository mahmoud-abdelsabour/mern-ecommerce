import { screen } from '@testing-library/react'
import App from '../../App'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useAuthAutoLogout } from '../../hooks/useAuthAutoLogout'

jest.mock('../../components/Nav', () => () => <div>global-nav</div>)
jest.mock('../../components/Footer', () => () => <div>global-footer</div>)
jest.mock('../../components/ScrollToTop', () => () => <div>scroll-to-top</div>)

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
jest.mock('../../components/NotFound', () => () => <div>not-found-page</div>)

jest.mock('../../components/ProtectedRoute', () => {
  const { Outlet } = jest.requireActual('react-router-dom')
  return () => <Outlet />
})

jest.mock('../../hooks/useAuthAutoLogout', () => ({
  useAuthAutoLogout: jest.fn(),
}))

describe('S1D-02 Global App Shell', () => {
  test('renders shell components and invokes auth auto-logout on routed page', () => {
    renderWithProviders(<App />, { route: '/login' })

    expect(useAuthAutoLogout).toHaveBeenCalledTimes(1)
    expect(screen.getByText('global-nav')).toBeInTheDocument()
    expect(screen.getByText('scroll-to-top')).toBeInTheDocument()
    expect(screen.getByText('global-footer')).toBeInTheDocument()
    expect(screen.getByText('login-page')).toBeInTheDocument()
  })
})
