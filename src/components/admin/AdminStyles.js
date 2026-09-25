export const styles = `
    .admin-form-card {
        background: var(--bg-card);
        border-radius: 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    
    .delete-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.85);
        backdrop-filter: blur(8px); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.2s ease-out;
    }

    .delete-modal {
        background: #0a0a0a; border: 1px solid #333;
        width: 100%; max-width: 400px; padding: 2rem;
        border-radius: 24px; text-align: center;
        transform: scale(0.95); animation: zoomIn 0.2s ease-out forwards;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }

    @keyframes zoomIn {
        to { transform: scale(1); opacity: 1; }
    }

    .btn-delete-confirm {
        background: var(--accent); color: white; border: none;
        padding: 0.8rem 1.5rem; border-radius: 12px;
        font-weight: 800; cursor: pointer; flex: 1;
        transition: 0.2s;
    }
    .btn-delete-confirm:hover { background: var(--accent-hover); }

    .btn-delete-cancel {
        background: #222; color: white; border: none;
        padding: 0.8rem 1.5rem; border-radius: 12px;
        font-weight: 700; cursor: pointer; flex: 1;
        transition: 0.2s;
    }
    .btn-delete-cancel:hover { background: #333; }

    /* Estilos Responsivos Generales para Admin */
    .admin-header {
        display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4rem;
    }
    
    .admin-stats-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
        gap: 2rem; margin-bottom: 3rem;
    }

    @media (max-width: 768px) {
        .admin-header {
            flex-direction: column;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .admin-title-section {
            width: 100%;
        }

        .admin-actions-box {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px;
        }
        
        .admin-stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .admin-form-card {
            width: 95% !important;
            padding: 1.2rem !important;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .delete-modal {
            width: 90%;
            padding: 1.5rem;
        }
    }
`;
