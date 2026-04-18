import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditProfile from '../../pages/EditProfile'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useMe, useUpdateProfile } from '../../hooks/useUser'

jest.mock('../../hooks/useUser', () => ({
  useMe: jest.fn(),
  useUpdateProfile: jest.fn(),
}))

describe('S1C-F12 Profile and Account Pages', () => {
  test('saving profile submits trimmed fields via updateProfile mutation', async () => {
    const user = userEvent.setup()
    const mutate = jest.fn()

    useMe.mockReturnValue({
      data: {
        id: 'u1',
        firstName: 'Mahmoud',
        lastName: 'Ahmed',
        username: 'mahmoud',
        phone: '01012345678',
      },
      isLoading: false,
      isError: false,
      error: null,
    })

    useUpdateProfile.mockReturnValue({
      mutate,
      isPending: false,
    })

    renderWithProviders(<EditProfile />, { route: '/me/edit' })

    const firstNameInput = screen.getByRole('textbox', { name: /first name/i })
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i })
    const usernameInput = screen.getByRole('textbox', { name: /username/i })
    const phoneInput = screen.getByRole('textbox', { name: /phone/i })

    await user.clear(firstNameInput)
    await user.type(firstNameInput, '  Mahmoud  ')
    await user.clear(lastNameInput)
    await user.type(lastNameInput, '  Ahmed  ')
    await user.clear(usernameInput)
    await user.type(usernameInput, '  mahmoud_1  ')
    await user.clear(phoneInput)
    await user.type(phoneInput, ' 01000000000 ')

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(mutate).toHaveBeenCalledWith({
      firstName: 'Mahmoud',
      lastName: 'Ahmed',
      username: 'mahmoud_1',
      phone: '01000000000',
    })
  })
})
