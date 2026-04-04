import logo from '../assets/logo.svg'
import { Input, IconButton, Button, Menu, Portal, Avatar, HStack, Link, Flex, Box } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { LuSearch } from "react-icons/lu"
import { FaCartShopping } from "react-icons/fa6";
import { MdFavorite } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { ICON_SIZE } from "../constants/ui";

const Nav = () => {
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
                                <Menu.Content>
                                    <Menu.Item value="new-txt">New Text File</Menu.Item>
                                    <Menu.Item value="new-file">New File...</Menu.Item>
                                    <Menu.Item value="new-win">New Window</Menu.Item>
                                    <Menu.Item value="open-file">Open File...</Menu.Item>
                                    <Menu.Item value="export">Export</Menu.Item>
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
                                <Menu.Content>
                                    <Menu.Item value="new-txt">New Text File</Menu.Item>
                                    <Menu.Item value="new-file">New File...</Menu.Item>
                                    <Menu.Item value="new-win">New Window</Menu.Item>
                                    <Menu.Item value="open-file">Open File...</Menu.Item>
                                    <Menu.Item value="export">Export</Menu.Item>
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
                    <Menu.Root>
                    <Menu.Trigger asChild>
                        <Button variant='unstyled' p={0} minW='unset'>
                            <Avatar.Root size="sm">
                                <Avatar.Fallback name="Oshigaki Kisame" />
                                <Avatar.Image src="https://example.com" />
                            </Avatar.Root>
                        </Button>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                        <Menu.Content>
                            <Menu.Item asChild value="new-txt">
                              <Link as={RouterLink} to="/profile">
                                view profile
                              </Link>
                            </Menu.Item>
                            <Menu.Item asChild value="new-file">
                              <Link as={RouterLink} to="/profile">
                                edit profile
                              </Link>
                            </Menu.Item>
                            <Menu.Item value="new-win">logout</Menu.Item>
                        </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                    </Menu.Root>
                </HStack>
            </Flex>
        </Box>
    )
}

export default Nav
