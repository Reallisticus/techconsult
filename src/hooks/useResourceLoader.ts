// src/hooks/useResourceLoader.ts
import { useEffect, useRef } from "react";
import { ResourceType, useLoadingManager } from "~/provider/LoadingProvider";
import * as THREE from "three";

// Interface for tracked resources
interface TrackedResource {
  id: string;
  type: ResourceType;
  weight?: number;
}

/**
 * Hook to register and track resources for the loading manager
 */
export function useResourceLoader() {
  const { registerResource, setResourceLoaded, setResourceProgress } =
    useLoadingManager();

  // Track registered resources to prevent duplicate registration
  const registeredResourcesRef = useRef<Set<string>>(new Set());
  const resourceTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // IMPORTANT: This prevents re-registering resources on re-renders
  const hasRunSetupRef = useRef(false);

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      resourceTimeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  /**
   * Track loading of custom resource (e.g., API data, fonts)
   */
  const trackResource = (
    id: string,
    type: ResourceType = "other",
    weight = 1,
  ): TrackedResource => {
    // IMPORTANT: Only register if not already registered
    if (!registeredResourcesRef.current.has(id)) {
      registeredResourcesRef.current.add(id);
      registerResource(id, type, weight);

      // Set a timeout to automatically complete this resource
      const timeout = setTimeout(() => {
        console.warn(`Resource ${id} timed out. Marking as complete.`);
        setResourceLoaded(id, true);
      }, 10000);

      resourceTimeoutsRef.current.set(id, timeout);
    }

    return { id, type, weight };
  };

  /**
   * Update progress of a tracked resource
   */
  const updateResourceProgress = (
    resource: TrackedResource | string,
    progress: number,
  ) => {
    const id = typeof resource === "string" ? resource : resource.id;
    setResourceProgress(id, progress);
  };

  /**
   * Set a tracked resource as loaded
   */
  const setResourceComplete = (
    resource: TrackedResource | string,
    success = true,
  ) => {
    const id = typeof resource === "string" ? resource : resource.id;
    setResourceLoaded(id, success);

    // Clear the timeout for this resource
    const timeout = resourceTimeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      resourceTimeoutsRef.current.delete(id);
    }
  };

  // Methods for tracking specific resource types
  const trackTextureLoading = (
    url: string,
    options?: { id?: string; weight?: number },
  ) => {
    const resourceId = options?.id || `texture-${url}`;
    const resourceWeight = options?.weight || 1;

    // Track this resource
    trackResource(resourceId, "texture", resourceWeight);

    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    // Load with progress tracking
    return new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => {
          setResourceComplete(resourceId, true);
          resolve(texture);
        },
        (progress) => {
          if (progress.lengthComputable) {
            updateResourceProgress(
              resourceId,
              progress.loaded / progress.total,
            );
          }
        },
        (error) => {
          console.error(`Error loading texture ${url}:`, error);
          setResourceComplete(resourceId, true); // Mark as complete anyway
          reject(error);
        },
      );
    });
  };

  const trackModelLoading = (
    loader: any,
    url: string,
    options?: { id?: string; weight?: number },
  ) => {
    const resourceId = options?.id || `model-${url}`;
    const resourceWeight = options?.weight || 2;

    // Track this resource
    trackResource(resourceId, "model", resourceWeight);

    // Load with progress tracking
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (result: unknown) => {
          setResourceComplete(resourceId, true);
          resolve(result);
        },
        (progress: { loaded: number; total: number }) => {
          if (progress.total > 0) {
            updateResourceProgress(
              resourceId,
              progress.loaded / progress.total,
            );
          }
        },
        (error: ErrorEvent) => {
          console.error(`Error loading model ${url}:`, error);
          setResourceComplete(resourceId, true); // Mark as complete anyway
          reject(error);
        },
      );
    });
  };

  const trackImageLoading = (
    url: string,
    options?: { id?: string; weight?: number },
  ) => {
    const resourceId = options?.id || `image-${url}`;
    const resourceWeight = options?.weight || 1;

    // Track this resource
    trackResource(resourceId, "texture", resourceWeight);

    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        setResourceComplete(resourceId, true);
        resolve(img);
      };

      img.onerror = (error) => {
        console.error(`Error loading image ${url}:`, error);
        setResourceComplete(resourceId, true); // Mark as complete anyway
        reject(error);
      };

      img.src = url;
    });
  };

  return {
    trackTextureLoading,
    trackModelLoading,
    trackImageLoading,
    trackResource,
    updateResourceProgress,
    setResourceComplete,
  };
}
