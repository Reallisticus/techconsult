"use client";

import { use } from "react";
import { ServiceDetail } from "../../../components/services/ServiceDetail";

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Similar pattern to case-studies implementation
  const resolvedParams = use(params);
  return <ServiceDetail slug={resolvedParams.slug} />;
}
