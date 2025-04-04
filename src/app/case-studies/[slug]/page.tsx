"use client";

import { CaseStudyDetail } from "../../../components/case-studies/CaseStudiesDetail";

export default function CaseStudyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <CaseStudyDetail slug={params.slug} />;
}
