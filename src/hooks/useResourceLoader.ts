// src/hooks/useResourceLoader.ts
import { useEffect } from "react";
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

  /**
   * Register and track a Three.js texture loading
   */
  const trackTextureLoading = (
    url: string,
    options?: { id?: string; weight?: number },
  ) => {
    const resourceId = options?.id || `texture-${url}`;
    const resourceWeight = options?.weight || 1;

    // Register with loading manager
    registerResource(resourceId, "texture", resourceWeight);

    // Create texture loader with progress tracking
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    // Load with progress tracking
    return new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => {
          setResourceLoaded(resourceId, true);
          resolve(texture);
        },
        (progress) => {
          if (progress.lengthComputable) {
            const progressValue = progress.loaded / progress.total;
            setResourceProgress(resourceId, progressValue);
          }
        },
        (error) => {
          console.error(`Error loading texture ${url}:`, error);
          setResourceLoaded(resourceId, false);
          reject(error);
        },
      );
    });
  };

  /**
   * Register and track a Three.js model loading
   */
  const trackModelLoading = (
    loader: any, // GLTFLoader or other model loader
    url: string,
    options?: { id?: string; weight?: number },
  ) => {
    const resourceId = options?.id || `model-${url}`;
    const resourceWeight = options?.weight || 2; // Models are usually more important

    // Register with loading manager
    registerResource(resourceId, "model", resourceWeight);

    // Load with progress tracking
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (result: any) => {
          setResourceLoaded(resourceId, true);
          resolve(result);
        },
        (progress: { loaded: number; total: number }) => {
          if (progress.total > 0) {
            const progressValue = progress.loaded / progress.total;
            setResourceProgress(resourceId, progressValue);
          }
        },
        (error: any) => {
          console.error(`Error loading model ${url}:`, error);
          setResourceLoaded(resourceId, false);
          reject(error);
        },
      );
    });
  };

  /**
   * Register and track an image loading
   */
  const trackImageLoading = (
    url: string,
    options?: { id?: string; weight?: number },
  ) => {
    const resourceId = options?.id || `image-${url}`;
    const resourceWeight = options?.weight || 1;

    // Register with loading manager
    registerResource(resourceId, "texture", resourceWeight);

    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        setResourceLoaded(resourceId, true);
        resolve(img);
      };

      img.onerror = (error) => {
        console.error(`Error loading image ${url}:`, error);
        setResourceLoaded(resourceId, false);
        reject(error);
      };

      // Start loading
      img.src = url;
    });
  };

  /**
   * Track loading of custom resource (e.g., API data, fonts)
   */
  const trackResource = (
    id: string,
    type: ResourceType = "other",
    weight = 1,
  ): TrackedResource => {
    registerResource(id, type, weight);
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
