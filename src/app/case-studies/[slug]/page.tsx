"use client";

import { use } from "react";
import { CaseStudyDetail } from "../../../components/case-studies/study/CaseStudiesDetail";

export default function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // When Next.js changes params to be a Promise
  const resolvedParams = use(params);
  return <CaseStudyDetail slug={resolvedParams.slug} />;
}
