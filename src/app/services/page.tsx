"use client";

import { CtaSection } from "../../components/home/sections/CTA";
import { useLanguage } from "~/i18n/context";
import { ServicesHero } from "../../components/services/sections/ServiceHero";
import { ServicesBenefits } from "../../components/services/sections/ServiceBenefits";
import { ServiceProcess } from "../../components/services/sections/ServiceProcess";
import { ServiceDetailGrid } from "../../components/services/sections/ServiceDetail";

export default function ServicesPage() {
  const { t } = useLanguage();

  // Service IDs based on translations
  const services = [
    { id: "strategicPlanning", icon: "strategy" },
    { id: "digitalTransformation", icon: "transform" },
    { id: "technicalArchitecture", icon: "architecture" },
    { id: "training", icon: "training" },
    { id: "configurations", icon: "config" },
    { id: "support", icon: "support" },
    { id: "consultations", icon: "consult" },
  ];

  return (
    <>
      <ServicesHero />

      <ServicesBenefits />

      <ServiceProcess />

      {/* Detailed service sections */}
      <ServiceDetailGrid services={services} />

      <CtaSection />
    </>
  );
}
