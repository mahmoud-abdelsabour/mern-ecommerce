// Registration form state lives here so the page stays focused on rendering.

export const initialRegisterFormState = {
  values: {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  },
  fieldErrors: {},
  formError: "",
}

export const registerFormReducer = (state, action) => {
  switch (action.type) {
    case "set_field":
      return { ...state, values: { ...state.values, [action.field]: action.value } }
    case "set_field_errors":
      return { ...state, fieldErrors: action.errors || {} }
    case "set_form_error":
      return { ...state, formError: action.message || "" }
    case "clear_errors":
      return { ...state, fieldErrors: {}, formError: "" }
    case "reset":
      return initialRegisterFormState
    default:
      return state
  }
}

