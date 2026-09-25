import { useState } from 'react';
import { X, Save, Image as ImageIcon, ChevronDown, Sparkles, Zap, Sword, Flame, Plus, Minus } from 'lucide-react';
import { styles as adminStyles } from './AdminStyles';
import ImageUploader from './ImageUploader';

const ModForm = ({ mod, onClose, onSave }) => {
    const [formData, setFormData] = useState(mod ? { ...mod } : {
        title: '',
        description: '',
        category: 'DBZ TTT',
        version: '',
        platform: 'PC',
        image: '', // Portada
        image_attack1: '',
        image_attack2: '',
        image_attack3: '',
        download_link: '',
        youtube_link: ''
    });

    const [hasDescription, setHasDescription] = useState(!!formData.description);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isPlatformOpen, setIsPlatformOpen] = useState(false);
    const categoryOptions = ['DBZ TTT', 'BT3', 'Herramienta'];
    const platformOptions = ['PC', 'Android'];
    
    // Estado para controlar cuántos slots de imágenes adicionales están visibles
    const [additionalImageSlots, setAdditionalImageSlots] = useState(() => {
        // Si estamos editando, mostrar los slots que tienen imágenes
        if (mod) {
            let count = 0;
            if (mod.image_attack1) count = 1;
            if (mod.image_attack2) count = 2;
            if (mod.image_attack3) count = 3;
            return count;
        }
        return 0;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            description: hasDescription ? formData.description : ''
        });
    };

    return (
        <div 
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
                backdropFilter: 'blur(10px)', zIndex: 2000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="admin-form-card animate-in" 
                style={{ 
                    maxWidth: '600px', 
                    width: '100%', 
                    padding: '1.8rem', 
                    border: '1px solid #333', 
                    position: 'relative',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '900' }}>
                            {mod ? 'Editar Mod' : 'Nuevo Mod'}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '5px' }}>
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 140px', gap: '1rem' }}>
                        <div className="input-field">
                            <label>Título</label>
                            <input
                                type="text" required className="admin-input-compact"
                                placeholder="..."
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="input-field" style={{ position: 'relative' }}>
                            <label>Categoría</label>
                            <div
                                className="admin-input-compact"
                                style={{
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    borderColor: isCategoryOpen ? 'var(--accent)' : '#222',
                                    userSelect: 'none'
                                }}
                                onClick={() => {
                                    setIsCategoryOpen(!isCategoryOpen);
                                    setIsPlatformOpen(false);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <span>{formData.category}</span>
                                <ChevronDown size={14} style={{
                                    transform: isCategoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: '0.2s', color: '#555'
                                }} />
                            </div>

                            {isCategoryOpen && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0,
                                    marginTop: '8px', background: '#0a0a0a', border: '1px solid #333',
                                    borderRadius: '10px', overflow: 'hidden', zIndex: 100,
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                    animation: 'fadeIn 0.2s ease-out'
                                }}>
                                    {categoryOptions.map(opt => (
                                        <div
                                            key={opt}
                                            className="dropdown-option"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData({ ...formData, category: opt });
                                                setIsCategoryOpen(false);
                                            }}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="input-field">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <label style={{ margin: 0 }}>Descripción</label>
                            <div className="modern-switch" onClick={() => setHasDescription(!hasDescription)}>
                                <span style={{ color: hasDescription ? '#fff' : '#444' }}>{hasDescription ? 'ON' : 'OFF'}</span>
                                <div className={`switch-track ${hasDescription ? 'active' : ''}`}>
                                    <div className="switch-knob"></div>
                                </div>
                            </div>
                        </div>
                        {hasDescription && (
                            <textarea
                                required className="admin-input-compact"
                                style={{ minHeight: '80px', resize: 'none' }}
                                placeholder="..."
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        )}
                    </div>

                    {/* Campo versión para herramientas */}
                    {formData.category === 'Herramienta' && (
                        <div className="input-field">
                            <label>Versión</label>
                            <input
                                type="text" className="admin-input-compact"
                                placeholder="Ej: 1.0.0"
                                value={formData.version || ''} onChange={e => setFormData({ ...formData, version: e.target.value })}
                            />
                        </div>
                    )}

                    {formData.category === 'Herramienta' && (
                        <div className="input-field">
                            <label>Plataforma</label>
                            <div style={{ position: 'relative' }}>
                                <div
                                    className="admin-input-compact"
                                    style={{
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        borderColor: isPlatformOpen ? 'var(--accent)' : '#222',
                                        userSelect: 'none'
                                    }}
                                    onClick={() => {
                                        setIsPlatformOpen(!isPlatformOpen);
                                        setIsCategoryOpen(false);
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <span>{formData.platform || 'PC'}</span>
                                    <ChevronDown size={14} style={{
                                        transform: isPlatformOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: '0.2s', color: '#555'
                                    }} />
                                </div>

                                {isPlatformOpen && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        marginTop: '8px', background: '#0a0a0a', border: '1px solid #333',
                                        borderRadius: '10px', overflow: 'hidden', zIndex: 100,
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                        animation: 'fadeIn 0.2s ease-out'
                                    }}>
                                        {platformOptions.map(opt => (
                                            <div
                                                key={opt}
                                                className="dropdown-option"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData({ ...formData, platform: opt });
                                                    setIsPlatformOpen(false);
                                                }}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sección de Imágenes (portada + hasta 3 adicionales) */}
                    <div style={{ background: 'rgba(230, 25, 25, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(230, 25, 25, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <ImageIcon size={16} color="var(--accent)" />
                            <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 }}>
                                Galería de Imágenes
                            </h4>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#777', marginBottom: '1rem' }}>
                            La portada es obligatoria. Agrega hasta 3 imágenes adicionales con el botón "+".
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Portada - Siempre visible */}
                            <ImageUploader
                                icon={<Sparkles size={14} />}
                                label="Portada"
                                value={formData.image}
                                onChange={(url) => setFormData({ ...formData, image: url })}
                                required={true}
                            />
                            
                            {/* Imagen Adicional 1 */}
                            {additionalImageSlots >= 1 && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                        <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: '#555', letterSpacing: '1px' }}>
                                            <Sword size={14} style={{ color: 'var(--accent)' }} />
                                            Imagen Adicional 1
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, image_attack1: '' });
                                                if (additionalImageSlots === 1) setAdditionalImageSlots(0);
                                                else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        image_attack1: prev.image_attack2 || '',
                                                        image_attack2: prev.image_attack3 || '',
                                                        image_attack3: ''
                                                    }));
                                                    setAdditionalImageSlots(prev => prev - 1);
                                                }
                                            }}
                                            className="remove-slot-btn-inline"
                                            title="Eliminar este slot"
                                        >
                                            <Minus size={14} /> Descartar
                                        </button>
                                    </div>
                                    <ImageUploader
                                        icon={null}
                                        label=""
                                        value={formData.image_attack1 || ''}
                                        onChange={(url) => setFormData({ ...formData, image_attack1: url })}
                                    />
                                </div>
                            )}
                            
                            {/* Imagen Adicional 2 */}
                            {additionalImageSlots >= 2 && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                        <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: '#555', letterSpacing: '1px' }}>
                                            <Zap size={14} style={{ color: 'var(--accent)' }} />
                                            Imagen Adicional 2
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (additionalImageSlots === 2) {
                                                    setFormData({ ...formData, image_attack2: '' });
                                                    setAdditionalImageSlots(1);
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        image_attack2: prev.image_attack3 || '',
                                                        image_attack3: ''
                                                    }));
                                                    setAdditionalImageSlots(prev => prev - 1);
                                                }
                                            }}
                                            className="remove-slot-btn-inline"
                                            title="Eliminar este slot"
                                        >
                                            <Minus size={14} /> Quitar
                                        </button>
                                    </div>
                                    <ImageUploader
                                        icon={null}
                                        label=""
                                        value={formData.image_attack2 || ''}
                                        onChange={(url) => setFormData({ ...formData, image_attack2: url })}
                                    />
                                </div>
                            )}
                            
                            {/* Imagen Adicional 3 */}
                            {additionalImageSlots >= 3 && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                        <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: '#555', letterSpacing: '1px' }}>
                                            <Flame size={14} style={{ color: 'var(--accent)' }} />
                                            Imagen Adicional 3
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, image_attack3: '' });
                                                setAdditionalImageSlots(2);
                                            }}
                                            className="remove-slot-btn-inline"
                                            title="Eliminar este slot"
                                        >
                                            <Minus size={14} /> Quitar
                                        </button>
                                    </div>
                                    <ImageUploader
                                        icon={null}
                                        label=""
                                        value={formData.image_attack3 || ''}
                                        onChange={(url) => setFormData({ ...formData, image_attack3: url })}
                                    />
                                </div>
                            )}
                            
                            {/* Botón para agregar más slots */}
                            {additionalImageSlots < 3 && (
                                <button
                                    type="button"
                                    onClick={() => setAdditionalImageSlots(prev => prev + 1)}
                                    style={{
                                        background: 'rgba(230, 25, 25, 0.1)',
                                        border: '1px dashed var(--accent)',
                                        padding: '0.8rem',
                                        borderRadius: '10px',
                                        color: 'var(--accent)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        transition: '0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(230, 25, 25, 0.2)';
                                        e.currentTarget.style.borderColor = 'var(--accent-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(230, 25, 25, 0.1)';
                                        e.currentTarget.style.borderColor = 'var(--accent)';
                                    }}
                                >
                                    <Plus size={16} />
                                    Agregar imagen adicional ({additionalImageSlots}/3)
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-field">
                            <label>Descarga</label>
                            <input
                                type="text" required className="admin-input-compact"
                                placeholder="Link..."
                                value={formData.download_link} onChange={e => setFormData({ ...formData, download_link: e.target.value })}
                            />
                        </div>
                        <div className="input-field">
                            <label>YouTube</label>
                            <input
                                type="text" className="admin-input-compact"
                                placeholder="Opcional..."
                                value={formData.youtube_link} onChange={e => setFormData({ ...formData, youtube_link: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-save-premium">
                        <Save size={18} /> {mod ? 'Actualizar Mod' : 'Publicar Ahora'}
                    </button>
                </form>
            </div>

            <style>{`
                .input-field label { 
                    display: block; font-size: 0.65rem; font-weight: 900; 
                    text-transform: uppercase; color: #555; 
                    margin-bottom: 0.4rem; letter-spacing: 1px;
                }
                .admin-input-compact {
                    width: 100%; background: #0a0a0a; border: 1px solid #222;
                    padding: 0.7rem 1rem; border-radius: 10px; color: #fff;
                    font-size: 0.85rem; outline: none; transition: 0.2s;
                }
                .admin-input-compact:focus { border-color: var(--accent); }
                
                .modern-switch { 
                    display: flex; align-items: center; gap: 8px; cursor: pointer; 
                    background: #111; padding: 4px 8px; border-radius: 8px;
                    border: 1px solid #222;
                }
                .modern-switch span { font-size: 0.6rem; font-weight: 900; width: 22px; text-align: center; }
                .switch-track { 
                    width: 28px; height: 14px; background: #333; border-radius: 10px; 
                    position: relative; transition: 0.3s;
                }
                .switch-track.active { background: var(--accent); }
                .switch-knob { 
                    position: absolute; left: 2px; top: 2px; width: 10px; height: 10px; 
                    background: #fff; border-radius: 50%; transition: 0.3s;
                }
                .switch-track.active .switch-knob { transform: translateX(14px); }

                .remove-slot-btn-inline {
                    background: rgba(230, 25, 25, 0.15);
                    border: 1px solid rgba(230, 25, 25, 0.3);
                    color: var(--accent);
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: 0.2s;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .remove-slot-btn-inline:hover {
                    background: var(--accent);
                    color: #fff;
                    border-color: var(--accent);
                    transform: translateY(-1px);
                }
                .remove-slot-btn-inline:active {
                    transform: translateY(0);
                }

                .tab-group-compact { display: flex; background: #111; padding: 3px; border-radius: 8px; border: 1px solid #222; }
                .tab-group-compact button {
                    background: none; border: none; color: #444; padding: 4px 10px;
                    border-radius: 6px; font-size: 0.6rem; font-weight: 900;
                    cursor: pointer; transition: 0.2s;
                }
                .tab-group-compact button.active { background: #1a1a1a; color: #fff; }

                .upload-zone-compact {
                    border: 1px dashed #222; border-radius: 10px; padding: 0.8rem;
                    text-align: center; cursor: pointer; background: #0a0a0a;
                }
                
                .btn-save-premium {
                    margin-top: 0.5rem; background: var(--accent); color: #fff; border: none;
                    height: 48px; border-radius: 12px; font-weight: 800; font-size: 0.9rem;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    cursor: pointer; transition: 0.3s;
                }
                .btn-save-premium:hover { background: var(--accent-hover); box-shadow: 0 10px 20px rgba(230,25,25,0.2); }
                .btn-save-premium:disabled { opacity: 0.5; cursor: not-allowed; }

                .select-custom { appearance: none; cursor: pointer; padding-right: 2rem !important; }

                .dropdown-option {
                    padding: 0.8rem 1rem; font-size: 0.85rem; cursor: pointer;
                    color: #ccc; transition: 0.2s; border-bottom: 1px solid #161616;
                    user-select: none;
                }
                .dropdown-option:last-child { border-bottom: none; }
                .dropdown-option:last-child { border-bottom: none; }
                .dropdown-option:hover { background: #1a1a1a; color: #fff; padding-left: 1.2rem; }

                /* Image Preview Styles */
                .image-preview-box {
                    background: #0f0f0f;
                    border: 1px solid #222;
                    border-radius: 10px;
                    padding: 0.8rem;
                    margin-top: 0.5rem;
                }
                .mini-preview {
                    width: 40px; height: 40px; border-radius: 6px; object-fit: cover;
                    border: 1px solid #333;
                }
                .btn-icon-danger {
                    background: rgba(230,25,25,0.1); border: none; color: var(--accent);
                    padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s;
                }
                .btn-icon-danger:hover { background: var(--accent); color: #fff; }
            `}</style>
            <style>{adminStyles}</style>
        </div>
    );
};

export default ModForm;
