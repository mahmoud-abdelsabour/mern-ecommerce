import {
  Box,
  Button,
  Field,
  Fieldset,
  Flex,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useReducer } from "react"
import { useRegister } from "../../hooks/useAuth"
import GlobalNotification from "../../components/GlobalNotification"
import { notify } from "../../utils/notify"
import { initialRegisterFormState, registerFormReducer } from "../../utils/forms/registerFormState"
import { validateRegisterForm } from "../../utils/forms/validateRegisterForm"

const Register = () => {
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(registerFormReducer, initialRegisterFormState)
  const { values, fieldErrors, formError } = state

  // Keep the mutation logic in a hook, but keep UI errors local to this page.
  const registerMutation = useRegister({
    onSuccess: () => {
      notify.success("Account created", "You can now sign in with your email and password.")
      navigate("/login", { replace: true })
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Registration failed"
      dispatch({ type: "set_form_error", message })
    },
  })

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch({ type: "set_form_error", message: "" })

    const errors = validateRegisterForm(values)
    dispatch({ type: "set_field_errors", errors })
    if (Object.keys(errors).length > 0) return

    registerMutation.mutate({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      phone: values.phone.trim(),
    })
  }

  return (
    <Flex minH="70vh" align="center" justify="center" px={4}>
      <Box as="form" onSubmit={onSubmit} w="100%" maxW="420px">
        <Fieldset.Root size="lg" maxW="md" borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={{ base: 4, md: 6 }} invalid={Boolean(formError) || Object.keys(fieldErrors).length > 0}>
          <Stack mb={4}>
            <Fieldset.Legend>Register</Fieldset.Legend>
            <Text fontSize="sm" color="text.secondary">
              Create your account to place orders and track purchases.
            </Text>
          </Stack>

          <Fieldset.Content gap={4}>
            <GlobalNotification status="error" title={formError} />

            <HStack gap={3} flexWrap="wrap">
              <Field.Root flex="1" minW="180px" invalid={Boolean(fieldErrors.firstName)}>
                <Field.Label>First name</Field.Label>
                <Input
                  name="firstName"
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={(e) =>
                    dispatch({ type: "set_field", field: "firstName", value: e.target.value })
                  }
                />
                {fieldErrors.firstName && (
                  <Text fontSize="xs" color="state.error">
                    {fieldErrors.firstName}
                  </Text>
                )}
              </Field.Root>
              <Field.Root flex="1" minW="180px" invalid={Boolean(fieldErrors.lastName)}>
                <Field.Label>Last name</Field.Label>
                <Input
                  name="lastName"
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={(e) =>
                    dispatch({ type: "set_field", field: "lastName", value: e.target.value })
                  }
                />
                {fieldErrors.lastName && (
                  <Text fontSize="xs" color="state.error">
                    {fieldErrors.lastName}
                  </Text>
                )}
              </Field.Root>
            </HStack>

            <Field.Root invalid={Boolean(fieldErrors.username)}>
              <Field.Label>Username</Field.Label>
              <Input
                name="username"
                autoComplete="username"
                value={values.username}
                onChange={(e) =>
                  dispatch({ type: "set_field", field: "username", value: e.target.value })
                }
              />
              {fieldErrors.username && (
                <Text fontSize="xs" color="state.error">
                  {fieldErrors.username}
                </Text>
              )}
            </Field.Root>

            <Field.Root invalid={Boolean(fieldErrors.email)}>
              <Field.Label>Email address</Field.Label>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
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
                autoComplete="new-password"
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

            <Field.Root invalid={Boolean(fieldErrors.confirmPassword)}>
              <Field.Label>Confirm password</Field.Label>
              <Input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(e) =>
                  dispatch({
                    type: "set_field",
                    field: "confirmPassword",
                    value: e.target.value,
                  })
                }
              />
              {fieldErrors.confirmPassword && (
                <Text fontSize="xs" color="state.error">
                  {fieldErrors.confirmPassword}
                </Text>
              )}
            </Field.Root>

            <Field.Root invalid={Boolean(fieldErrors.phone)}>
              <Field.Label>Phone</Field.Label>
              <Input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="01012345678"
                value={values.phone}
                onChange={(e) =>
                  dispatch({ type: "set_field", field: "phone", value: e.target.value })
                }
              />
              {fieldErrors.phone && (
                <Text fontSize="xs" color="state.error">
                  {fieldErrors.phone}
                </Text>
              )}
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" alignSelf="flex-start" colorPalette="brand" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
          <Button as={RouterLink} to="/login" variant="link" colorPalette="brand" size="sm" alignSelf="flex-start">
            Already a user? Login
          </Button>
        </Fieldset.Root>
      </Box>
    </Flex>
  )
}

export default Register
