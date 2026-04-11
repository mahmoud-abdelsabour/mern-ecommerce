const FLASH_KEY = "app:flash"

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const setFlash = (flash) => {
  try {
    if (!flash) return
    const { status, title } = flash
    if (!title) return
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ status, title }))
  } catch {
    // ignore storage failures
  }
}

const consumeFlash = () => {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY)
    if (!raw) return null
    sessionStorage.removeItem(FLASH_KEY)
    return safeJsonParse(raw)
  } catch {
    return null
  }
}

export { setFlash, consumeFlash }

