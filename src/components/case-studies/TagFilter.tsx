// src/components/case-studies/TagFilter.tsx
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";
import { useDropdown } from "~/hooks/useDropdown"; // Import the new hook
import { useState, useEffect } from "react";

interface TagFilterProps {
  tags: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  allProjectsLabel?: string;
}
// src/components/case-studies/TagFilter.tsx

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  activeFilter,
  onFilterChange,
  allProjectsLabel = "All Projects",
}) => {
  const { isOpen, toggle, dropdownRef } = useDropdown();
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="mb-12 flex flex-col items-center justify-center">
      {/* Quick filters - only show the All Projects button on mobile */}
      <div className="mb-4 flex flex-wrap justify-center gap-3">
        <motion.button
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
            activeFilter === "all"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "bg-[#0A0A2A]/70 text-neutral-300 hover:bg-[#0A0A2A] hover:text-white",
          )}
          onClick={() => onFilterChange("all")}
          whileTap={{ scale: 0.97 }}
        >
          {allProjectsLabel}
        </motion.button>

        {/* On desktop: show all tags horizontally */}
        {!isMobile &&
          tags.map((tag) => (
            <motion.button
              key={tag}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                activeFilter === tag.toLowerCase()
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-[#0A0A2A]/70 text-neutral-300 hover:bg-[#0A0A2A] hover:text-white",
              )}
              onClick={() => onFilterChange(tag.toLowerCase())}
              whileTap={{ scale: 0.97 }}
            >
              {tag}
            </motion.button>
          ))}

        {/* On mobile: show a filter button */}
        {isMobile && (
          <div className="relative">
            <motion.button
              className="inline-flex items-center rounded-full bg-[#0A0A2A]/70 px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-[#0A0A2A] hover:text-white"
              onClick={toggle}
              whileTap={{ scale: 0.97 }}
            >
              Filter By Tag
              <ChevronDown
                className={cn(
                  "ml-1 h-4 w-4 transition-transform duration-200",
                  isOpen ? "rotate-180" : "",
                )}
              />
            </motion.button>

            {/* Grid layout dropdown for mobile */}
            <div
              ref={dropdownRef as React.RefObject<HTMLDivElement>}
              className="absolute z-50"
            >
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-auto mt-2 w-64 rounded-lg border border-purple-500/10 bg-[#0A0A2A] p-3 shadow-xl shadow-purple-900/10 backdrop-blur-md sm:w-80 md:w-96"
                  >
                    <div className="max-h-60 overflow-y-auto p-1">
                      <div className="grid grid-cols-2 gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag}
                            className={cn(
                              "rounded-md px-3 py-2 text-left text-xs transition-colors duration-200 sm:text-sm",
                              activeFilter === tag.toLowerCase()
                                ? "bg-purple-600/20 text-purple-400"
                                : "hover:bg-purple-900/20 hover:text-purple-300",
                            )}
                            onClick={() => {
                              onFilterChange(tag.toLowerCase());
                              toggle();
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Active filter indicator (unchanged) */}
      {activeFilter !== "all" && (
        <div className="mt-4 flex items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-full bg-purple-900/20 px-3 py-1"
          >
            <span className="text-xs text-purple-300">
              Filtering by: <span className="font-medium">{activeFilter}</span>
            </span>
            <button
              className="ml-2 text-purple-400 hover:text-purple-300"
              onClick={() => onFilterChange("all")}
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
