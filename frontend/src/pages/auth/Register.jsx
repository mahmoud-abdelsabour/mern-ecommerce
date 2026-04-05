import {
  Box,
  Button,
  Field,
  Fieldset,
  Flex,
  HStack,
  Input,
  Stack,
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"


const Register = () => {
  return (
    <Flex minH="70vh" align="center" justify="center" px={4}>
      <Box w="100%" maxW="420px">
        <Fieldset.Root size="lg" maxW="md" invalid>
          <Stack>
            <Fieldset.Legend>Register</Fieldset.Legend>
          </Stack>

          <Fieldset.Content>
            <HStack gap={3} flexWrap="wrap">
              <Field.Root flex="1" minW="180px">
                <Field.Label>First name</Field.Label>
                <Input name="firstName" />
              </Field.Root>
              <Field.Root flex="1" minW="180px">
                <Field.Label>Last name</Field.Label>
                <Input name="lastName" />
              </Field.Root>
            </HStack>

            <Field.Root>
              <Field.Label>Username</Field.Label>
              <Input name="username" />
            </Field.Root>

            <Field.Root>
              <Field.Label>Email address</Field.Label>
              <Input name="email" type="email" placeholder="you@example.com"/>
            </Field.Root>

            <Field.Root>
              <Field.Label>Password</Field.Label>
              <Input name="password" type="password" />
            </Field.Root>

            <Field.Root>
              <Field.Label>Phone</Field.Label>
              <Input name="phone" type="tel" placeholder="+201xxxxxxxxx"/>
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" alignSelf="flex-start">
            Submit
          </Button>
          <Button as={RouterLink} to="/login" variant="link" size="sm" alignSelf="flex-start">
            Already a user? Login
          </Button>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}



export default Register
