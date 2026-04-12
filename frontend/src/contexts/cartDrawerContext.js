import { createContext } from "react"

export const CartDrawerContext = createContext({
  openCartDrawer: () => {},
  closeCartDrawer: () => {},
})
