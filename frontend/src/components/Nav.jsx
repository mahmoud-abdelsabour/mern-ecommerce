import { useState } from "react"
import logo from '../assets/logo.svg'
import { Input, IconButton, Button, Menu, Portal, Avatar, HStack, Link, Flex, Box, Skeleton } from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { LuSearch } from "react-icons/lu"
import { FaCartShopping } from "react-icons/fa6";
import { MdFavorite } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { ICON_SIZE } from "../constants/ui";
import { useBrands } from "../hooks/useBrands";
import { useCategories } from "../hooks/useCategories";
import { clearStoredUser } from "../utils/authStorage";
import { useCart } from "../hooks/useCart";
import { useStoredUser } from "../hooks/useStoredUser";

const Nav = () => {
    const navigate = useNavigate()
    const [searchDraft, setSearchDraft] = useState("")

    const submitCatalogSearch = (e) => {
        e.preventDefault()
        const term = searchDraft.trim()
        if (!term) return
        navigate(`/catalog?search=${encodeURIComponent(term)}`)
    }
    const { data: brandsData, isLoading: brandsLoading } = useBrands()
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
    const { data: cartData } = useCart()

    // Sum cart item quantities for a simple badge count on the cart icon.
    // Hide the badge when the cart is empty (show nothing instead of 0).
    const cartCount = Array.isArray(cartData)
      ? cartData.reduce((sum, item) => sum + Number(item?.quantity ?? 0), 0)
      : 0

    // Read the logged-in user from localStorage (set on login).
    // Shape: `{ token, username, firstName, lastName, profilePhoto }`.
    const storedUser = useStoredUser()

    const displayName =
        storedUser?.firstName || storedUser?.lastName
            ? `${storedUser?.firstName ?? ""} ${storedUser?.lastName ?? ""}`.trim()
            : storedUser?.username ?? "Guest"

    const onLogout = () => {
        // Clear auth state and redirect to login (mirrors token-expiry behavior).
        clearStoredUser()
        navigate("/login", { replace: true })
    }

    return(
        <Box
            as="nav"
            position="sticky"
            top={0}
            zIndex={1100}
            w="100%"
          bg="surface.panel"
            borderBottom="1px solid"
          borderColor="surface.border"
            boxShadow="0 1px 0 rgba(0, 0, 0, 0.04)"
            px={{ base: 4, md: 6 }}
            py={3}
        >
            <Flex align="center" gap={3} flexWrap="wrap" rowGap={2}>
                <Link as={RouterLink} to="/" display="inline-flex" alignItems="center" order={{ base: 1, md: 1 }}>
                    <img src={logo} alt="logo" style={{ height: 40, width: 'auto' }} />
                </Link>

                <HStack
                    order={{ base: 2, md: 3 }}
                    w={{ base: "auto", md: "auto" }}
                    ml={{ base: "auto", md: 0 }}
                    spacing={3}
                >
                    <Link as={RouterLink} to="/cart" position="relative">
                        <FaCartShopping size={ICON_SIZE} />
                        {cartCount > 0 && (
                          <Box
                            position="absolute"
                            top="-2"
                            right="-2"
                            minW="18px"
                            h="18px"
                            px="1"
                            bg="brand.600"
                            color="white"
                            rounded="full"
                            fontSize="xs"
                            fontWeight="700"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            lineHeight="1"
                          >
                            {cartCount}
                          </Box>
                        )}
                    </Link>
                    <Link as={RouterLink} to="/wishlist">
                        <MdFavorite size={ICON_SIZE} />
                    </Link>
                    {storedUser ? (
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <Button variant='unstyled' p={0} minW='unset'>
                            <Avatar.Root size="sm">
                              <Avatar.Fallback name={displayName} />
                              <Avatar.Image src={storedUser?.profilePhoto ?? undefined} />
                            </Avatar.Root>
                          </Button>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              <Menu.Item asChild value="view-profile">
                                <Link as={RouterLink} to="/me">
                                  view profile
                                </Link>
                              </Menu.Item>
                              <Menu.Item asChild value="edit-profile">
                                <Link as={RouterLink} to="/me/edit">
                                  edit profile
                                </Link>
                              </Menu.Item>
                              <Menu.Item value="logout" onClick={onLogout}>
                                logout
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    ) : (
                      <Button as={RouterLink} to="/login" size="sm" variant="outline" colorPalette="neutral">
                        Login
                      </Button>
                    )}
                </HStack>

                <HStack
                    order={{ base: 3, md: 2 }}
                    flex={{ base: "1 0 100%", md: "1" }}
                    minW={0}
                    as="form"
                    onSubmit={submitCatalogSearch}
                    gap={2}
                >
                    <Input
                        placeholder="Search"
                        size="sm"
                        width="100%"
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                    />
                    <IconButton type="submit" aria-label="Search catalog" size="sm">
                        <LuSearch size={ICON_SIZE} />
                    </IconButton>
                </HStack>

                  <HStack
                    order={{ base: 4, md: 4 }}
                    spacing={{ base: 2, md: 4 }}
                    flexWrap="wrap"
                    w={{ base: "100%", md: "auto" }}
                  >
                    <Menu.Root>
                        <Menu.Trigger asChild>
                        <Button variant="outline" colorPalette="neutral" size="sm">
                                Categories <FaChevronDown />
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content maxH="320px" overflowY="auto">
                                    {categoriesLoading ? (
                                      Array.from({ length: 6 }).map((_, idx) => (
                                        <Menu.Item key={`categories-skel-${idx}`} value={`categories-skel-${idx}`} disabled>
                                          <Skeleton h="12px" w="160px" />
                                        </Menu.Item>
                                      ))
                                    ) : (categoriesData?.categories ?? []).length > 0 ? (
                                      (categoriesData?.categories ?? []).filter((c) => c?.slug).map((c) => (
                                        <Menu.Item
                                          asChild
                                          key={c?.id ?? c?._id ?? c?.slug}
                                          value={c?.slug ?? c?.name}
                                        >
                                          {/* Navigate to Catalog with a single category slug filter */}
                                          <Link as={RouterLink} to={`/catalog?category=${encodeURIComponent(c.slug)}`}>
                                            {c?.name ?? c?.slug}
                                          </Link>
                                        </Menu.Item>
                                      ))
                                    ) : (
                                      <Menu.Item value="categories-empty" disabled>
                                        No categories
                                      </Menu.Item>
                                    )}
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>

                    <Menu.Root>
                        <Menu.Trigger asChild>
                        <Button variant="outline" colorPalette="neutral" size="sm">
                                Brands <FaChevronDown />
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content maxH="320px" overflowY="auto">
                                    {brandsLoading ? (
                                      Array.from({ length: 6 }).map((_, idx) => (
                                        <Menu.Item key={`brands-skel-${idx}`} value={`brands-skel-${idx}`} disabled>
                                          <Skeleton h="12px" w="160px" />
                                        </Menu.Item>
                                      ))
                                    ) : (brandsData?.brands ?? []).length > 0 ? (
                                      (brandsData?.brands ?? []).filter((b) => b?.slug).map((b) => (
                                        <Menu.Item
                                          asChild
                                          key={b?.id ?? b?._id ?? b?.slug}
                                          value={b?.slug ?? b?.name}
                                        >
                                          {/* Navigate to Catalog with a single brand slug filter */}
                                          <Link as={RouterLink} to={`/catalog?brand=${encodeURIComponent(b.slug)}`}>
                                            {b?.name ?? b?.slug}
                                          </Link>
                                        </Menu.Item>
                                      ))
                                    ) : (
                                      <Menu.Item value="brands-empty" disabled>
                                        No brands
                                      </Menu.Item>
                                    )}
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>

                    <Link as={RouterLink} to="/orders" fontWeight="500">
                        Orders
                    </Link>
                </HStack>
            </Flex>
        </Box>
    )
}

export default Nav
