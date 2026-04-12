import { useContext } from "react"
import { CartDrawerContext } from "../contexts/cartDrawerContext"

export const useCartDrawer = () => useContext(CartDrawerContext)
