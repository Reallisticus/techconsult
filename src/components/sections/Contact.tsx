import { useAnimationInView } from "../../hooks/useAnimation";
import { useLanguage } from "../../i18n/context";
import { ScrollReveal } from "../../provider/SmoothScrollProvider";
import { Button } from "../ui/button";
import GlobeContainer from "../ui/globe-container";

interface Contact {
  "preview.title": string;
  "preview.description": string;
  "preview.locationLabel": string;
  "preview.phoneLabel": string;
  "preview.emailLabel": string;
  "preview.scheduleButton": string;
  "preview.mapLabel": string;
  "contact.location": string;
  "contact.email": string;
  "contact.phone": string;
}

export const ContactPreview = () => {
  const { t, getNestedTranslation } = useLanguage();
  const [contactRef, inView] = useAnimationInView("slideUp", {
    threshold: 0.1,
  });

  const contactData: Contact = getNestedTranslation<Contact>("contact");

  return (
    <section
      ref={contactRef}
      className="bg-transparent py-12 md:py-16 lg:py-24"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          <ScrollReveal direction="left" threshold={0.1}>
            <div className="rounded-xl bg-neutral-900/30 p-6 backdrop-blur-sm md:p-8">
              <h2 className="mb-4 text-2xl font-bold md:mb-6 md:text-3xl lg:text-4xl">
                {contactData?.["preview.title"]}
              </h2>
              <p className="mb-6 text-base text-neutral-300 md:mb-8 md:text-lg">
                {contactData?.["preview.description"]}
              </p>

              <div className="space-y-4 md:space-y-6">
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
                    <h3 className="mb-1 font-semibold text-white">
                      {contactData?.["preview.locationLabel"]}
                    </h3>
                    <p className="text-neutral-300">
                      {contactData?.["contact.location"]}
                    </p>
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
                    <h3 className="mb-1 font-semibold text-white">
                      {contactData?.["preview.emailLabel"]}
                    </h3>
                    <p className="text-neutral-300">
                      {contactData?.["contact.email"]}
                    </p>
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
                    <h3 className="mb-1 font-semibold text-white">
                      {contactData?.["preview.phoneLabel"]}
                    </h3>
                    <p className="text-neutral-300">
                      {contactData?.["contact.phone"]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-8">
                <Button
                  href="/contact"
                  variant="primary"
                  size="lg"
                  glow
                  magnetic
                >
                  {contactData?.["preview.scheduleButton"]}
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" threshold={0.1}>
            <div className="rounded-xl">
              {/* Interactive globe component replaces the original implementation */}
              <GlobeContainer
                markerLabel={contactData?.["preview.mapLabel"]}
                globeSize={2}
                labelSize={0.8}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
