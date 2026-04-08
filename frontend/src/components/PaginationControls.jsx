import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

// Reusable pagination controls based on Chakra's Pagination primitives.
// - `count` is the total number of items across all pages (e.g. totalProducts).
// - `pageSize` is how many items are shown per page.
// - `page` is the current page (1-based).
// - `onPageChange` receives the next page (1-based).
const PaginationControls = ({ count, pageSize, page, onPageChange, isDisabled }) => {
  // Chakra Pagination handles the "how many pages" math internally from `count` and `pageSize`.
  return (
    <Pagination.Root
      count={count}
      pageSize={pageSize}
      page={page}
      onPageChange={(details) => onPageChange?.(details.page)}
      disabled={Boolean(isDisabled)}
    >
      <ButtonGroup variant="outline" size="sm" flexWrap="wrap" justifyContent="center">
        <Pagination.PrevTrigger asChild>
          <IconButton aria-label="Previous page">
            <LuChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={(item) => (
            <IconButton
              aria-label={`Page ${item.value}`}
              variant={{ base: "outline", _selected: "solid" }}
            >
              {item.value}
            </IconButton>
          )}
        />

        <Pagination.NextTrigger asChild>
          <IconButton aria-label="Next page">
            <LuChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  )
}

export default PaginationControls

