// @ts-ignore
import Slider from 'react-slick';
import React, { useState, useEffect, useRef } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type ResultItem = {
  title: string;
  link: string;
  snippet: string;
  image: string;
  source?: string;
  date?: string | null;
  pagemap?: {
    cse_image?: { src: string }[];
    metatags?: { [key: string]: string }[];
  };
};

type ResultsProps = {
  results: ResultItem[];
};

const Results: React.FC<ResultsProps> = ({ results }) => {
  const filteredResults = results.filter((result) => result.image);
  const sliderRef = useRef<Slider>(null);

  if (!filteredResults.length) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '40px',
    swipeToSlide: true,
    touchThreshold: 10,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    focusOnSelect: false,
    afterChange: () => {
      updateFocusableElements();
    },
    beforeChange: () => {
      document.querySelectorAll('.slick-slide a').forEach((el) => {
        el.setAttribute('tabIndex', '-1');
      });
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerPadding: '30px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerPadding: '20px',
        },
      },
    ],
  };

  const updateFocusableElements = () => {
    document.querySelectorAll('.slick-slide').forEach((slide) => {
      const link = slide.querySelector('a');
      if (!link) return;

      const isHidden = slide.getAttribute('aria-hidden') === 'true';
      const isCloned = slide.classList.contains('slick-cloned');

      if (isHidden || isCloned) {
        link.setAttribute('tabIndex', '-1');
      } else {
        link.setAttribute('tabIndex', '0');
      }
    });
  };

  useEffect(() => {
    if (sliderRef.current) {
      updateFocusableElements();
    }
  }, [filteredResults]);

  return (
    <div className="mt-5 text-left overflow-hidden">
      <Slider ref={sliderRef} {...settings} aria-label="Search results carousel">
        {filteredResults.map((result, index) => (
          <ResultImage key={index} result={result} />
        ))}
      </Slider>
    </div>
  );
};

const ResultImage: React.FC<{ result: ResultItem }> = ({ result }) => {
  const [isSmallImage, setIsSmallImage] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = result.image;

    img.onload = () => {
      const threshold = 400;
      if (img.width < threshold || img.height < threshold) {
        setIsSmallImage(true);
      }
    };
  }, [result.image]);

  const source =
    result.pagemap?.metatags?.[0]?.["og:site_name"] ||
    new URL(result.link).hostname.replace("www.", "");

  return (
    <div className="p-2">
      <div
        className="bg-white rounded-lg overflow-hidden transition-transform transform hover:scale-105"
        style={{ height: "215px", display: "flex", flexDirection: "column" }}
      >
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${result.title}: ${result.snippet} (Source: ${source})`}
          tabIndex={-1}
        >
          <div style={{ height: "85px", overflow: "hidden" }}>
            <img
              src={result.image}
              alt={result.title}
              className={`w-full h-full ${isSmallImage ? "object-none bg-neutral-100" : "object-cover object-[center_20%]"}`}
              onError={(e) => {
                e.currentTarget.src = `https://www.google.com/s2/favicons?sz=256&domain=${new URL(result.link).hostname}`;
                e.currentTarget.classList.add("object-none", "bg-neutral-100");
              }}
            />
          </div>
          <div className="bg-white p-2" style={{ flexGrow: 1 }}>
            <p className="text-black font-bold mb-1" style={{ fontSize: "14px", lineHeight: "1.2" }}>
              {result.title}
            </p>
            <p className="text-xs text-gray-700 mb-1">{source}</p>
            <p className="text-xs text-black">{result.snippet}</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Results;