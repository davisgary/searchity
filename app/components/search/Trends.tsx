import React, { useEffect, useRef, useState } from 'react';
import { PiTrendUpBold } from "react-icons/pi";

type Trend = {
  term: string;
};

type TrendsProps = {
  handleSearch: (query: string) => void;
};

const Trends: React.FC<TrendsProps> = ({ handleSearch }) => {
  const [trendingSearches, setTrendingSearches] = useState<Trend[]>([]);
  const trendsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const response = await fetch('/api/trends', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch trending searches');
        }

        const data: { trends: Trend[] } = await response.json();
        setTrendingSearches(data.trends || []);
      } catch (err) {
        console.error('Error fetching trending searches:', err);
      }
    };

    fetchTrendingSearches();
  }, []);

  useEffect(() => {
    const trendsContainer = trendsContainerRef.current;
    if (!trendsContainer) return;

    let animationFrameId: number;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      trendsContainer.scrollLeft = (progress / 50) % trendsContainer.scrollWidth;
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [trendingSearches]);

  if (!trendingSearches.length) {
    return null;
  }

  return (
    <div className="pt-4 w-full text-left">
      <p className="flex items-center text-left text-xs tracking-widest text-foreground/80 mx-2">
        Trending
        <PiTrendUpBold size={16} className="mx-1" />
      </p>
      <div className="overflow-hidden whitespace-nowrap py-2" ref={trendsContainerRef}>
        <div className="inline-block">
          {trendingSearches.map((trend, index) => (
            <span key={index} className="mx-4">
              <button
                onClick={() => handleSearch(trend.term)}
                className="text-normal leading-normal text-foreground/70 rounded-2xl border border-primary/40 px-3 focus:animate-pulse active:bg-transparent transition-all duration-300 hover:border-primary/60 hover:scale-105"
              >
                {trend.term}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trends;