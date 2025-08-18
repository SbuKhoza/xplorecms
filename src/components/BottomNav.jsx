"use client"

import { useState, useCallback } from "react"
import { FlatList } from "react-native"

// Custom hook for scroll tracking
export const useScrollTracking = () => {
  const [scrollY, setScrollY] = useState(0)

  const onScroll = useCallback((event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y
    setScrollY(currentScrollY)
  }, [])

  return {
    onScroll,
    scrollEventThrottle: 16,
    scrollY,
  }
}

// Enhanced FlatList component with scroll tracking
export const AnimatedFlatList = (props) => {
  return <FlatList {...props} />
}

// Default BottomNav component (if needed)
const BottomNav = () => {
  return null // Placeholder - implement your bottom navigation here
}

export default BottomNav
