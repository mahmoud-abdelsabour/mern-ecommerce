import { appToaster } from "./appToaster"

const DURATION = {
  success: 3600,
  error: 7000,
  warning: 5000,
  info: 4500,
}

/** Normalize Axios / network errors for user-facing copy. */
export const formatApiError = (err) =>
  err?.response?.data?.message ??
  err?.response?.data?.error ??
  err?.message ??
  "Something went wrong. Please try again."

const base = (type, title, description, duration) => {
  if (!title && !description) return
  appToaster.create({
    type,
    title: title || (typeof description === "string" ? description : "Notice"),
    description: description && title ? description : undefined,
    duration: duration ?? DURATION[type] ?? DURATION.info,
    closable: true,
  })
}

const isProbablyAxiosError = (v) =>
  Boolean(v && typeof v === "object" && ("response" in v || v?.name === "AxiosError"))

export const notify = {
  success: (title, description) => base("success", title, description, DURATION.success),
  /** Second arg may be a string detail or an error object (Axios / thrown). */
  error: (title, detail) => {
    const description = isProbablyAxiosError(detail) ? formatApiError(detail) : detail
    base("error", title, description, DURATION.error)
  },
  warning: (title, description) => base("warning", title, description, DURATION.warning),
  info: (title, description) => base("info", title, description, DURATION.info),
}
