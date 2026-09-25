import { useState, useRef, useEffect } from 'react';
import { X, Check, Move, Maximize2 } from 'lucide-react';

const ImageCropper = ({ imageUrl, onCrop, onCancel }) => {
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const img = new Image();
        // No usar crossOrigin para evitar problemas con CORS
        img.onload = () => {
            setImage(img);
            setError(null);
            
            // Calcular tamaño del canvas manteniendo aspect ratio
            const maxWidth = 600;
            const maxHeight = 400;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            
            setCanvasSize({ width, height });
            
            // Inicializar crop con aspect ratio sugerido 380:220, pero permitir cambios libres
            const aspectRatio = 380 / 220;
            let cropWidth = Math.min(width, height * aspectRatio) * 0.8;
            let cropHeight = cropWidth / aspectRatio;
            
            // Ajustar si excede los límites
            if (cropHeight > height) {
                cropHeight = height * 0.8;
                cropWidth = cropHeight * aspectRatio;
            }
            
            setCrop({
                x: (width - cropWidth) / 2,
                y: (height - cropHeight) / 2,
                width: cropWidth,
                height: cropHeight
            });
        };
        img.onerror = () => {
            setError('No se pudo cargar la imagen. Puede ser un problema de permisos (CORS) o la URL es inválida.');
        };
        img.src = imageUrl;
    }, [imageUrl]);

    useEffect(() => {
        if (!image || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar imagen
        ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);
        
        // Oscurecer área fuera del crop
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Limpiar área de crop
        ctx.clearRect(crop.x, crop.y, crop.width, crop.height);
        ctx.drawImage(
            image,
            (crop.x / canvasSize.width) * image.width,
            (crop.y / canvasSize.height) * image.height,
            (crop.width / canvasSize.width) * image.width,
            (crop.height / canvasSize.height) * image.height,
            crop.x,
            crop.y,
            crop.width,
            crop.height
        );
        
        // Dibujar borde del crop
        ctx.strokeStyle = '#e61919';
        ctx.lineWidth = 2;
        ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
        
        // Dibujar handles de resize
        const handleSize = 12;
        ctx.fillStyle = '#e61919';
        // Esquinas
        ctx.fillRect(crop.x - handleSize/2, crop.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(crop.x + crop.width - handleSize/2, crop.y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(crop.x - handleSize/2, crop.y + crop.height - handleSize/2, handleSize, handleSize);
        ctx.fillRect(crop.x + crop.width - handleSize/2, crop.y + crop.height - handleSize/2, handleSize, handleSize);
        
    }, [image, crop, canvasSize]);

    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Verificar si está en alguna esquina (resize)
        const handleSize = 12;
        const corners = [
            { x: crop.x, y: crop.y },
            { x: crop.x + crop.width, y: crop.y },
            { x: crop.x, y: crop.y + crop.height },
            { x: crop.x + crop.width, y: crop.y + crop.height }
        ];
        
        const isOnHandle = corners.some(corner => 
            Math.abs(x - corner.x) < handleSize && Math.abs(y - corner.y) < handleSize
        );
        
        if (isOnHandle) {
            setIsResizing(true);
        } else if (x >= crop.x && x <= crop.x + crop.width && y >= crop.y && y <= crop.y + crop.height) {
            setIsDragging(true);
        }
        
        setDragStart({ x: x - crop.x, y: y - crop.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging && !isResizing) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (isDragging) {
            let newX = x - dragStart.x;
            let newY = y - dragStart.y;
            
            // Limitar a los bordes
            newX = Math.max(0, Math.min(newX, canvasSize.width - crop.width));
            newY = Math.max(0, Math.min(newY, canvasSize.height - crop.height));
            
            setCrop(prev => ({ ...prev, x: newX, y: newY }));
        } else if (isResizing) {
            // Mantener aspect ratio 380:220 para que coincida con el contenedor de explorar
            const aspectRatio = 380 / 220;
            let newWidth = Math.max(50, x - crop.x);
            let newHeight = newWidth / aspectRatio;
            
            // Limitar a los bordes del canvas manteniendo el ratio
            if (crop.x + newWidth > canvasSize.width) {
                newWidth = canvasSize.width - crop.x;
                newHeight = newWidth / aspectRatio;
            }
            if (crop.y + newHeight > canvasSize.height) {
                newHeight = canvasSize.height - crop.y;
                newWidth = newHeight * aspectRatio;
            }
            
            setCrop(prev => ({
                ...prev,
                width: newWidth,
                height: newHeight
            }));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    const handleCrop = () => {
        // Dimensiones finales (doble de 380x220 para mantener calidad)
        const finalWidth = 760;
        const finalHeight = 440;
        
        // Crear canvas temporal para la imagen recortada
        const tempCanvas = document.createElement('canvas');
        const scaleX = image.width / canvasSize.width;
        const scaleY = image.height / canvasSize.height;
        
        // Establecer dimensiones fijas
        tempCanvas.width = finalWidth;
        tempCanvas.height = finalHeight;
        
        const ctx = tempCanvas.getContext('2d');
        
        try {
            // Dibujar la región recortada redimensionada a las dimensiones fijas
            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                finalWidth,
                finalHeight
            );
            
            // Detectar formato de imagen original
            let mimeType = 'image/jpeg';
            let quality = 0.98; // Alta calidad
            
            // Si la URL termina en png, mantener PNG para preservar transparencia
            if (imageUrl.toLowerCase().includes('.png')) {
                mimeType = 'image/png';
                quality = 1.0;
            } else if (imageUrl.toLowerCase().includes('.webp')) {
                mimeType = 'image/webp';
                quality = 0.98;
            }
            
            // Convertir a blob y retornar
            tempCanvas.toBlob((blob) => {
                if (blob) {
                    onCrop(blob);
                } else {
                    console.error('No se pudo crear el blob de la imagen');
                    setError('Error al procesar la imagen recortada');
                }
            }, mimeType, quality);
        } catch (err) {
            console.error('Error al recortar:', err);
            setError('No se pudo aplicar el recorte. Intenta con otra imagen o súbela desde tu dispositivo.');
        }
    };

    const resetCrop = () => {
        const cropSize = Math.min(canvasSize.width, canvasSize.height) * 0.6;
        setCrop({
            x: (canvasSize.width - cropSize) / 2,
            y: (canvasSize.height - cropSize) / 2,
            width: cropSize,
            height: cropSize
        });
    };

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1rem'
                }}>
                    <X size={32} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ef4444', marginBottom: '0.5rem' }}>
                        Error al cargar la imagen
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        {error}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        color: '#fff',
                        padding: '0.7rem 1.5rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <X size={16} />
                    Volver
                </button>
            </div>
        );
    }

    if (!image) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                <div className="mini-spinner"></div>
                <span style={{ marginLeft: '1rem', color: '#666' }}>Cargando imagen...</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
                background: '#000', 
                borderRadius: '12px', 
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem'
            }}>
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        cursor: isDragging ? 'move' : isResizing ? 'nwse-resize' : 'default',
                        maxWidth: '100%',
                        height: 'auto'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#888', alignItems: 'center' }}>
                <Move size={14} />
                <span>Arrastra el rectángulo para mover • Arrastra las esquinas para redimensionar</span>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button
                    type="button"
                    onClick={resetCrop}
                    style={{
                        flex: 1,
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        color: '#fff',
                        padding: '0.7rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: '0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = '#222'}
                    onMouseLeave={e => e.target.style.background = '#1a1a1a'}
                >
                    <Maximize2 size={16} />
                    Resetear
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        color: '#fff',
                        padding: '0.7rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: '0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = '#222'}
                    onMouseLeave={e => e.target.style.background = '#1a1a1a'}
                >
                    <X size={16} />
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleCrop}
                    style={{
                        flex: 2,
                        background: 'var(--accent)',
                        border: 'none',
                        color: '#fff',
                        padding: '0.7rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: '0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--accent-hover)'}
                    onMouseLeave={e => e.target.style.background = 'var(--accent)'}
                >
                    <Check size={16} />
                    Aplicar Recorte
                </button>
            </div>

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

export default ImageCropper;
