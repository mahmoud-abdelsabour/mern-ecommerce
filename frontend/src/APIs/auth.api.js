import axios from 'axios'
import { getAuthConfig } from "./http"

const baseURL = '/api/auth'

const register = async (userInfo) => {
    const response = await axios.post(`${baseURL}/register`, userInfo)
    return response.data
}

const login = async (credentials) => {
    const response = await axios.post(`${baseURL}/login`, credentials)
    return response.data
}

const updatePassword = async ({ userId, currentPassword, newPassword }) => {
    const response = await axios.patch(
        `${baseURL}/users/${userId}/update-password`,
        { currentPassword, newPassword },
        getAuthConfig()
    )
    return response.data
}

export default {
    register,
    login,
    updatePassword
}
