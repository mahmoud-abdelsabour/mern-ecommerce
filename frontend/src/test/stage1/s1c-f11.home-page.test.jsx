import Home from '../../pages/Home'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useCategories } from '../../hooks/useCategories'
import { useProducts } from '../../hooks/useProducts'

if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (!global.IntersectionObserver) {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}

if (!window.HTMLElement.prototype.scrollTo) {
  window.HTMLElement.prototype.scrollTo = () => {}
}

if (!window.scrollTo) {
  window.scrollTo = () => {}
}

jest.mock('../../hooks/useCategories', () => ({
  useCategories: jest.fn(),
}))

jest.mock('../../hooks/useProducts', () => ({
  useProducts: jest.fn(),
}))

jest.mock('../../components/ProductCard', () => ({
  ProductCard: () => <div>product-card</div>,
}))

describe('S1C-F11 Home Page', () => {
  test('builds featured, top-rated, and spotlight product queries from categories', () => {
    useCategories.mockReturnValue({
      data: {
        categories: [
          { id: 'c2', name: 'Phones', slug: 'phones' },
          { id: 'c1', name: 'Accessories', slug: 'accessories' },
        ],
      },
      isLoading: false,
    })

    useProducts.mockReturnValue({ data: { products: [] }, isLoading: false })

    renderWithProviders(<Home />, { route: '/' })

    expect(useProducts).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
      sort: JSON.stringify({ createdAt: -1 }),
    })

    expect(useProducts).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
      sort: JSON.stringify({ 'rating.score': -1 }),
    })

    expect(useProducts).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 12,
        category: 'accessories',
        sort: JSON.stringify({ createdAt: -1 }),
      },
      { enabled: true }
    )
  })
})
