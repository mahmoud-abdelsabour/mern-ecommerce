const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/

export const isValidEmail = (value) => emailRegex.test(String(value ?? "").trim())

export const isStrongPassword = (value) => {
  const password = String(value ?? "")
  return password.length >= 8 && passwordRegex.test(password)
}

export const strongPasswordMessage =
  "Password must be 8+ chars and include uppercase, lowercase, number, and special character."
