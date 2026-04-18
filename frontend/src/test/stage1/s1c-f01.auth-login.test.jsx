import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../../pages/auth/Login'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useLogin } from '../../hooks/useAuth'

jest.mock('../../hooks/useAuth', () => ({
  useLogin: jest.fn(),
}))

jest.mock('../../utils/flashStorage', () => ({
  consumeFlash: jest.fn(() => null),
}))

describe('S1C-F01 Auth (Login/Register)', () => {
  test('login submit calls mutation with normalized email and password', async () => {
    const user = userEvent.setup()
    const mutate = jest.fn()
    useLogin.mockReturnValue({
      mutate,
      isPending: false,
    })

    renderWithProviders(<Login />, { route: '/login' })

    await user.type(screen.getByRole('textbox', { name: /email address/i }), ' USER@EXAMPLE.COM ')
    await user.type(screen.getByLabelText(/password/i), 'Aa123456!')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(mutate).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Aa123456!',
    })
  })
})
