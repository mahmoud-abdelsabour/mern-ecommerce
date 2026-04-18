import { Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { renderWithProviders } from '../utils/renderWithProviders'

const ProbeComponent = () => {
  const location = useLocation()
  const { data } = useQuery({
    queryKey: ['probe'],
    queryFn: async () => 'query-ready',
  })

  return (
    <>
      <Text>path:{location.pathname}</Text>
      <Text>search:{location.search}</Text>
      <Text>query:{data ?? 'loading'}</Text>
    </>
  )
}

describe('S1A-02 shared render utilities', () => {
  test('renders with custom route query and query client context', async () => {
    const { findByText } = renderWithProviders(<ProbeComponent />, {
      route: '/catalog?search=headset',
    })

    expect(await findByText('path:/catalog')).toBeInTheDocument()
    expect(await findByText('search:?search=headset')).toBeInTheDocument()
    expect(await findByText('query:query-ready')).toBeInTheDocument()
  })
})
