import logo from '../assets/logo.svg'
import { Input, IconButton, Button, Menu, Portal, Avatar, HStack, Link, Flex, Box } from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { LuSearch } from "react-icons/lu"
import { FaCartShopping } from "react-icons/fa6";
import { MdFavorite } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { ICON_SIZE } from "../constants/ui";
import { useBrands } from "../hooks/useBrands";
import { useCategories } from "../hooks/useCategories";

const Nav = () => {
    const navigate = useNavigate()
    const { data: brandsData, isLoading: brandsLoading } = useBrands()
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories()

    // Read the logged-in user from localStorage (set on login).
    // Shape: `{ token, username, firstName, lastName, profilePhoto }`.
    let storedUser = null
    try {
        const raw = localStorage.getItem("user")
        storedUser = raw ? JSON.parse(raw) : null
    } catch {
        storedUser = null
    }

    const displayName =
        storedUser?.firstName || storedUser?.lastName
            ? `${storedUser?.firstName ?? ""} ${storedUser?.lastName ?? ""}`.trim()
            : storedUser?.username ?? "Guest"

    const onLogout = () => {
        localStorage.removeItem("user")
        navigate("/login", { replace: true })
    }

    return(
        <Box as="nav" borderBottom="1px solid" borderColor="gray.200" px={6} py={3}>
            <Flex align="center" gap={4}>
                <Link as={RouterLink} to="/" display="inline-flex" alignItems="center">
                    <img src={logo} alt="logo" style={{ height: 40, width: 'auto' }} />
                </Link>

                <Box flex="1">
                    <Input placeholder="Search" size="sm" width="100%" />
                </Box>
                    <IconButton aria-label="Search database" size="sm">
                        <LuSearch size={ICON_SIZE} />
                    </IconButton>

                <HStack spacing={4}>
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button variant="outline" size="sm">
                                Categories <FaChevronDown />
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content maxH="320px" overflowY="auto">
                                    {categoriesLoading ? (
                                      <Menu.Item value="categories-loading" disabled>
                                        Loading...
                                      </Menu.Item>
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
                            <Button variant="outline" size="sm">
                                Brands <FaChevronDown />
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content maxH="320px" overflowY="auto">
                                    {brandsLoading ? (
                                      <Menu.Item value="brands-loading" disabled>
                                        Loading...
                                      </Menu.Item>
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

                <HStack spacing={3}>
                    <Link as={RouterLink} to="/cart" >
                        <FaCartShopping size={ICON_SIZE} />
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
                      <Button as={RouterLink} to="/login" size="sm" variant="outline">
                        Login
                      </Button>
                    )}
                </HStack>
            </Flex>
        </Box>
    )
}

export default Nav
