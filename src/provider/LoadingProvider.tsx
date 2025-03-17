"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

// Define resource types for tracking
export type ResourceType = "model" | "texture" | "font" | "script" | "other";

// Interface for resource loading status
interface Resource {
  id: string;
  type: ResourceType;
  loaded: boolean;
  weight: number; // Importance weight (higher = more important)
  progress?: number; // 0-1 for partial loading
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

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  minimumLoadingTime = 2000,
  graceTime = 500,
}) => {
  // Track all resources that need to be loaded
  const [resources, setResources] = useState<Map<string, Resource>>(new Map());

  // Overall loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  const [forceFinish, setForceFinish] = useState(false);

  // Register a new resource to track
  const registerResource = (id: string, type: ResourceType, weight = 1) => {
    setResources((prev) => {
      const newResources = new Map(prev);
      // Only add if it doesn't exist
      if (!newResources.has(id)) {
        newResources.set(id, {
          id,
          type,
          loaded: false,
          weight,
          progress: 0,
        });
      }
      return newResources;
    });
  };

  // Mark a resource as loaded
  const setResourceLoaded = (id: string, loaded: boolean) => {
    setResources((prev) => {
      const newResources = new Map(prev);
      const resource = newResources.get(id);
      if (resource) {
        newResources.set(id, {
          ...resource,
          loaded,
          progress: loaded ? 1 : resource.progress,
        });
      }
      return newResources;
    });
  };

  // Update partial loading progress of a resource
  const setResourceProgress = (id: string, progress: number) => {
    setResources((prev) => {
      const newResources = new Map(prev);
      const resource = newResources.get(id);
      if (resource) {
        newResources.set(id, {
          ...resource,
          progress: Math.max(0, Math.min(1, progress)),
          loaded: progress >= 1,
        });
      }
      return newResources;
    });
  };

  // Calculate overall loading progress
  const progress = useMemo(() => {
    if (resources.size === 0) return 0;

    let totalWeight = 0;
    let loadedWeight = 0;

    resources.forEach((resource) => {
      totalWeight += resource.weight;
      loadedWeight +=
        resource.weight * (resource.progress || (resource.loaded ? 1 : 0));
    });

    return totalWeight > 0 ? Math.floor((loadedWeight / totalWeight) * 100) : 0;
  }, [resources]);

  // Check if critical resources are loaded (resources with weight > 1)
  const criticalResourcesLoaded = useMemo(() => {
    let hasCritical = false;

    for (const resource of resources.values()) {
      if (resource.weight > 1) {
        hasCritical = true;
        if (!resource.loaded) {
          return false;
        }
      }
    }

    // If there are no critical resources, check if overall progress is high enough
    if (!hasCritical) {
      return progress >= 85; // Consider mostly loaded as good enough if no critical resources
    }

    return true;
  }, [resources, progress]);

  // Start loading process
  const startLoading = () => {
    setLoadingStartTime(Date.now());
    setIsLoading(true);
    setForceFinish(false);
  };

  // Force finish loading
  const finishLoading = (force = false) => {
    if (force) {
      setForceFinish(true);
    }
  };

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
      // 3. Overall progress is acceptable or forced finish
      if (
        minTimeReached &&
        (criticalResourcesLoaded || forceFinish) &&
        (progress >= 95 || forceFinish)
      ) {
        // Add a small grace period before finishing
        setTimeout(() => {
          setIsLoading(false);
        }, graceTime);
      }
    };

    // Check status initially and when dependencies change
    checkLoadingStatus();

    // Also set up a timer to periodically check status
    const intervalId = setInterval(checkLoadingStatus, 100);

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

  // Automatically start loading on mount
  useEffect(() => {
    startLoading();
  }, []);

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
    </LoadingManagerContext.Provider>
  );
};
