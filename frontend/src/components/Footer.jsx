import { Box, HStack, Link, Separator, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { FaCcMastercard, FaCcPaypal, FaCcVisa, FaLinkedin } from "react-icons/fa"
import { IoIosMail } from "react-icons/io"
import { IoHeart, IoLogoGithub } from "react-icons/io5"
import { ICON_SIZE } from "../constants/ui"
import { getToken } from "../APIs/http"

const FooterLink = ({ to, children, ...rest }) => (
  <Text
    as={RouterLink}
    to={to}
    fontSize="sm"
    color="text.secondary"
    _hover={{ color: "brand.600" }}
    display="block"
    {...rest}
  >
    {children}
  </Text>
)

const Footer = () => {
  const isLoggedIn = Boolean(getToken())

  return (
    <Box as="footer" borderTopWidth="1px" borderColor="surface.border" bg="surface.subtle" mt="auto">
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 12 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={{ base: 8, md: 10 }}>
          <Stack gap={3} align="start">
            <Text fontSize="sm" fontWeight="800" color="text.primary" letterSpacing="wide">
              Shop
            </Text>
            <FooterLink to="/catalog">Catalog</FooterLink>
            <FooterLink to="/cart">Cart</FooterLink>
            <FooterLink to="/wishlist">Wishlist</FooterLink>
            <FooterLink to="/order/check-out">Checkout</FooterLink>
          </Stack>

          <Stack gap={3} align="start">
            <Text fontSize="sm" fontWeight="800" color="text.primary" letterSpacing="wide">
              Help
            </Text>
            <Text fontSize="sm" color="text.secondary">
              Questions? Email us anytime.
            </Text>
            <Link
              href="mailto:mahmoud.abdelsabur03@gmail.com"
              fontSize="sm"
              color="brand.600"
              fontWeight="600"
            >
              Contact support
            </Link>
          </Stack>

          <Stack gap={3} align="start">
            <Text fontSize="sm" fontWeight="800" color="text.primary" letterSpacing="wide">
              Account
            </Text>
            {isLoggedIn ? (
              <>
                <FooterLink to="/me">Profile</FooterLink>
                <FooterLink to="/orders">Orders</FooterLink>
              </>
            ) : (
              <>
                <FooterLink to="/login">Log in</FooterLink>
                <FooterLink to="/register">Create account</FooterLink>
              </>
            )}
          </Stack>

          <Stack gap={3} align="start">
            <Text fontSize="sm" fontWeight="800" color="text.primary" letterSpacing="wide">
              Legal
            </Text>
            <Text fontSize="sm" color="text.secondary" lineHeight="1.6">
              Terms, privacy, and returns policies apply at checkout and on your order confirmation.
            </Text>
          </Stack>
        </SimpleGrid>

        <Separator my={10} borderColor="surface.border" />

        <Stack
          gap={6}
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          justify="space-between"
        >
          <HStack spacing={1} flexWrap="wrap" justify={{ base: "center", md: "flex-start" }}>
            <Text fontSize="sm" color="text.secondary">
              Made with
            </Text>
            <IoHeart size={ICON_SIZE} color="var(--chakra-colors-red-400)" />
            <Text fontSize="sm" color="text.secondary">
              by Mahmoud Ahmed
            </Text>
          </HStack>

          <HStack spacing={4} justify="center">
            <Link href="https://github.com/mahmoud-abdelsabour" isExternal aria-label="GitHub">
              <IoLogoGithub size={ICON_SIZE} color="var(--chakra-colors-text-secondary)" />
            </Link>
            <Link href="https://www.linkedin.com" isExternal aria-label="LinkedIn">
              <FaLinkedin size={ICON_SIZE} color="var(--chakra-colors-text-secondary)" />
            </Link>
            <Link href="mailto:mahmoud.abdelsabur03@gmail.com" aria-label="Email">
              <IoIosMail size={ICON_SIZE} color="var(--chakra-colors-text-secondary)" />
            </Link>
          </HStack>

          <HStack spacing={3} justify={{ base: "center", md: "flex-end" }} color="text.muted">
            <FaCcVisa size={36} aria-label="Visa" />
            <FaCcMastercard size={36} aria-label="Mastercard" />
            <FaCcPaypal size={36} aria-label="PayPal" />
          </HStack>
        </Stack>
      </Box>
    </Box>
  )
}

export default Footer
