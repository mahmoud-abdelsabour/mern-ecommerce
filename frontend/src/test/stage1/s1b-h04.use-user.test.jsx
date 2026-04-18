import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import usersApi from '../../APIs/users.api'
import { useUpdateProfile } from '../../hooks/useUser'
import { getStoredUser, setStoredUser } from '../../utils/authStorage'

jest.mock('../../APIs/users.api', () => ({
  __esModule: true,
  default: {
    getMe: jest.fn(),
    updateProfile: jest.fn(),
    createAddress: jest.fn(),
    updateAddress: jest.fn(),
    deleteAddress: jest.fn(),
    deleteMe: jest.fn(),
  },
}))

jest.mock('../../utils/authStorage', () => ({
  getStoredUser: jest.fn(),
  setStoredUser: jest.fn(),
}))

describe('S1B-H04 useUser hook family', () => {
  test('useUpdateProfile updates profile and invalidates me query on success', async () => {
    const fields = { firstName: 'Mahmoud', lastName: 'Ahmed' }
    const apiResponse = { firstName: 'Mahmoud', lastName: 'Ahmed', email: 'mahmoud@example.com' }

    usersApi.updateProfile.mockResolvedValueOnce(apiResponse)
    getStoredUser.mockReturnValueOnce({ token: 'token-1', firstName: 'Old', lastName: 'Name' })

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

    const { result } = renderHook(() => useUpdateProfile(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(fields)
    })

    expect(usersApi.updateProfile).toHaveBeenCalledWith(fields)
    expect(setStoredUser).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'token-1',
        firstName: 'Mahmoud',
        lastName: 'Ahmed',
        email: 'mahmoud@example.com',
      })
    )
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['me'] })
  })
})
