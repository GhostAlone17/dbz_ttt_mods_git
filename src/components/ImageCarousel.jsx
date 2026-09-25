import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = ({ images, alt = 'Mod image' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Filtrar solo imágenes válidas
    const validImages = images.filter(img => img && img.trim() !== '');

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, [validImages.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }, [validImages.length]);

    // Keyboard navigation
    useEffect(() => {
        if (validImages.length <= 1) return;
        
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [validImages.length, goToNext, goToPrev]);

    // Si no hay imágenes, mostrar placeholder
    if (validImages.length === 0) {
        return (
            <div className="carousel-container">
                <div className="carousel-placeholder">
                    <span>Sin imagen</span>
                </div>
            </div>
        );
    }

    // Si solo hay una imagen, mostrarla sin controles
    if (validImages.length === 1) {
        return (
            <div className="carousel-container">
                <img src={validImages[0]} alt={alt} className="carousel-image" />
            </div>
        );
    }

    // Swipe handlers para móvil
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 50) {
            goToNext(); // Swipe izquierda
        }
        if (touchStart - touchEnd < -50) {
            goToPrev(); // Swipe derecha
        }
    };

    return (
        <div 
            className="carousel-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Imagen actual */}
            <img 
                src={validImages[currentIndex]} 
                alt={`${alt} - ${currentIndex + 1}`} 
                className="carousel-image"
            />

            {/* Botón anterior */}
            <button 
                className="carousel-btn carousel-btn-prev"
                onClick={goToPrev}
                aria-label="Imagen anterior"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Botón siguiente */}
            <button 
                className="carousel-btn carousel-btn-next"
                onClick={goToNext}
                aria-label="Imagen siguiente"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicadores de posición */}
            <div className="carousel-indicators">
                {validImages.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                    />
                ))}
            </div>

            {/* Contador */}
            <div className="carousel-counter">
                {currentIndex + 1} / {validImages.length}
            </div>

            <style>{`
                .carousel-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    background: #000;
                    border-radius: inherit;
                }

                .carousel-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    display: block;
                    user-select: none;
                    -webkit-user-drag: none;
                }

                .carousel-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #1a1a1a;
                    color: #666;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .carousel-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.6);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 10;
                    backdrop-filter: blur(4px);
                }

                .carousel-container:hover .carousel-btn {
                    opacity: 1;
                }

                .carousel-btn:hover {
                    background: rgba(230, 25, 25, 0.9);
                    transform: translateY(-50%) scale(1.1);
                }

                .carousel-btn:active {
                    transform: translateY(-50%) scale(0.95);
                }

                .carousel-btn-prev {
                    left: 10px;
                }

                .carousel-btn-next {
                    right: 10px;
                }

                .carousel-indicators {
                    position: absolute;
                    bottom: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 6px;
                    z-index: 10;
                }

                .carousel-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.4);
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }

                .carousel-indicator.active {
                    background: #e61919;
                    width: 24px;
                    border-radius: 4px;
                }

                .carousel-indicator:hover {
                    background: rgba(255, 255, 255, 0.7);
                }

                .carousel-counter {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    z-index: 10;
                    backdrop-filter: blur(4px);
                }

                /* Mobile optimizations */
                @media (max-width: 768px) {
                    .carousel-btn {
                        opacity: 0.7;
                        width: 36px;
                        height: 36px;
                    }

                    .carousel-btn-prev {
                        left: 8px;
                    }

                    .carousel-btn-next {
                        right: 8px;
                    }

                    .carousel-counter {
                        top: 8px;
                        right: 8px;
                        font-size: 0.7rem;
                        padding: 3px 8px;
                    }

                    .carousel-indicators {
                        bottom: 8px;
                    }
                }

                /* Touch feedback */
                @media (hover: none) {
                    .carousel-btn {
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    );
};

export default ImageCarousel;
