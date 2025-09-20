import { useState } from "react";
import ViewImage from "../ViewImage";

const CarouselImage = ({ displayImages, product }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewImageSrc, setViewImageSrc] = useState(null);

  const prevSlide = () => {
    setActiveIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto relative">
        {/* Slide chính */}
        <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden relative">
          <img
            src={displayImages[activeIndex]}
            alt={`${product.name} ${activeIndex}`}
            className="max-h-full max-w-full object-contain rounded-lg cursor-pointer"
            onClick={() => setViewImageSrc(displayImages[activeIndex])}
          />

          {/* Prev/Next Buttons ở giữa */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-3 rounded-full hover:bg-opacity-50 transition ml-2"
          >
            &#10094;
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-3 rounded-full hover:bg-opacity-50 transition mr-2"
          >
            &#10095;
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 justify-center mt-3 flex-wrap">
          {displayImages.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Thumbnail ${idx}`}
              className={`w-20 h-20 object-cover rounded cursor-pointer transition-transform hover:scale-105 border ${
                idx === activeIndex
                  ? "ring-2 ring-blue-500"
                  : "border-gray-300"
              }`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* Modal zoom ảnh */}
      {viewImageSrc && (
        <ViewImage img={viewImageSrc} onClose={() => setViewImageSrc(null)} />
      )}
    </>
  );
};

export default CarouselImage;