import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../utils/renderWithProviders'
import ProtectedRoute from '../../components/ProtectedRoute'

jest.mock('../../APIs/http', () => ({
  getToken: () => null,
}))

describe('S1B-C05 ProtectedRoute component', () => {
  test('redirects unauthenticated users to login route', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <div>private profile</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>,
      { route: '/me' }
    )

    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('private profile')).not.toBeInTheDocument()
  })
})
