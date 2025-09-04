import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Carousel } from 'react-bootstrap';
import ViewImage from '../ViewImage';


const CarouselImage = ({ displayImages, product }) => {

    const [viewImageSrc, setViewImageSrc] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);


    return (
        <>
            <div className="relative">
                <Carousel
                    activeIndex={activeIndex}
                    onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                    className="mb-4"
                    interval={3000}
                >
                    {displayImages.map((src, idx) => (
                        <Carousel.Item key={idx}>
                            <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
                                <img
                                    src={src}
                                    alt={`${product.name} ${idx}`}
                                    className="max-h-full max-w-full object-contain rounded-lg"
                                    onClick={() => setViewImageSrc(src)}
                                />
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>

                <div className="flex gap-2 justify-center mt-2">
                    {displayImages.map((src, idx) => (
                        <img
                            key={idx}
                            src={src}
                            alt={`Thumbnail ${idx}`}
                            className={`w-20 h-20 object-cover rounded cursor-pointer transition-transform hover:scale-105
                            ${idx === activeIndex ? "ring-2 ring-blue-500" : "border-gray-300 border"}`}
                            onClick={() => setActiveIndex(idx)}
                        />
                    ))}
                </div>

            </div>

            {viewImageSrc && <ViewImage img={viewImageSrc} onClose={() => setViewImageSrc(null)} />}
        </>
    );
};

export default CarouselImage;