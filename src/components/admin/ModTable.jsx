import { Edit3, Trash2, Image as ImageIcon, Eye } from 'lucide-react';

const ModTable = ({ mods, onEdit, onDelete, onPreview }) => {
    return (
        <div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Mod / Personaje</th>
                        <th className="hide-mobile">Categoría</th>
                        <th className="hide-mobile">Fecha</th>
                        <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {mods.map(mod => (
                        <tr key={mod.id} className="admin-row">
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div 
                                        onClick={() => onPreview(mod)}
                                        style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '10px',
                                            background: '#1a1a1a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #333',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        className="preview-image"
                                    >
                                        {mod.image ? (
                                            <img src={mod.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} alt="" />
                                        ) : (
                                            <ImageIcon size={20} color="#444" />
                                        )}
                                        <div className="preview-overlay">
                                            <Eye size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1rem' }}>{mod.title}</div>
                                        <div className="show-mobile" style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: '700' }}>
                                            {mod.category}{mod.category === 'Herramienta' ? ` • ${mod.version ? `v${mod.version}` : 'v—'}${mod.platform ? ` • ${mod.platform}` : ''}` : ''}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="hide-mobile">
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent)', background: 'rgba(230,25,25,0.1)', padding: '4px 8px', borderRadius: '5px' }}>
                                    {mod.category}{mod.category === 'Herramienta' ? ` • ${mod.version ? `v${mod.version}` : 'v—'}${mod.platform ? ` • ${mod.platform}` : ''}` : ''}
                                </span>
                            </td>
                            <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{mod.date}</td>
                            <td>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem' }}>
                                    <button onClick={() => onEdit(mod)} className="action-btn edit" title="Editar">
                                        <Edit3 size={18} />
                                    </button>
                                    <button onClick={() => onDelete(mod.id)} className="action-btn delete" title="Eliminar">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
        .admin-table-wrapper { width: 100%; overflow-x: auto; border-radius: 12px; }
        .admin-table-wrapper::-webkit-scrollbar { height: 6px; }
        .admin-table-wrapper::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .admin-table { width: 100%; border-collapse: separate; border-spacing: 0 0.8rem; min-width: 600px; }
        .admin-table th { padding: 1rem; color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; text-align: left; }
        .admin-row { background: var(--bg-card); }
        .admin-row td { padding: 1.2rem 1rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .admin-row td:first-child { border-left: 1px solid var(--border); border-radius: 15px 0 0 15px; }
        .admin-row td:last-child { border-right: 1px solid var(--border); border-radius: 0 15px 15px 0; }
        
        .preview-image { transition: 0.2s; }
        .preview-image:hover { transform: scale(1.05); border-color: var(--accent) !important; }
        
        .preview-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: 0.2s;
            color: #fff;
        }
        .preview-image:hover .preview-overlay {
            opacity: 1;
        }
        
        .action-btn { background: none; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .action-btn.edit { color: var(--text-muted); }
        .action-btn.edit:hover { color: #fff; }
        .action-btn.delete { color: #444; }
        .action-btn.delete:hover { color: var(--accent); }

        @media (max-width: 600px) {
          .hide-mobile { display: none; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 601px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
        </div>
    );
};

export default ModTable;
