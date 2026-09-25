import { useEffect, useRef, useState } from 'react';
import { Upload, LinkIcon, Trash2, CheckCircle, Crop } from 'lucide-react';
import { uploadImage } from '../../lib/api';
import ImageCropper from './ImageCropper';

const ImageUploader = ({ icon, label, value, onChange, required = false }) => {
    const [uploading, setUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const [tempImageFile, setTempImageFile] = useState(null);
    const [localPreview, setLocalPreview] = useState(null);
    const previewRef = useRef(null);
    const fileInputRef = useRef(null);

    // Vista previa local hasta que el despliegue publique la imagen definitiva
    const setPreview = (next) => {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
        previewRef.current = next;
        setLocalPreview(next);
    };

    useEffect(() => {
        return () => {
            if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
        };
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Si es un GIF, subirlo directamente sin recortar
        if (file.type === 'image/gif') {
            try {
                setUploading(true);

                const publicUrl = await uploadImage(file, file.name);
                setPreview({ value: publicUrl, url: URL.createObjectURL(file) });
                onChange(publicUrl);
            } catch (error) {
                console.error('Error subiendo GIF:', error.message);
                alert('Error al subir el GIF: ' + error.message);
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
            return;
        }

        // Para imágenes normales, mostrar el cropper
        const tempUrl = URL.createObjectURL(file);
        setTempImageUrl(tempUrl);
        setTempImageFile(file);
        setShowCropper(true);
    };

    const handleCropComplete = async (croppedBlob) => {
        try {
            setUploading(true);
            setShowCropper(false);

            // Subir imagen recortada al repositorio
            const originalName = tempImageFile ? tempImageFile.name : 'imagen.jpg';
            const publicUrl = await uploadImage(croppedBlob, originalName);
            setPreview({ value: publicUrl, url: URL.createObjectURL(croppedBlob) });
            onChange(publicUrl);
            
            // Limpiar
            URL.revokeObjectURL(tempImageUrl);
            setTempImageUrl('');
            setTempImageFile(null);
        } catch (error) {
            console.error('Error subiendo imagen:', error.message);
            setShowCropper(false);
            setTempImageUrl('');
            setTempImageFile(null);
        } finally {
            setUploading(false);
        }
    };



    const handleCropCancel = () => {
        setShowCropper(false);
        if (tempImageUrl && tempImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(tempImageUrl);
        }
        setTempImageUrl('');
        setTempImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };



    const clearImage = () => {
        setPreview(null);
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="input-field">
            {showCropper ? (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                        {icon && <span style={{ color: 'var(--accent)', display: 'flex' }}>{icon}</span>}
                        <label style={{ margin: 0, fontWeight: '700' }}>{label}</label>
                        <span style={{ color: '#666', fontSize: '0.75rem' }}>- Recortar Imagen</span>
                    </div>
                    <ImageCropper
                        imageUrl={tempImageUrl}
                        onCrop={handleCropComplete}
                        onCancel={handleCropCancel}
                    />
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {icon && <span style={{ color: 'var(--accent)', display: 'flex' }}>{icon}</span>}
                            {label}
                            {required && <span style={{ color: 'var(--accent)', marginLeft: '4px' }}>*</span>}
                        </label>
                    </div>

                    {value && (
                        <div className="image-preview-box animate-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                                <img src={localPreview && localPreview.value === value ? localPreview.url : value} alt="Preview" className="mini-preview" />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CheckCircle size={12} /> Cargada
                                    </div>
                                </div>
                                <button type="button" onClick={clearImage} className="btn-icon-danger" title="Eliminar imagen">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {!value && (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="upload-zone-compact"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                accept="image/*,image/gif"
                                onChange={handleFileChange}
                            />
                            {uploading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <div className="mini-spinner"></div>
                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Subiendo...</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem' }}>
                                    <Upload size={24} color="#444" />
                                    <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: '600' }}>
                                        Click para seleccionar (JPG, PNG, GIF)
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: '#555', textAlign: 'center' }}>
                                        Los GIFs se suben directamente sin recortar
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <style>{`
                .mini-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(230, 25, 25, 0.1);
                    border-top: 2px solid var(--accent);
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ImageUploader;
