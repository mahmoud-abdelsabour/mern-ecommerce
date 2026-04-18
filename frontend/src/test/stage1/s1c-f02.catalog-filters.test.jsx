import Catalog from '../../pages/Catalog'
import { renderWithProviders } from '../utils/renderWithProviders'
import { useProducts } from '../../hooks/useProducts'

if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

jest.mock('../../hooks/useProducts', () => ({
  useProducts: jest.fn(),
}))

jest.mock('../../hooks/useBrands', () => ({
  useBrands: jest.fn(() => ({ data: { brands: [] }, isLoading: false })),
}))

jest.mock('../../hooks/useCategories', () => ({
  useCategories: jest.fn(() => ({ data: { categories: [] }, isLoading: false })),
}))

jest.mock('../../hooks/useCatalogFilters', () => ({
  useCatalogFilters: jest.fn(() => ({
    filters: {
      selectedBrands: ['apple'],
      selectedCategories: ['phones'],
      priceRange: [100, 2000],
      minRating: 4,
      sort: '{"price":1}',
      page: 3,
      search: 'iphone',
    },
    setBrands: jest.fn(),
    setCategories: jest.fn(),
    setPriceRange: jest.fn(),
    setMinRating: jest.fn(),
    setSort: jest.fn(),
    setPage: jest.fn(),
    resetFilters: jest.fn(),
    defaultSort: '{"createdAt":-1}',
  })),
}))

jest.mock('../../components/ProductList', () => () => <div>product-list</div>)
jest.mock('../../components/PaginationControls', () => () => <div>pagination</div>)
jest.mock('../../components/skeletons/ProductGridSkeleton', () => () => <div>grid-skeleton</div>)

describe('S1C-F02 Catalog and Search/Filter/Sort', () => {
  test('catalog builds and sends expected API filters to useProducts', () => {
    useProducts.mockReturnValue({
      data: { products: [], pagination: { totalProducts: 0, currentPage: 3, limit: 12 } },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    })

    renderWithProviders(<Catalog />, { route: '/catalog?q=iphone' })

    expect(useProducts).toHaveBeenCalledWith({
      brand: 'apple',
      category: 'phones',
      minPrice: 100,
      maxPrice: 2000,
      minRating: 4,
      sort: '{"price":1}',
      page: 3,
      limit: 12,
      search: 'iphone',
    })
  })
})
