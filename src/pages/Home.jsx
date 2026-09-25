import { useState, useMemo, useEffect } from 'react';
import { Youtube, Download, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchMods } from '../lib/api';

const Home = () => {
    const [mods, setMods] = useState([]); // Inicializamos vacío para cargar de DB
    const [currentImageIndices, setCurrentImageIndices] = useState({}); // Track current image for each mod
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Todos');
    const [sortOrder, setSortOrder] = useState('a-z');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isTransitioning, setIsTransitioning] = useState(false);
    // Opciones de mapeo para mostrar 'BT3' pero usar valor correcto
    const filterOptions = [
        { label: 'Todos', value: 'Todos' },
        { label: 'DBZ TTT', value: 'DBZ TTT' },
        { label: 'BT3', value: 'BT3' },
        { label: 'Herramienta', value: 'Herramienta' },
    ];

    const sortOptions = [
        { label: 'A-Z', value: 'a-z' },
        { label: 'Recientes', value: 'newest' },
        { label: 'Antiguos', value: 'oldest' }
    ];

    // Obtener label actual para mostrar
    const currentFilterLabel = filterOptions.find(f => f.value === filter)?.label || filter;
    const currentSortLabel = sortOptions.find(s => s.value === sortOrder)?.label || 'A-Z';

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const loadMods = async (silent = false) => {
            try {
                if (!silent) setLoading(true);
                const data = await fetchMods();
                setMods(prev => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
            } catch (err) {
                console.error('Fallo crítico al conectar:', err);
                if (!silent) setMods([]);
            } finally {
                if (!silent) setLoading(false);
            }
        };

        loadMods();

        // Refresco al volver a la pestaña (sustituye al realtime de Supabase)
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') loadMods(true);
        };
        document.addEventListener('visibilitychange', handleVisibility);

        // Publica los cambios en cuanto Actions termina (~30-40 s), sin recargar
        const poll = setInterval(() => {
            if (document.visibilityState === 'visible') loadMods(true);
        }, 20000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            clearInterval(poll);
        };
    }, []);

    const filteredMods = useMemo(() => {
        if (!Array.isArray(mods)) return [];

        let result = mods.filter(mod => {
            const title = mod?.title || '';
            const description = mod?.description || '';
            const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) ||
                description.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'Todos' || mod?.category === filter;
            return matchesSearch && matchesFilter;
        });

        return result.sort((a, b) => {
            if (sortOrder === 'a-z') {
                return (a?.title || '').localeCompare(b?.title || '');
            }
            const dateA = new Date(a?.created_at || a?.date || 0);
            const dateB = new Date(b?.created_at || b?.date || 0);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [mods, search, filter, sortOrder]);

    // Pagination Logic y transición (reset durante el render cuando cambian los filtros)
    const filterKey = `${search}|${filter}|${sortOrder}`;
    const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
    if (filterKey !== prevFilterKey) {
        setPrevFilterKey(filterKey);
        setIsTransitioning(true);
        setCurrentPage(1);
    }

    useEffect(() => {
        if (!isTransitioning) return;
        const timer = setTimeout(() => setIsTransitioning(false), 50);
        return () => clearTimeout(timer);
    }, [isTransitioning]);

    const totalPages = Math.ceil(filteredMods.length / itemsPerPage);
    const currentMods = filteredMods.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Función para obtener las imágenes válidas de un mod
    const getValidImages = (mod) => {
        return [mod.image, mod.image_attack1, mod.image_attack2, mod.image_attack3]
            .filter(img => img && img.trim() !== '');
    };

    // Función para navegar entre imágenes
    const navigateImage = (modId, direction) => {
        const mod = mods.find(m => m.id === modId);
        const validImages = getValidImages(mod);
        if (validImages.length <= 1) return;

        const currentIndex = currentImageIndices[modId] || 0;
        let newIndex;
        
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % validImages.length;
        } else {
            newIndex = (currentIndex - 1 + validImages.length) % validImages.length;
        }
        
        setCurrentImageIndices(prev => ({ ...prev, [modId]: newIndex }));
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="container header-spacing" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Panel de Mods</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 4vw, 1.1rem)', maxWidth: '650px' }}>
                    La colección definitiva de modificaciones técnicas para la saga Tenkaichi.
                </p>
            </header>

            <div className="toolbar-wrapper">
                <div className="container toolbar-flex">

                    {/* Search Bar (First - Left) */}
                    <div className="search-container-expanded">
                        <div className="search-input-wrapper">
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="text"
                                placeholder="Buscar mod..."
                                className="search-input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Group: Dropdowns (Right Side) */}
                    <div className="dropdowns-group">

                        {/* Category Dropdown */}
                        <div style={{ position: 'relative', width: '180px', zIndex: 100 }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#555', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px', marginLeft: '1rem' }}>Categoría</div>
                            <div
                                className="custom-dropdown-trigger"
                                onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}
                            >
                                <span>{currentFilterLabel}</span>
                                <ChevronDown size={16} style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s', color: '#666' }} />
                            </div>

                            {isFilterOpen && (
                                <div className="custom-dropdown-menu">
                                    {filterOptions.map((opt) => (
                                        <div
                                            key={opt.value}
                                            className={`custom-dropdown-option ${filter === opt.value ? 'selected' : ''}`}
                                            onClick={() => {
                                                setFilter(opt.value);
                                                setIsFilterOpen(false);
                                            }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div style={{ position: 'relative', width: '180px', zIndex: 100 }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#555', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px', marginLeft: '1rem' }}>Orden</div>
                            <div
                                className="custom-dropdown-trigger"
                                onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }}
                            >
                                <span>{currentSortLabel}</span>
                                <ChevronDown size={16} style={{ transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s', color: '#666' }} />
                            </div>

                            {isSortOpen && (
                                <div className="custom-dropdown-menu">
                                    {sortOptions.map((opt) => (
                                        <div
                                            key={opt.value}
                                            className={`custom-dropdown-option ${sortOrder === opt.value ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSortOrder(opt.value);
                                                setIsSortOpen(false);
                                            }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Overlay to close on click outside */}
                        {(isFilterOpen || isSortOpen) && <div onClick={() => { setIsFilterOpen(false); setIsSortOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />}

                    </div>

                </div>
            </div>

            <div className="container" style={{ minHeight: '400px', flex: 1 }}>
                {loading && mods.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                        <div className="loading-spinner"></div>
                        Cargando archivo...
                    </div>
                ) : (
                    <div className={`mods-grid ${!isTransitioning ? 'content-transition' : ''}`}>
                        {filteredMods.length > 0 ? (
                            currentMods.map((mod) => {
                                const validImages = getValidImages(mod);
                                const currentIndex = currentImageIndices[mod.id] || 0;
                                const hasMultipleImages = validImages.length > 1;
                                
                                return (
                                    <article key={mod.id ?? mod.title} className="mod-card animate-in">
                                        <div className="mod-image-container" style={{ position: 'relative' }}>
                                            {validImages.map((imgUrl, idx) => (
                                                <img 
                                                    key={`${mod.id}-${idx}-${imgUrl}`}
                                                    src={imgUrl}
                                                    alt={mod.title}
                                                    className="carousel-image"
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover',
                                                        display: idx === currentIndex ? 'block' : 'none',
                                                        position: idx === currentIndex ? 'relative' : 'absolute',
                                                        opacity: idx === currentIndex ? 1 : 0,
                                                        pointerEvents: idx === currentIndex ? 'auto' : 'none'
                                                    }}
                                                    loading={idx === 0 ? 'eager' : 'lazy'}
                                                />
                                            ))}
                                            
                                            {hasMultipleImages && (
                                                <>
                                                    {/* Botón anterior */}
                                                    <button 
                                                        className="img-nav-btn img-nav-prev"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigateImage(mod.id, 'prev');
                                                        }}
                                                        aria-label="Imagen anterior"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                    
                                                    {/* Botón siguiente */}
                                                    <button 
                                                        className="img-nav-btn img-nav-next"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            navigateImage(mod.id, 'next');
                                                        }}
                                                        aria-label="Imagen siguiente"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                    
                                                    {/* Contador */}
                                                    <div className="img-counter">
                                                        {currentIndex + 1} / {validImages.length}
                                                    </div>
                                                    
                                                    {/* Indicadores */}
                                                    <div className="img-indicators">
                                                        {validImages.map((_, idx) => (
                                                            <button
                                                                key={idx}
                                                                className={`img-indicator ${idx === currentIndex ? 'active' : ''}`}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setCurrentImageIndices(prev => ({ ...prev, [mod.id]: idx }));
                                                                }}
                                                                aria-label={`Ir a imagen ${idx + 1}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="mod-content">
                                            <span className="mod-category">{mod.category}{mod.category === 'Herramienta' ? ` • ${mod.version ? `v${mod.version}` : 'v—'}${mod.platform ? ` • ${mod.platform}` : ''}` : ''}</span>
                                            <h3 className="mod-title">{mod.title}</h3>
                                            <p className="mod-desc">{mod.description || '\u00A0'}</p>

                                            <div className="btn-group">
                                                <a href={mod.download_link} target="_blank" rel="noreferrer" className="btn-base btn-download">
                                                    <Download size={18} /> Descargar
                                                </a>
                                                {mod.youtube_link && (
                                                    <a href={mod.youtube_link} target="_blank" rel="noreferrer" className="btn-base btn-yt">
                                                        <Youtube size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                No se encontraron resultados.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {filteredMods.length > 0 && (
                <div className="container" style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                    {/* Page Navigation */}
                    <div className="pagination-bar">
                        <button
                            className="page-btn nav-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <span className="page-info">
                            Página <span style={{ color: '#fff', fontWeight: '800' }}>{currentPage}</span> de {totalPages}
                        </span>

                        <button
                            className="page-btn nav-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Items Per Page Selector */}
                    <div className="items-per-page">
                        <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mostrar:</span>
                        <div className="ipp-options">
                            {[10, 15, 20, 30].map(num => (
                                <button
                                    key={num}
                                    className={`ipp-btn ${itemsPerPage === num ? 'active' : ''}`}
                                    onClick={() => { setItemsPerPage(num); setCurrentPage(1); }}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            <style>{`
        .header-spacing { padding-top: 3rem; margin-bottom: 2.5rem; }
        .filters-container { display: flex; gap: 2rem; align-items: center; }
        .filter-separator { background: #333; }
        
        /* Controles de navegación de imágenes */
        .img-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.6);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
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

        .mod-image-container:hover .img-nav-btn {
            opacity: 1;
        }

        .img-nav-btn:hover {
            background: rgba(230, 25, 25, 0.9);
            transform: translateY(-50%) scale(1.1);
        }

        .img-nav-btn:active {
            transform: translateY(-50%) scale(0.95);
        }

        .img-nav-prev {
            left: 8px;
        }

        .img-nav-next {
            right: 8px;
        }

        .img-counter {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 700;
            z-index: 10;
            backdrop-filter: blur(4px);
        }

        .img-indicators {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 6px;
            z-index: 10;
        }

        .img-indicator {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0;
        }

        .img-indicator.active {
            background: #e61919;
            width: 20px;
            border-radius: 3px;
        }

        .img-indicator:hover {
            background: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
            .img-nav-btn {
                opacity: 0.7;
                width: 32px;
                height: 32px;
            }
        }

        @media (max-width: 480px) {
            .img-nav-btn {
                opacity: 0.8;
                width: 30px;
                height: 30px;
            }
            .img-nav-prev {
                left: 6px;
            }
            .img-nav-next {
                right: 6px;
            }
            .img-counter {
                font-size: 0.65rem;
                padding: 3px 8px;
                top: 8px;
                right: 8px;
            }
            .img-indicators {
                bottom: 8px;
                gap: 5px;
            }
            .img-indicator {
                width: 5px;
                height: 5px;
            }
            .img-indicator.active {
                width: 16px;
            }
        }
        
        .loading-spinner {
          width: 40px; height: 40px; border: 4px solid rgba(230,25,25,0.1);
          border-top: 4px solid var(--accent); border-radius: 50%;
          margin: 0 auto 1.5rem; animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Estilos base del toolbar */
        .toolbar-wrapper {
            margin-bottom: 3rem;
        }

        .toolbar-flex {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 2rem;
        }

        .search-container-expanded {
            flex-grow: 1; 
            max-width: 600px;
        }

        .dropdowns-group {
            display: flex;
            gap: 1.5rem;
        }

        @media (min-width: 901px) {
            .toolbar-flex {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                gap: 2rem;
            }
            .dropdowns-group {
                display: flex;
                gap: 1.5rem;
            }
            .search-container-expanded {
                flex-grow: 1; 
                max-width: 600px;
            }
        }

        @media (max-width: 900px) {
            .toolbar-wrapper, .toolbar-flex {
                display: contents;
            }

            .search-container-expanded {
                position: sticky;
                top: 0;
                z-index: 90;
                background: rgba(10, 10, 10, 0.95);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border-bottom: 1px solid #222;
                width: 100%;
                padding: 1rem;
                margin-bottom: 1rem;
                margin-left: 0;
                margin-right: 0;
            }

            .search-input-wrapper {
                width: 100%;
            }

            .search-input {
                width: 100%;
                font-size: 0.95rem;
            }
            
            .dropdowns-group {
                display: flex;
                gap: 0.8rem;
                width: 100%;
                padding: 0 1rem;
                margin-bottom: 2rem;
            }
            .dropdowns-group > div {
                flex: 1;
                width: auto !important;
                min-width: 0;
            }
            .dropdowns-group > div > div:first-child {
                font-size: 0.6rem;
                margin-left: 0.5rem;
            }
        }

        @media (max-width: 480px) {
            .search-container-expanded {
                padding: 0.8rem;
            }
            .dropdowns-group {
                padding: 0 0.8rem;
                gap: 0.6rem;
            }
        }

        /* Estilos Dropdown Personalizado */
        .custom-dropdown-trigger {
            background: #0a0a0a;
            border: 1px solid #222;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            display: flex; justify-content: space-between; align-items: center;
            cursor: pointer;
            color: #fff;
            font-weight: 700;
            font-size: 0.9rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
        }
        .custom-dropdown-trigger:hover {
            border-color: #333;
            background: #111;
            transform: translateY(-1px);
        }

        .custom-dropdown-menu {
            position: absolute;
            top: 100%; left: 0; right: 0;
            margin-top: 8px;
            background: #0a0a0a;
            border: 1px solid #333;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideDown {
            from { 
                opacity: 0; 
                transform: translateY(-10px) scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }

        .custom-dropdown-option {
            padding: 0.8rem 1rem;
            font-size: 0.9rem;
            color: #888;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
            border-bottom: 1px solid #161616;
            font-weight: 500;
        }
        .custom-dropdown-option:last-child { border-bottom: none; }
        .custom-dropdown-option:hover {
            background: #111;
            color: #fff;
            padding-left: 1.2rem;
            transform: translateX(2px);
        }
        .custom-dropdown-option.selected {
            color: var(--accent);
            font-weight: 800;
            background: rgba(230,25,25,0.05);
        }

        /* Pagination Styles */
        .pagination-bar {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            background: #0f0f0f;
            padding: 0.5rem 1rem;
            border-radius: 16px;
            border: 1px solid #222;
        }

        @media (max-width: 480px) {
            .pagination-bar {
                gap: 1rem;
                padding: 0.4rem 0.8rem;
            }
            .page-info {
                font-size: 0.8rem;
            }
            .items-per-page {
                gap: 0.8rem;
            }
            .items-per-page > span {
                font-size: 0.75rem;
            }
            .ipp-btn {
                padding: 0.35rem 0.7rem;
                font-size: 0.8rem;
            }
        }

        .page-btn {
            background: transparent;
            border: none;
            color: #fff;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 8px;
            transition: 0.2s;
            display: flex; align-items: center; justify-content: center;
        }
        .page-btn:hover:not(:disabled) {
            background: #222;
            color: var(--accent);
        }
        .page-btn:disabled {
            color: #333;
            cursor: not-allowed;
        }

        .page-info {
            font-size: 0.9rem;
            color: #888;
            font-weight: 600;
        }

        .items-per-page {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .ipp-options {
            display: flex;
            gap: 0.5rem;
            background: #0f0f0f;
            padding: 0.3rem;
            border-radius: 10px;
            border: 1px solid #222;
        }

        .ipp-btn {
            background: transparent;
            border: none;
            color: #666;
            padding: 0.4rem 0.8rem;
            border-radius: 7px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;
        }
        .ipp-btn:hover { color: #fff; }
        .ipp-btn.active {
            background: #222;
            color: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

      `}</style>
        </div>
    );
};

export default Home;
