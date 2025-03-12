import { useLayoutEffect, useEffect } from "react";

/**
 * A hook that uses useLayoutEffect in the browser and useEffect during SSR
 * This helps prevent hydration warnings when using effects that modify the DOM
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
