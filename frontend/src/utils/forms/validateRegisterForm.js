// Global validation helpers (reusable across forms).
// This file implements the registration-specific validation using shared rules.

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Keep frontend validation aligned with backend Joi:
// - 8+ chars
// - at least 1 lowercase, 1 uppercase, 1 number, 1 special (@$!%*?&)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/

// Egypt mobile format (backend expects local format, not +20).
const phoneRegex = /^01[0125][0-9]{8}$/

export const validateRegisterForm = (values) => {
  const errors = {}

  const firstName = String(values?.firstName ?? "").trim()
  const lastName = String(values?.lastName ?? "").trim()
  const username = String(values?.username ?? "").trim()
  const normalizedEmail = String(values?.email ?? "").trim().toLowerCase()
  const password = String(values?.password ?? "")
  const confirmPassword = String(values?.confirmPassword ?? "")
  const normalizedPhone = String(values?.phone ?? "").trim()

  if (!firstName) errors.firstName = "First name is required."
  if (!lastName) errors.lastName = "Last name is required."

  if (!username) errors.username = "Username is required."
  else if (username.length < 3 || username.length > 30) {
    errors.username = "Username must be 3–30 characters."
  }

  if (!normalizedEmail) errors.email = "Email is required."
  else if (!emailRegex.test(normalizedEmail)) errors.email = "Enter a valid email address."

  if (!password) errors.password = "Password is required."
  else if (password.length < 8 || !passwordRegex.test(password)) {
    errors.password =
      "Password must be 8+ chars and include uppercase, lowercase, number, and special character."
  }

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password."
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match."

  if (!normalizedPhone) errors.phone = "Phone is required."
  else if (!phoneRegex.test(normalizedPhone)) {
    errors.phone = "Phone must match Egypt format (e.g. 01012345678)."
  }

  return errors
}

