import { screen } from '@testing-library/react'
import { renderWithProviders } from '../utils/renderWithProviders'
import GlobalNotification from '../../components/GlobalNotification'

describe('S1B-C04 GlobalNotification component', () => {
  test('renders alert title when provided', () => {
    renderWithProviders(<GlobalNotification status="success" title="Profile saved successfully" />)

    expect(screen.getByText('Profile saved successfully')).toBeInTheDocument()
  })
})
