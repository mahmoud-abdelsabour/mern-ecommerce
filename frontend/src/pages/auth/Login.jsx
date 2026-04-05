import {
  Box,
  Button,
  Field,
  Fieldset,
  Flex,
  Input,
  Stack,
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"


const Login = () => {
  return (
    <Flex minH="70vh" align="center" justify="center" px={4}>
      <Box w="100%" maxW="420px">
        <Fieldset.Root size="lg" maxW="md" invalid>
          <Stack>
            <Fieldset.Legend>Login</Fieldset.Legend>
          </Stack>

          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Email address</Field.Label>
              <Input name="email" type="email" />
            </Field.Root>

            <Field.Root>
              <Field.Label>Password</Field.Label>
              <Input name="password" type="password" />
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" alignSelf="flex-start">
            Submit
          </Button>
          <Button as={RouterLink} to="/register" variant="link" size="sm" alignSelf="flex-start">
            Not a user? Register
          </Button>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}



export default Login
