import { Button, Text } from '@chakra-ui/react'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useCatalogFilters } from '../../hooks/useCatalogFilters'

const CatalogFiltersProbe = () => {
  const { filters, setSearch } = useCatalogFilters()
  const location = useLocation()

  return (
    <>
      <Text>search:{filters.search}</Text>
      <Text>page:{filters.page}</Text>
      <Text data-testid="query-string">query:{location.search}</Text>
      <Button onClick={() => setSearch('buds')}>set-search-buds</Button>
    </>
  )
}

describe('S1B-H01 useCatalogFilters hook', () => {
  test('parses current URL params and updates search while resetting page', async () => {
    const user = userEvent.setup()

    renderWithProviders(<CatalogFiltersProbe />, {
      route: '/catalog?search=headset&page=3&minPrice=10&maxPrice=100&minRating=2',
    })

    expect(screen.getByText('search:headset')).toBeInTheDocument()
    expect(screen.getByText('page:3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'set-search-buds' }))

    expect(screen.getByText('search:buds')).toBeInTheDocument()
    expect(screen.getByText('page:1')).toBeInTheDocument()
    expect(screen.getByTestId('query-string').textContent).toContain('search=buds')
    expect(screen.getByTestId('query-string').textContent).not.toContain('page=')
  })
})
