import { RiArrowDownLine, RiErrorWarningFill } from '@remixicon/react';
import { useRef, useState, useEffect } from 'react';

export function InfoBox() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasMoreContent, setHasMoreContent] = useState(false);
  const [shouldFillHeight, setShouldFillHeight] = useState(true);

  const checkForMoreContent = () => {
    if (contentRef.current) {
      const hasMore =
        contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setHasMoreContent(hasMore);
      setShouldFillHeight(hasMore);
    }
  };

  useEffect(() => {
    checkForMoreContent();
    const resizeObserver = new ResizeObserver(checkForMoreContent);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = () => {
    if (contentRef.current) {
      const currentScroll = contentRef.current.scrollTop;
      const maxScroll =
        contentRef.current.scrollHeight - contentRef.current.clientHeight;
      const newScrollPosition = Math.min(
        currentScroll + contentRef.current.clientHeight,
        maxScroll
      );

      contentRef.current.scrollTo({
        top: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className={`relative p-6 bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col ${shouldFillHeight ? 'h-full' : ''}`}
    >
      <div className="p-0 inline-flex items-center justify-center mb-4 w-fit">
        <RiErrorWarningFill className="w-6 h-6" />
      </div>
      <div className="flex items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Helpful information for Round 6 budgeting
        </h2>
      </div>

      <div
        ref={contentRef}
        className={`overflow-y-auto text-gray-600 dark:text-white text-[12px] ${shouldFillHeight ? 'flex-grow' : ''}`}
      >
        <div className="space-y-6 pr-1">
          <p>
            To help you determine a Round 6 budget, it&apos;s useful to
            reference existing data on Optimism allocations towards Governance
            contributions:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Retro Funding 3 allocated approximately 1.1M OP to Optimism
              Governance Contributions at the end of 2023.
            </li>
            <li>
              The Token House has allocated 500k OP+ in Governance Season 5
              across 32+ Governance related grants.
            </li>
            <li>
              For participation in Season 5, Citizens & Top 100 delegates have
              received a total of 337k OP in{' '}
              <a
                href="https://gov.optimism.io/t/season-5-retro-governance-participation-rewards/8105"
                target="_blank"
                className="underline"
              >
                Retro Governance Participation rewards
              </a>
              .
            </li>
            <li>
              Retro Funding 4 allocated 10M OP among 207 Onchain builders for
              driving the adoption of Optimism.
            </li>
          </ol>
          <p>
            Responsible allocation of OP enables the Collective to fund more
            builders, and to sustainably pursue Retro Funding into the future.
            Any unallocated OP will be used to reward impact in future rounds.
          </p>
        </div>
      </div>
      {hasMoreContent && (
        <button
          onClick={handleScroll}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-[2px] rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 focus:outline-none transition-colors duration-200"
          aria-label="Scroll down for more information"
        >
          <span className="text-[12px] leading-[16px] font-medium text-gray-600">
            More
          </span>
          <RiArrowDownLine className="w-3 h-3 text-gray-600" />
        </button>
      )}
    </div>
  );
}
