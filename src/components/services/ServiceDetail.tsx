"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "~/i18n/context";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { ScrollReveal, Parallax } from "~/provider/SmoothScrollProvider";
import { renderServiceIcon } from "./utils/ServiceIcons";
import { ServiceDetailHero } from "./sections/ServiceDetailHero";
import { ServiceDetailSidebar } from "./sections/ServiceDetailSidebar";
import { ServiceDetailContent } from "./sections/ServiceDetailContent";

// Define service slugs as constants to ensure they remain in English
export const SERVICE_SLUGS = {
  "strategic-planning": "strategicPlanning",
  "digital-transformation": "digitalTransformation",
  "technical-architecture": "technicalArchitecture",
  training: "training",
  configurations: "configurations",
  support: "support",
  consultations: "consultations",
};

// Create a reverse mapping for lookups
const REVERSE_SERVICE_SLUGS: Record<string, string> = Object.entries(
  SERVICE_SLUGS,
).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<string, string>,
);

export interface ServiceTranslationType {
  name: string;
  description: string;
  features: string;
}

interface ServiceDetailProps {
  slug: string;
}

export const ServiceDetail = ({ slug }: ServiceDetailProps) => {
  const { getNestedTranslation } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);

  // Convert URL slug to translation key
  const translationKey =
    SERVICE_SLUGS[slug as keyof typeof SERVICE_SLUGS] || slug;

  // Get service data from translations
  const serviceData = getNestedTranslation<ServiceTranslationType>(
    `services.${translationKey}`,
  );
  const consultButtonText = getNestedTranslation<string>(
    "services.consultButton",
  );

  // Split features into an array
  const features = serviceData?.features ? serviceData.features.split("|") : [];

  // Get the color for this service
  const serviceColor = getServiceColor(translationKey);

  // If service not found, show error state
  if (!serviceData || !serviceData.name) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-24">
        <div className="rounded-xl bg-[#0A0A2A]/70 p-8 text-center backdrop-blur-sm">
          <h1 className="mb-4 text-3xl font-bold text-white">
            Service Not Found
          </h1>
          <p className="mb-6 text-neutral-300">
            The service you're looking for doesn't exist or has been removed.
          </p>
          <Button href="/services" variant="primary">
            View All Services
          </Button>
        </div>
      </div>
    );
  }

  // Construct the service object with all required data
  const service = {
    id: translationKey,
    name: serviceData.name,
    description: serviceData.description,
    features,
    slug: REVERSE_SERVICE_SLUGS[translationKey] || slug,
    color: serviceColor,
    icon: getServiceIcon(translationKey),
  };

  return (
    <>
      {/* Hero Section */}
      <ServiceDetailHero service={service} />

      {/* Main content */}
      <section className="relative bg-transparent py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
            {/* Sidebar */}
            <div className="md:col-span-4">
              <ServiceDetailSidebar
                service={service}
                translationKey={translationKey}
                contentRef={contentRef}
              />
            </div>

            {/* Main content area with ref for sidebar to calculate boundaries */}
            <div className="md:col-span-8" ref={contentRef}>
              <ServiceDetailContent
                service={service}
                buttonText={consultButtonText}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// Helper function to get color based on service ID
function getServiceColor(serviceId: string): string {
  const colorMap: Record<string, string> = {
    strategicPlanning: "#7C3AED", // Accent-500 (Violet)
    digitalTransformation: "#60A5FA", // Primary-400 (Blue)
    technicalArchitecture: "#2563EB", // Primary-600 (Royal Blue)
    training: "#34D399", // Secondary-400 (Emerald)
    configurations: "#A78BFA", // Accent-300 (Light Violet)
    support: "#3B82F6", // Primary-500 (Blue)
    consultations: "#8B5CF6", // Accent-400 (Violet)
  };

  return colorMap[serviceId] || "#7C3AED"; // Default to accent-500
}

// Helper function to get icon name for the service
function getServiceIcon(serviceId: string): string {
  const iconMap: Record<string, string> = {
    strategicPlanning: "strategy",
    digitalTransformation: "transform",
    technicalArchitecture: "architecture",
    training: "training",
    configurations: "config",
    support: "support",
    consultations: "consult",
  };

  return iconMap[serviceId] || "strategy"; // Default to strategy icon
}
