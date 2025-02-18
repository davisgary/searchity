// @ts-ignore
import Slider from 'react-slick';
import React, { useState, useEffect } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type ResultItem = {
  title: string;
  link: string;
  snippet: string;
  image: string;
};

type ResultsProps = {
  results: ResultItem[];
};

const Results: React.FC<ResultsProps> = ({ results }) => {
  const filteredResults = results.filter((result) => result.image);

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

  return (
    <div className="mt-5 text-left overflow-hidden">
      <Slider {...settings}>
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

  return (
    <div className="p-2">
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
        style={{ height: '205px', display: 'flex', flexDirection: 'column' }}>
        <a href={result.link} target="_blank" rel="noopener noreferrer" className="block h-full">
          <div style={{ height: '85px', overflow: 'hidden' }}>
            <img
              src={result.image}
              alt={result.title}
              className={`w-full h-full ${isSmallImage ? 'object-none bg-neutral-100' : 'object-cover object-[center_20%]'}`}
              onError={(e) => {
                e.currentTarget.src = `https://www.google.com/s2/favicons?sz=256&domain=${new URL(result.link).hostname}`;
                e.currentTarget.classList.add("object-none", "bg-neutral-100");
              }}
            />
          </div>
          <div className="bg-white p-2">
            <h4 className="text-black font-bold mb-1" style={{ fontSize: '14px', lineHeight: '1.2' }}>
              {result.title}
            </h4>
            <p className="text-xs text-black">{result.snippet}</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Results;