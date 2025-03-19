// src/provider/LoadingProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";

// Debug flag - set to false before production
const DEBUG = false;

// Define resource types for tracking
export type ResourceType = "model" | "texture" | "font" | "script" | "other";

// Interface for resource loading status
interface Resource {
  id: string;
  type: ResourceType;
  loaded: boolean;
  weight: number; // Importance weight (higher = more important)
  progress?: number; // 0-1 for partial loading
  timeRegistered: number;
}

interface LoadingManagerContextType {
  // Resource registration
  registerResource: (id: string, type: ResourceType, weight?: number) => void;

  // Update resource loading status
  setResourceLoaded: (id: string, loaded: boolean) => void;
  setResourceProgress: (id: string, progress: number) => void;

  // Overall loading status
  isLoading: boolean;
  progress: number; // 0-100
  criticalResourcesLoaded: boolean;

  // Control
  startLoading: () => void;
  finishLoading: (force?: boolean) => void;
}

const LoadingManagerContext = createContext<LoadingManagerContextType | null>(
  null,
);

export const useLoadingManager = () => {
  const context = useContext(LoadingManagerContext);
  if (!context) {
    throw new Error("useLoadingManager must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
  minimumLoadingTime?: number; // Minimum time to show loading screen (ms)
  graceTime?: number; // Additional time after loading to ensure smoothness (ms)
}

// Debug logging utility
const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    if (data) {
      console.log(`[LoadingProvider Debug] ${message}`, data);
    } else {
      console.log(`[LoadingProvider Debug] ${message}`);
    }
  }
};

// Error logging utility
const logError = (message: string, error?: any) => {
  console.error(`[LoadingProvider Error] ${message}`, error);
};

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  minimumLoadingTime = 2000,
  graceTime = 500,
}) => {
  // Track all resources that need to be loaded
  // IMPORTANT: Using useRef instead of useState to prevent re-render cycles
  const resourcesMapRef = useRef<Map<string, Resource>>(new Map());
  const [resourceKeys, setResourceKeys] = useState<string[]>([]);

  // Overall loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  const [forceFinish, setForceFinish] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track if provider has been initialized
  const hasInitializedRef = useRef(false);

  // Force a re-render to update progress calculation
  const triggerProgressUpdate = () => {
    setResourceKeys([...resourcesMapRef.current.keys()]);
  };

  // Calculate progress
  const calculateProgress = () => {
    try {
      const resources = resourcesMapRef.current;

      // If no resources registered, consider progress at 100%
      if (resources.size === 0) {
        return 100;
      }

      let totalWeight = 0;
      let loadedWeight = 0;

      resources.forEach((resource) => {
        totalWeight += resource.weight;
        loadedWeight +=
          resource.weight * (resource.progress || (resource.loaded ? 1 : 0));
      });

      return totalWeight > 0
        ? Math.floor((loadedWeight / totalWeight) * 100)
        : 100;
    } catch (error) {
      logError("Error calculating progress", error);
      return 100; // Default to 100% on error
    }
  };

  // Check critical resources
  const checkCriticalResourcesLoaded = () => {
    try {
      const resources = resourcesMapRef.current;

      // If no resources registered, consider critical resources loaded
      if (resources.size === 0) {
        return true;
      }

      let hasCritical = false;
      const criticalResources: string[] = [];
      const unloadedCritical: string[] = [];

      for (const [id, resource] of resources.entries()) {
        if (resource.weight > 1) {
          hasCritical = true;
          criticalResources.push(id);
          if (!resource.loaded) {
            unloadedCritical.push(id);
          }
        }
      }

      // If there are no critical resources, check if overall progress is high enough
      if (!hasCritical) {
        const progress = calculateProgress();
        return progress >= 85; // Consider mostly loaded as good enough if no critical resources
      }

      return unloadedCritical.length === 0;
    } catch (error) {
      logError("Error checking critical resources", error);
      return true; // Default to true on error
    }
  };

  // Memoized values to prevent unnecessary calculation
  const progress = useMemo(() => calculateProgress(), [resourceKeys]);
  const criticalResourcesLoaded = useMemo(
    () => checkCriticalResourcesLoaded(),
    [resourceKeys],
  );

  // Register a new resource to track
  const registerResource = (id: string, type: ResourceType, weight = 1) => {
    // Check if resource already exists to prevent duplicate registration
    if (!resourcesMapRef.current.has(id)) {
      logDebug(`Registering resource: ${id} (${type}, weight: ${weight})`);

      // Add to resources map without using state
      resourcesMapRef.current.set(id, {
        id,
        type,
        loaded: false,
        weight,
        progress: 0,
        timeRegistered: Date.now(),
      });

      // Trigger re-render to update progress
      triggerProgressUpdate();

      // Auto-complete resources after timeout
      const timeout = setTimeout(() => {
        const resource = resourcesMapRef.current.get(id);
        if (resource && !resource.loaded) {
          logDebug(`Auto-completing timed-out resource: ${id}`);
          setResourceLoaded(id, true);
        }
      }, 8000); // 8 second timeout

      return true;
    }

    return false;
  };

  // Mark a resource as loaded
  const setResourceLoaded = (id: string, loaded: boolean) => {
    logDebug(`Setting resource ${id} loaded: ${loaded}`);

    // Get existing resource
    const resource = resourcesMapRef.current.get(id);

    if (resource) {
      // Update resource without using setState
      resourcesMapRef.current.set(id, {
        ...resource,
        loaded,
        progress: loaded ? 1 : resource.progress,
      });
    } else {
      // Resource wasn't registered yet, register it now
      logDebug(`Auto-registering resource ${id} with loaded: ${loaded}`);
      resourcesMapRef.current.set(id, {
        id,
        type: "other" as ResourceType,
        loaded,
        weight: 1,
        progress: loaded ? 1 : 0,
        timeRegistered: Date.now(),
      });
    }

    // Trigger re-render to update progress
    triggerProgressUpdate();
  };

  // Update partial loading progress of a resource
  const setResourceProgress = (id: string, progress: number) => {
    const normalizedProgress = Math.max(0, Math.min(1, progress));

    // Get existing resource
    const resource = resourcesMapRef.current.get(id);

    if (resource) {
      // Update resource without using setState
      resourcesMapRef.current.set(id, {
        ...resource,
        progress: normalizedProgress,
        loaded: normalizedProgress >= 1,
      });
    } else {
      // Resource wasn't registered yet, register it now
      resourcesMapRef.current.set(id, {
        id,
        type: "other" as ResourceType,
        loaded: normalizedProgress >= 1,
        weight: 1,
        progress: normalizedProgress,
        timeRegistered: Date.now(),
      });
    }

    // Trigger re-render to update progress
    triggerProgressUpdate();
  };

  // Start loading process
  const startLoading = () => {
    logDebug("Starting loading process");
    setLoadingStartTime(Date.now());
    setIsLoading(true);
    setForceFinish(false);
  };

  // Force finish loading
  const finishLoading = (force = false) => {
    if (force) {
      logDebug("Force finishing loading");
      setForceFinish(true);
    }
  };

  // Set a maximum loading time to prevent infinite loading
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    logDebug("LoadingProvider initialized");

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to force loading to end after 12 seconds
    timeoutRef.current = setTimeout(() => {
      logDebug("Maximum loading time reached, forcing completion");
      setForceFinish(true);
    }, 10000);

    // Register a default resource
    registerResource("default-fallback-resource", "other", 1);

    // Mark it as loaded after a short delay
    setTimeout(() => {
      logDebug("Completing default resource");
      setResourceLoaded("default-fallback-resource", true);
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Automatically manage loading state based on resources and minimum time
  useEffect(() => {
    if (!isLoading) return;

    // Check if we can finish loading
    const checkLoadingStatus = () => {
      const timeElapsed = Date.now() - loadingStartTime;
      const minTimeReached = timeElapsed >= minimumLoadingTime;

      // Conditions to finish loading:
      // 1. Minimum time has elapsed
      // 2. Either critical resources are loaded or forced finish
      // 3. Progress is acceptable or forced finish
      const shouldFinish =
        minTimeReached &&
        (criticalResourcesLoaded ||
          forceFinish ||
          resourcesMapRef.current.size === 0) &&
        (progress >= 95 || forceFinish || resourcesMapRef.current.size === 0);

      if (shouldFinish) {
        // Add a small grace period before finishing
        logDebug(
          `Loading complete: progress=${progress}, criticalLoaded=${criticalResourcesLoaded}, forced=${forceFinish}`,
        );

        setTimeout(() => {
          logDebug("Setting isLoading to false");
          setIsLoading(false);
        }, graceTime);

        return true;
      }
      return false;
    };

    // Initial check
    if (checkLoadingStatus()) return;

    // Regular checking interval
    const intervalId = setInterval(() => {
      if (checkLoadingStatus()) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [
    isLoading,
    criticalResourcesLoaded,
    progress,
    loadingStartTime,
    minimumLoadingTime,
    graceTime,
    forceFinish,
  ]);

  const contextValue = {
    registerResource,
    setResourceLoaded,
    setResourceProgress,
    isLoading,
    progress,
    criticalResourcesLoaded,
    startLoading,
    finishLoading,
  };

  return (
    <LoadingManagerContext.Provider value={contextValue}>
      {children}

      {/* Debug overlay during development */}
      {DEBUG && isLoading && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            zIndex: 9999,
            maxWidth: 300,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          <div>Loading: {progress}%</div>
          <div>
            Time: {((Date.now() - loadingStartTime) / 1000).toFixed(1)}s
          </div>
          <div>Resources: {resourcesMapRef.current.size}</div>
          <div>Critical loaded: {criticalResourcesLoaded ? "Yes" : "No"}</div>
          <div>Force finish: {forceFinish ? "Yes" : "No"}</div>
        </div>
      )}
    </LoadingManagerContext.Provider>
  );
};
