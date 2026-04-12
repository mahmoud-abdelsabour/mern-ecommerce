import { SkeletonPropsProvider } from "@chakra-ui/react"

/**
 * App-wide Skeleton defaults to keep loading states cohesive.
 * Chakra v3 Skeleton supports `variant`: "pulse" | "shine" | "none".
 */
export const AppSkeletonProvider = ({ children }) => {
  return (
    <SkeletonPropsProvider value={{ variant: "shine" }}>
      {children}
    </SkeletonPropsProvider>
  )
}

