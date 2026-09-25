import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, ArrowLeft, Settings, AlertTriangle, Search, ChevronDown, ChevronLeft, ChevronRight, X, Youtube, Download } from 'lucide-react';
import ModTable from '../components/admin/ModTable';
import ModForm from '../components/admin/ModForm';
import * as api from '../lib/api';
import { styles as adminStyles } from '../components/admin/AdminStyles';
import NotFound from './NotFound';



const Admin = () => {
    const navigate = useNavigate();
    const [mods, setMods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMod, setEditingMod] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [previewMod, setPreviewMod] = useState(null);
    const [previewImageIndex, setPreviewImageIndex] = useState(0); // Para navegación de imágenes
    const [notification, setNotification] = useState(null); // { message, type }

    // Filter & Pagination State
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Todos');
    const [sort, setSort] = useState('A-Z');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Auth State
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    // Opciones de filtro
    const filterOptions = [
        { label: 'Todos', value: 'Todos' },
        { label: 'DBZ TTT', value: 'DBZ TTT' },
        { label: 'BT3', value: 'BT3' },
        { label: 'Herramienta', value: 'Herramienta' },
    ];

    const sortOptions = [
        { label: 'A-Z', value: 'A-Z' },
        { label: 'Recientes', value: 'Recientes' },
        { label: 'Antiguos', value: 'Antiguos' }
    ];

    const currentFilterLabel = filterOptions.find(f => f.value === filter)?.label || filter;
    const currentSortLabel = sortOptions.find(s => s.value === sort)?.label || sort;

    const fetchMods = async () => {
        try {
            setLoading(true);
            const data = await api.fetchMods();

            // Actualizar con datos frescos o array vacío
            setMods(data || []);
        } catch (err) {
            console.warn('Error fetching mods:', err.message);
            setMods([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        api.clearGithubToken();
        navigate('/');
    };

    // Funciones para navegación de imágenes en preview
    const getValidPreviewImages = (mod) => {
        if (!mod) return [];
        return [mod.image, mod.image_attack1, mod.image_attack2, mod.image_attack3]
            .filter(img => img && img.trim() !== '');
    };

    const navigatePreviewImage = (direction) => {
        if (!previewMod) return;
        const validImages = getValidPreviewImages(previewMod);
        if (validImages.length <= 1) return;

        if (direction === 'next') {
            setPreviewImageIndex((prev) => (prev + 1) % validImages.length);
        } else {
            setPreviewImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
        }
    };

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = async (modData) => {
        setLoading(true);
        try {
            if (editingMod) {
                const fresh = await api.updateMod(editingMod.id, {
                    title: modData.title,
                    description: modData.description,
                    category: modData.category,
                    version: modData.version || null,
                    platform: modData.platform || null,
                    image: modData.image,
                    image_attack1: modData.image_attack1 || null,
                    image_attack2: modData.image_attack2 || null,
                    image_attack3: modData.image_attack3 || null,
                    download_link: modData.download_link,
                    youtube_link: modData.youtube_link
                });

                setMods(fresh);
                showToast('Mod actualizado correctamente', 'success');
            } else {
                const fresh = await api.createMod({
                    title: modData.title,
                    description: modData.description,
                    category: modData.category,
                    version: modData.version || null,
                    platform: modData.platform || null,
                    image: modData.image,
                    image_attack1: modData.image_attack1 || null,
                    image_attack2: modData.image_attack2 || null,
                    image_attack3: modData.image_attack3 || null,
                    download_link: modData.download_link,
                    youtube_link: modData.youtube_link,
                    date: new Date().toISOString().split('T')[0]
                });

                setMods(fresh);
                showToast('Mod publicado con éxito', 'success');
            }
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        }

        setShowForm(false);
        setEditingMod(null);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            const fresh = await api.deleteMod(deleteId);
            setMods(fresh);
            showToast('Mod eliminado definitivamente', 'success');
        } catch (err) {
            showToast('Error al eliminar: ' + err.message, 'error');
        }
        setLoading(false);
        setDeleteId(null);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const openEdit = (mod) => {
        setEditingMod(mod);
        setShowForm(true);
    };

    // Filter Logic
    const filteredMods = mods.filter(mod => {
        const matchesSearch = mod.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'Todos' || mod.category === filter;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (sort === 'Recientes') return new Date(b.date) - new Date(a.date);
        if (sort === 'Antiguos') return new Date(a.date) - new Date(b.date);
        if (sort === 'A-Z') return a.title.localeCompare(b.title);
        return 0;
    });

    const totalPages = Math.ceil(filteredMods.length / itemsPerPage);
    const paginatedMods = filteredMods.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page on filter change y transición (reset durante el render cuando cambian los filtros)
    const adminFilterKey = `${search}|${filter}|${itemsPerPage}|${sort}`;
    const [prevAdminFilterKey, setPrevAdminFilterKey] = useState(adminFilterKey);
    if (adminFilterKey !== prevAdminFilterKey) {
        setPrevAdminFilterKey(adminFilterKey);
        setIsTransitioning(true);
        setCurrentPage(1);
    }

    useEffect(() => {
        if (!isTransitioning) return;
        const timer = setTimeout(() => setIsTransitioning(false), 50);
        return () => clearTimeout(timer);
    }, [isTransitioning]);

    useEffect(() => {
        const checkAuth = () => {
            const auth = localStorage.getItem('admin_auth');
            if (auth) {
                setIsAuthorized(true);
                fetchMods();
            } else {
                setIsAuthorized(false);
                setLoading(false);
            }
            setAuthChecked(true);
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // If not checked yet, show nothing or small loader
    if (!authChecked) return null;

    // Security through Obscurity: Show 404 if not authorized
    if (!isAuthorized) {
        return <NotFound />;
    }

    return (
        <div className="container animate-in" style={{ paddingTop: '3rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: '1 0 auto' }}> {/* Main Content Wrapper */}


                {/* Cabecera Administrativa */}
                <header className="admin-header">
                    <div className="admin-title-section">
                        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
                            <ArrowLeft size={14} /> Volver a la Web
                        </button>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: '900', letterSpacing: '-1px', lineHeight: '1.1' }}>
                            Panel de <span style={{ color: 'var(--accent)' }}>Control</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
                            Gestiona tus lanzamientos y contenido de mods.
                        </p>
                    </div>

                    <div className="admin-actions-box" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => { setEditingMod(null); setShowForm(true); }} className="btn-base btn-download">
                            <Plus size={20} /> Publicar Mod
                        </button>
                        <button onClick={handleLogout} className="btn-base btn-yt" style={{ width: 'auto', padding: '0.8rem' }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {!api.hasGithubToken() && (
                    <div style={{
                        background: 'rgba(230, 25, 25, 0.08)',
                        border: '1px solid rgba(230, 25, 25, 0.4)',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        marginBottom: '1.5rem',
                        color: 'var(--accent)',
                        fontSize: '0.9rem',
                        fontWeight: '700'
                    }}>
                        Falta el token de GitHub: cierra sesión y vuelve a entrar con el token para poder guardar cambios.
                    </div>
                )}

                {/* Estadísticas Rápidas */}
                <div className="admin-stats-grid">
                    <div className="admin-card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Mods</div>
                        <div style={{ fontSize: '2rem', fontWeight: '900' }}>{mods.length}</div>
                    </div>
                    <div className="admin-card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Última Actualización</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>{mods[0]?.date || '---'}</div>
                    </div>
                    <div className="admin-card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Token GitHub</div>
                        <div style={{ fontSize: '1rem', fontWeight: '900', color: api.hasGithubToken() ? '#22c55e' : 'var(--accent)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'currentColor', borderRadius: '50%' }}></div> {api.hasGithubToken() ? 'Conectado' : 'Sin token'}
                        </div>
                    </div>
                </div>

                {/* Listado de Contenido */}
                <div className="admin-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Settings size={20} color="var(--accent)" />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>Listado de Contenido</h3>
                    </div>
                </div>

                {/* Toolbar (Search & Filter) */}
                <div className="toolbar-wrapper" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="search-container" style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }} size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar mod en panel..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filters-container" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                                            className={`custom-dropdown-option ${sort === opt.value ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSort(opt.value);
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

                {/* Tabla de Resultados */}
                <div className="admin-card" style={{ padding: '0', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>


                    {loading && mods.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                            Sincronizando con la base de datos...
                        </div>
                    ) : filteredMods.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#666' }}>
                                No se encontraron resultados
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: '#555' }}>
                                Intenta ajustar los filtros o la búsqueda
                            </p>
                        </div>
                    ) : (
                        <div className={!isTransitioning ? 'content-transition' : ''}>
                            <ModTable mods={paginatedMods} onEdit={openEdit} onDelete={handleDelete} onPreview={setPreviewMod} />

                            {/* Pagination Controls */}
                            {filteredMods.length > 0 && (
                                <div style={{
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    gap: '1rem', padding: '1.5rem', borderTop: '1px solid var(--border)',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="btn-pagination"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                        Página {currentPage} de {totalPages || 1}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="btn-pagination"
                                    >
                                        <ChevronRight size={20} />
                                    </button>

                                    <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: '800', textTransform: 'uppercase' }}>Mostrar:</span>
                                        <div className="items-per-page-selector">
                                            {[10, 15, 20, 30].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => setItemsPerPage(num)}
                                                    className={itemsPerPage === num ? 'active' : ''}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <style>{adminStyles}</style>

                <style>{`
                .spinner {
                    width: 30px; height: 30px; border: 3px solid rgba(230,25,25,0.1);
                    border-top: 3px solid var(--accent); border-radius: 50%;
                    margin: 0 auto; animation: spin 1s linear infinite;
                }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                .admin-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    overflow: hidden;
                    transition: border-color 0.3s;
                }
                .admin-card:hover {
                    border-color: #333;
                }
            `}</style>

                {/* Modal de Formulario */}
                {showForm && (
                    <ModForm
                        mod={editingMod}
                        onClose={() => { setShowForm(false); setEditingMod(null); }}
                        onSave={handleSave}
                    />
                )}

                {/* Custom Delete Modal */}
                {deleteId && (
                    <div className="delete-modal-overlay">
                        <div className="delete-modal">
                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ background: 'rgba(230,25,25,0.1)', padding: '1rem', borderRadius: '50%' }}>
                                    <AlertTriangle size={36} color="var(--accent)" />
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '0.8rem' }}>
                                ¿Eliminar este mod?
                            </h3>
                            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                                Esta acción es permanente y no se puede deshacer. El mod dejará de estar visible inmediatamente.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setDeleteId(null)} className="btn-delete-cancel">
                                    Cancelar
                                </button>
                                <button onClick={confirmDelete} className="btn-delete-confirm">
                                    Sí, Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {notification && (
                    <div className={`toast-notification ${notification.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {notification.type === 'error' ? (
                                <LogOut size={14} color="#ef4444" style={{ transform: 'rotate(180deg)' }} />
                            ) : (
                                <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                            )}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{notification.message}</span>
                    </div>
                )}

                {/* Preview Modal */}
                {previewMod && (() => {
                    const validImages = getValidPreviewImages(previewMod);
                    const hasMultipleImages = validImages.length > 1;
                    
                    return (
                    <div className="preview-modal-overlay" onClick={() => { setPreviewMod(null); setPreviewImageIndex(0); }}>
                        <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={() => { setPreviewMod(null); setPreviewImageIndex(0); }} 
                                className="preview-close"
                            >
                                <X size={24} />
                            </button>

                            <div className="preview-content">
                                {/* Imagen grande con navegación */}
                                <div className="preview-image-container" style={{ position: 'relative' }}>
                                    {validImages.map((imgUrl, idx) => (
                                        <img 
                                            key={`preview-${previewMod.id}-${idx}-${imgUrl}`}
                                            src={imgUrl}
                                            alt={previewMod.title} 
                                            className="preview-image-full"
                                            style={{
                                                display: idx === previewImageIndex ? 'block' : 'none',
                                                position: idx === previewImageIndex ? 'relative' : 'absolute',
                                                opacity: idx === previewImageIndex ? 1 : 0,
                                                pointerEvents: idx === previewImageIndex ? 'auto' : 'none'
                                            }}
                                            loading={idx === 0 ? 'eager' : 'lazy'}
                                        />
                                    ))}
                                    
                                    {hasMultipleImages && (
                                        <>
                                            {/* Botón anterior */}
                                            <button 
                                                className="preview-img-nav-btn preview-img-nav-prev"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigatePreviewImage('prev');
                                                }}
                                                aria-label="Imagen anterior"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            
                                            {/* Botón siguiente */}
                                            <button 
                                                className="preview-img-nav-btn preview-img-nav-next"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigatePreviewImage('next');
                                                }}
                                                aria-label="Imagen siguiente"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                            
                                            {/* Contador */}
                                            <div className="preview-img-counter">
                                                {previewImageIndex + 1} / {validImages.length}
                                            </div>
                                            
                                            {/* Indicadores */}
                                            <div className="preview-img-indicators">
                                                {validImages.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        className={`preview-img-indicator ${idx === previewImageIndex ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setPreviewImageIndex(idx);
                                                        }}
                                                        aria-label={`Ir a imagen ${idx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Información del mod */}
                                <div className="preview-info">
                                    <h2 className="preview-title">{previewMod.title}</h2>
                                    <span className="preview-category">{previewMod.category}{previewMod.category === 'Herramienta' && previewMod.version ? ` • v${previewMod.version}` : ''}</span>
                                    <p className="preview-description">{previewMod.description}</p>
                                    
                                    <div className="preview-meta">
                                        <div className="preview-meta-item">
                                            <span className="preview-meta-label">Fecha de publicación</span>
                                            <span className="preview-meta-value">{previewMod.date}</span>
                                        </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="preview-actions">
                                        <a 
                                            href={previewMod.download_link} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="btn-base btn-download"
                                        >
                                            <Download size={18} /> Descargar Mod
                                        </a>
                                        {previewMod.youtube_link && (
                                            <a 
                                                href={previewMod.youtube_link} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="btn-base btn-yt"
                                            >
                                                <Youtube size={18} /> Ver Video
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })()}

                <style>{`
                .toast-notification {
                    position: fixed; bottom: 30px; right: 30px;
                    background: #0f0f0f; border: 1px solid #333;
                    color: #fff; padding: 1rem 1.5rem; border-radius: 12px;
                    display: flex; align-items: center; gap: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 3000;
                }
                .toast-success { border-left: 4px solid #22c55e; }
                .toast-error { border-left: 4px solid #ef4444; }
                
                @keyframes slideIn { 
                    from { transform: translateY(50px); opacity: 0; } 
                    to { transform: translateY(0); opacity: 1; } 
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
                    user-select: none; /* Prevent text selection */
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
                    user-select: none; /* Prevent text selection */
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

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Preview Modal Styles */
                .preview-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 5000;
                    animation: fadeIn 0.3s ease-out;
                    padding: 1rem;
                }

                .preview-modal {
                    background: #0f0f0f;
                    border: 1px solid #222;
                    border-radius: 20px;
                    max-width: 650px;
                    width: 100%;
                    max-height: 85vh;
                    overflow-y: auto;
                    position: relative;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .preview-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #333;
                    color: #fff;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                    z-index: 10;
                }
                .preview-close:hover {
                    background: var(--accent);
                    border-color: var(--accent);
                    transform: rotate(90deg);
                }

                .preview-content {
                    display: flex;
                    flex-direction: column;
                }

                .preview-image-container {
                    width: 100%;
                    aspect-ratio: 380 / 220;
                    overflow: hidden;
                    border-radius: 20px 20px 0 0;
                    position: relative;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .preview-image-full {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    display: block;
                }

                /* Controles de navegación de imágenes en preview */
                .preview-img-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.7);
                    border: none;
                    color: white;
                    width: 44px;
                    height: 44px;
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

                .preview-image-container:hover .preview-img-nav-btn {
                    opacity: 1;
                }

                .preview-img-nav-btn:hover {
                    background: rgba(230, 25, 25, 0.9);
                    transform: translateY(-50%) scale(1.1);
                }

                .preview-img-nav-btn:active {
                    transform: translateY(-50%) scale(0.95);
                }

                .preview-img-nav-prev {
                    left: 12px;
                }

                .preview-img-nav-next {
                    right: 12px;
                }

                .preview-img-counter {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 14px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    z-index: 10;
                    backdrop-filter: blur(4px);
                }

                .preview-img-indicators {
                    position: absolute;
                    bottom: 14px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 8px;
                    z-index: 10;
                }

                .preview-img-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }

                .preview-img-indicator.active {
                    background: #e61919;
                    width: 26px;
                    border-radius: 4px;
                }

                .preview-img-indicator:hover {
                    background: rgba(255, 255, 255, 0.8);
                }

                .preview-info {
                    padding: 1.5rem;
                }

                .preview-category {
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    color: var(--accent);
                    background: rgba(230, 25, 25, 0.1);
                    padding: 5px 10px;
                    border-radius: 6px;
                    display: inline-block;
                    margin-bottom: 1.5rem;
                }

                .preview-title {
                    font-size: 1.5rem;
                    font-weight: 900;
                    margin-bottom: 0.8rem;
                    line-height: 1.2;
                }

                .preview-description {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .preview-meta {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid #222;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                }

                .preview-meta-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .preview-meta-label {
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #666;
                }

                .preview-meta-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #fff;
                }

                .preview-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .preview-image-container {
                        height: 220px;
                    }
                    .preview-title {
                        font-size: 1.3rem;
                    }
                    .preview-info {
                        padding: 1.2rem;
                    }
                }
            `}</style>

                {/* Footer Styles included in Main */}
                <style>{`
                .btn-pagination {
                    background: var(--bg-card); border: 1px solid var(--border);
                    color: #fff; padding: 0.5rem; border-radius: 8px;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: 0.2s;
                }
                .btn-pagination:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
                .btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .items-per-page-selector { display: flex; background: #111; border-radius: 8px; padding: 2px; border: 1px solid #333; }
                .items-per-page-selector button {
                    background: none; border: none; color: #666; font-size: 0.75rem; 
                    padding: 4px 8px; cursor: pointer; border-radius: 6px; font-weight: 700;
                    transition: 0.2s;
                }
                .items-per-page-selector button.active { background: #333; color: #fff; }
                .items-per-page-selector button:hover:not(.active) { color: #aaa; }
            `}</style>

            </div> {/* End Main Content Wrapper */}

            {/* Sticky Admin Footer */}
            <footer style={{
                textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border)',
                marginTop: 'auto', background: 'var(--bg-main)', position: 'relative', zIndex: 10
            }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Blog Desarrollado por <span style={{ color: 'var(--accent)' }}>GhostAlone17</span>
                </p>
            </footer>
        </div>
    );
};

export default Admin;
