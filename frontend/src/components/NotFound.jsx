import { EmptyState, VStack, Flex, Button } from "@chakra-ui/react"
import { TbRouteX2 } from "react-icons/tb";
import { Link as RouterLink } from "react-router-dom"

const NotFound = () => {
    return(
        <Flex minH="70vh" align="center" justify="center">
            <EmptyState.Root size={"lg"}>
            <EmptyState.Content>
                <EmptyState.Indicator>
                <TbRouteX2 />
                </EmptyState.Indicator>
                <VStack textAlign="center">
                <EmptyState.Title>404 Not Found</EmptyState.Title>
                <EmptyState.Description>
                    Page is not found it may be moved or deleted from the server
                </EmptyState.Description>
                <Button as={RouterLink} to="/" colorPalette="brand">
                    Home
                </Button>
                </VStack>
            </EmptyState.Content>
            </EmptyState.Root>
        </Flex>
    )
}

export default NotFound