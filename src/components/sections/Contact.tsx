import { Canvas } from "@react-three/fiber";
import { useAnimationInView } from "../../hooks/useAnimation";
import { useLanguage } from "../../i18n/context";
import { ScrollReveal } from "../../provider/SmoothScrollProvider";
import { Button } from "../ui/button";

export const ContactPreview = () => {
  const { t } = useLanguage();
  const [contactRef, inView] = useAnimationInView("slideUp", {
    threshold: 0.1,
  });

  return (
    <section ref={contactRef} className="bg-transparent py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ScrollReveal direction="left" threshold={0.1}>
            <div className="rounded-xl bg-neutral-900/30 p-8 backdrop-blur-sm">
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                Get In Touch
              </h2>
              <p className="mb-8 text-lg text-neutral-300">
                Ready to discuss how our technology consulting services can
                transform your business? Our team is here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10">
                    <svg
                      className="h-5 w-5 text-accent-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">Location</h3>
                    <p className="text-neutral-300">{t("contact.location")}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10">
                    <svg
                      className="h-5 w-5 text-accent-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">Email</h3>
                    <p className="text-neutral-300">{t("contact.email")}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10">
                    <svg
                      className="h-5 w-5 text-accent-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">Phone</h3>
                    <p className="text-neutral-300">{t("contact.phone")}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  href="/contact"
                  variant="primary"
                  size="lg"
                  glow
                  magnetic
                >
                  Schedule a Consultation
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" threshold={0.1}>
            <div className="overflow-hidden rounded-xl">
              {/* Interactive map with ThreeJS globe */}
              <div className="relative aspect-square h-full w-full">
                <Canvas camera={{ position: [0, 0, 2], fov: 60 }}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[10, 10, 10]} intensity={0.8} />

                  {/* Simple Earth globe */}
                  <mesh>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                      color="#2563EB"
                      wireframe={true}
                      emissive="#2563EB"
                      emissiveIntensity={0.2}
                    />
                  </mesh>

                  {/* Sofia location marker */}
                  <mesh position={[0.7, 0.4, 0.9]}>
                    <sphereGeometry args={[0.03, 16, 16]} />
                    <meshStandardMaterial
                      color="#7C3AED"
                      emissive="#7C3AED"
                      emissiveIntensity={1}
                    />
                  </mesh>
                </Canvas>

                {/* Location label */}
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 transform text-center">
                  <div className="rounded-full bg-accent-500 px-3 py-1 text-sm font-medium text-white">
                    Sofia, Bulgaria
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
