import { screen } from '@testing-library/react'
import { renderWithProviders } from '../utils/renderWithProviders'
import ProductList from '../../components/ProductList'

describe('S1B-C03 ProductList component', () => {
  test('uses renderItem override for each item in grid layout', () => {
    const items = [
      { id: 'p1', title: 'Product One' },
      { id: 'p2', title: 'Product Two' },
    ]

    const renderItem = jest.fn((item) => <div key={item.id}>custom-item-{item.id}</div>)

    renderWithProviders(<ProductList items={items} renderItem={renderItem} layout="grid" />)

    expect(renderItem).toHaveBeenCalledTimes(2)
    expect(screen.getByText('custom-item-p1')).toBeInTheDocument()
    expect(screen.getByText('custom-item-p2')).toBeInTheDocument()
  })
})
