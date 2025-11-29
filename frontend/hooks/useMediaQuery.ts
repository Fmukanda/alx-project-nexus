'use client';

import { useState, useEffect } from 'react';

// Common breakpoints for responsive design
export const breakpoints = {
  xs: '(max-width: 479px)',
  sm: '(min-width: 480px) and (max-width: 767px)',
  md: '(min-width: 768px) and (max-width: 1023px)',
  lg: '(min-width: 1024px) and (max-width: 1279px)',
  xl: '(min-width: 1280px) and (max-width: 1535px)',
  '2xl': '(min-width: 1536px)',
  
  // Mobile-first approach
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  
  // Specific features
  hover: '(hover: hover)', // Devices that support hover
  touch: '(hover: none) and (pointer: coarse)', // Touch devices
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
} as const;

type BreakpointKey = keyof typeof breakpoints;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define callback function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (modern approach with addEventListener)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

// Pre-defined hooks for common breakpoints
export function useIsMobile(): boolean {
  return useMediaQuery(breakpoints.mobile);
}

export function useIsTablet(): boolean {
  return useMediaQuery(breakpoints.tablet);
}

export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.desktop);
}

export function useIsSmallScreen(): boolean {
  return useMediaQuery(breakpoints.xs);
}

export function useIsMediumScreen(): boolean {
  return useMediaQuery(breakpoints.md);
}

export function useIsLargeScreen(): boolean {
  return useMediaQuery(breakpoints.lg);
}

export function useIsExtraLargeScreen(): boolean {
  return useMediaQuery(breakpoints.xl);
}

export function useIsHoverSupported(): boolean {
  return useMediaQuery(breakpoints.hover);
}

export function useIsTouchDevice(): boolean {
  return useMediaQuery(breakpoints.touch);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(breakpoints.reducedMotion);
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery(breakpoints.darkMode);
}

// Hook to get current breakpoint
export function useCurrentBreakpoint(): BreakpointKey {
  const breakpointEntries = Object.entries(breakpoints) as [BreakpointKey, string][];
  
  for (const [key, query] of breakpointEntries) {
    if (useMediaQuery(query)) {
      return key;
    }
  }
  
  return '2xl'; // Default to largest breakpoint
}

// Hook to check if screen is at least a certain breakpoint
export function useBreakpointAtLeast(breakpoint: BreakpointKey): boolean {
  const queries: Record<BreakpointKey, string> = {
    xs: '(min-width: 0px)',
    sm: '(min-width: 480px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
    mobile: '(min-width: 0px)',
    tablet: '(min-width: 768px)',
    desktop: '(min-width: 1024px)',
    hover: '(hover: hover)',
    touch: '(hover: none) and (pointer: coarse)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    darkMode: '(prefers-color-scheme: dark)',
  };

  return useMediaQuery(queries[breakpoint]);
}

// Hook to check if screen is at most a certain breakpoint
export function useBreakpointAtMost(breakpoint: BreakpointKey): boolean {
  const queries: Record<BreakpointKey, string> = {
    xs: '(max-width: 479px)',
    sm: '(max-width: 767px)',
    md: '(max-width: 1023px)',
    lg: '(max-width: 1279px)',
    xl: '(max-width: 1535px)',
    '2xl': '(max-width: 9999px)', // Essentially always true
    mobile: '(max-width: 767px)',
    tablet: '(max-width: 1023px)',
    desktop: '(max-width: 9999px)',
    hover: '(hover: hover)',
    touch: '(hover: none) and (pointer: coarse)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    darkMode: '(prefers-color-scheme: dark)',
  };

  return useMediaQuery(queries[breakpoint]);
}