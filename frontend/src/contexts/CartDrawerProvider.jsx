import { useCallback, useMemo, useState } from "react"
import CartDrawer from "../components/CartDrawer"
import { CartDrawerContext } from "./cartDrawerContext"

export const CartDrawerProvider = ({ children }) => {
  const [open, setOpen] = useState(false)

  const openCartDrawer = useCallback(() => setOpen(true), [])
  const closeCartDrawer = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({ openCartDrawer, closeCartDrawer }),
    [openCartDrawer, closeCartDrawer]
  )

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <CartDrawer open={open} onOpenChange={setOpen} />
    </CartDrawerContext.Provider>
  )
}
