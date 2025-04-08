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
        const cachedTrends = localStorage.getItem('trendingSearches');
        const cacheTimestamp = localStorage.getItem('trendsTimestamp');
        const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;

        if (cachedTrends && cacheAge < 60 * 60 * 1000) {
          setTrendingSearches(JSON.parse(cachedTrends));
          return;
        }

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

        localStorage.setItem('trendingSearches', JSON.stringify(data.trends));
        localStorage.setItem('trendsTimestamp', Date.now().toString());
      } catch (err) {
        console.error('Error fetching trending searches:', err);
      }
    };

    fetchTrendingSearches();
  }, []);

  useEffect(() => {
    const trendsContainer = trendsContainerRef.current;
    if (!trendsContainer || !trendingSearches.length) return;

    let animationFrameId: number;
    let start: number | null = null;
    const speed = 20;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      const scrollDistance = elapsed * speed;
      
      const singleWidth = trendsContainer.scrollWidth / 2;
      trendsContainer.scrollLeft = scrollDistance % singleWidth;

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [trendingSearches]);

  if (!trendingSearches.length) {
    return null;
  }

  const doubledTrends = [...trendingSearches, ...trendingSearches];

  return (
    <div className="pt-3 w-full text-left">
      <p className="flex items-center font-medium text-left text-xs tracking-widest text-primary/90 mx-2 pb-1 pl-3 sm:pl-10 md:pl-16 lg:pl-20">
        Trending
        <PiTrendUpBold size={16} className="mx-1" />
      </p>
      <div className="overflow-hidden whitespace-nowrap py-2" ref={trendsContainerRef}>
        <div className="inline-block">
          {doubledTrends.map((trend, index) => (
            <span key={index} className="mx-4">
              <button
                onClick={() => handleSearch(trend.term)}
                className="leading-normal text-primary/90 rounded-2xl border border-primary/80 px-3 focus:animate-pulse active:bg-transparent transition-all duration-300 hover:border-primary hover:scale-105"
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