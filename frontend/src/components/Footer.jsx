import { IoHeart } from "react-icons/io5";
import { IoLogoGithub } from "react-icons/io";
import { FaLinkedin } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { Box, HStack, Text, Link } from "@chakra-ui/react";
import { ICON_SIZE } from "../constants/ui";

const Footer = () => {
    return(
        <Box as="footer" borderTop="1px solid" borderColor="gray.200" px={6} py={4}>
            <HStack spacing={6} align="center" justify="center" flexWrap="wrap">
                <HStack spacing={1} align="center">
                    <Text fontSize="sm">Made With</Text>
                    <IoHeart size={ICON_SIZE} />
                    <Text fontSize="sm">Love By Mahmoud Ahmed</Text>
                </HStack>
                <HStack spacing={4}>
                    <Link href="https://github.com/mahmoud-abdelsabour" isExternal aria-label="GitHub">
                        <IoLogoGithub size={ICON_SIZE} />
                    </Link>
                    <Link href="https://www.linkedin.com" isExternal aria-label="LinkedIn">
                        <FaLinkedin size={ICON_SIZE} />
                    </Link>
                    <Link href="mailto:mahmoud.abdelsabur03@gmail.com" aria-label="Email">
                        <IoIosMail size={ICON_SIZE} />
                    </Link>
                </HStack>
            </HStack>
        </Box>
    )
}

export default Footer
