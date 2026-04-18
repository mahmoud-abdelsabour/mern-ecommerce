import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../utils/renderWithProviders'
import PaginationControls from '../../components/PaginationControls'

describe('S1B-C06 PaginationControls component', () => {
  test('fires onPageChange with next page number when next trigger is clicked', async () => {
    const onPageChange = jest.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <PaginationControls
        count={30}
        pageSize={10}
        page={1}
        onPageChange={onPageChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
