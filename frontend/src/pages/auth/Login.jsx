import { Box, Button, Field, Fieldset, Flex, Input, Stack, Text } from "@chakra-ui/react"
import { useReducer, useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import GlobalNotification from "../../components/GlobalNotification"
import { useLogin } from "../../hooks/useAuth"
import { initialLoginFormState, loginFormReducer } from "../../utils/forms/loginFormState"
import { setStoredUser } from "../../utils/authStorage"
import { consumeFlash } from "../../utils/flashStorage"
import { isStrongPassword, isValidEmail, strongPasswordMessage } from "../../utils/forms/authValidation"

const Login = () => {
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(loginFormReducer, initialLoginFormState)
  const { values, fieldErrors, formError } = state

  const [flash] = useState(() => consumeFlash())

  const loginMutation = useLogin({
    onSuccess: (result) => {
      // Persist token so `getAuthConfig()` can attach it automatically.
      // Backend returns: `{ token, username, firstName, lastName }`.
      // Also triggers auth-change listeners (e.g. auto-logout timer scheduling).
      setStoredUser(result)
      navigate("/", { replace: true })
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Login failed"
      dispatch({ type: "set_form_error", message })
    },
  })

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch({ type: "clear_errors" })

    const errors = {}
    const email = String(values.email ?? "").trim().toLowerCase()
    const password = String(values.password ?? "")

    if (!email) errors.email = "Email is required."
    if (!isValidEmail(email)) errors.email = "Enter a valid email address."
    if (!password) errors.password = "Password is required."
    else if (!isStrongPassword(password)) errors.password = strongPasswordMessage

    dispatch({ type: "set_field_errors", errors })
    if (Object.keys(errors).length > 0) return

    loginMutation.mutate({ email, password })
  }

  return (
    <Flex minH="70vh" align="center" justify="center" px={4}>
      <Box as="form" onSubmit={onSubmit} w="100%" maxW="420px">
        <Fieldset.Root
          size="lg"
          maxW="md"
          borderWidth="1px"
          borderColor="surface.border"
          bg="surface.panel"
          rounded="lg"
          p={{ base: 4, md: 6 }}
          invalid={Boolean(formError) || Object.keys(fieldErrors).length > 0}
        >
          <Stack mb={4}>
            <Fieldset.Legend>Login</Fieldset.Legend>
            <Text fontSize="sm" color="text.secondary">
              Sign in to continue shopping and manage your orders.
            </Text>
          </Stack>

          <Fieldset.Content gap={4}>
            <GlobalNotification status={flash?.status ?? "info"} title={flash?.title} />
            <GlobalNotification status="error" title={formError} />

            <Field.Root invalid={Boolean(fieldErrors.email)}>
              <Field.Label>Email address</Field.Label>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) =>
                  dispatch({ type: "set_field", field: "email", value: e.target.value })
                }
              />
              {fieldErrors.email && (
                <Text fontSize="xs" color="state.error">
                  {fieldErrors.email}
                </Text>
              )}
            </Field.Root>

            <Field.Root invalid={Boolean(fieldErrors.password)}>
              <Field.Label>Password</Field.Label>
              <Input
                name="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) =>
                  dispatch({ type: "set_field", field: "password", value: e.target.value })
                }
              />
              {fieldErrors.password && (
                <Text fontSize="xs" color="state.error">
                  {fieldErrors.password}
                </Text>
              )}
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" alignSelf="flex-start" colorPalette="brand" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
          <Button as={RouterLink} to="/register" variant="link" colorPalette="brand" size="sm" alignSelf="flex-start">
            Not a user? Register
          </Button>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}

export default Login
