"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X, RotateCcw, Check, PenLine, Undo2, Camera, UserSquare2 } from "lucide-react";
import Webcam from "react-webcam";

interface SignaturePadProps {
    onSave: (signatureUrl: string, snapshotUrl: string | null) => void;
    onClose: () => void;
}

export default function SignaturePad({ onSave, onClose }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [penColor, setPenColor] = useState("#1e293b");
    const [penSize, setPenSize] = useState(2.5);
    const [snapshot, setSnapshot] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [hasCameraError, setHasCameraError] = useState(false);
    const historyRef = useRef<ImageData[]>([]);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    const getCanvas = () => canvasRef.current;
    const getCtx = () => canvasRef.current?.getContext("2d");

    const initCanvas = useCallback(() => {
        const canvas = getCanvas();
        const ctx = getCtx();
        if (!canvas || !ctx) return;

        // Set white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw baseline
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(30, canvas.height * 0.75);
        ctx.lineTo(canvas.width - 30, canvas.height * 0.75);
        ctx.stroke();
        ctx.setLineDash([]);

        historyRef.current = [];
        setIsEmpty(true);
    }, []);

    useEffect(() => {
        initCanvas();
    }, [initCanvas]);

    const saveHistory = () => {
        const canvas = getCanvas();
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        historyRef.current.push(imageData);
        if (historyRef.current.length > 20) historyRef.current.shift();
    };

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = getCanvas();
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ("touches" in e) {
            const touch = e.touches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        saveHistory();
        const pos = getPos(e);
        lastPoint.current = pos;
        setIsDrawing(true);
        setIsEmpty(false);

        // Capture snapshot on first stroke
        if (isEmpty && isCameraActive && webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) setSnapshot(imageSrc);
        }

        const ctx = getCtx();
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, penSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = penColor;
        ctx.fill();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = getCtx();
        if (!ctx || !lastPoint.current) return;

        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        lastPoint.current = pos;
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPoint.current = null;
    };

    const handleUndo = () => {
        const canvas = getCanvas();
        const ctx = getCtx();
        if (!canvas || !ctx || historyRef.current.length === 0) return;
        const prev = historyRef.current.pop()!;
        ctx.putImageData(prev, 0, 0);
        if (historyRef.current.length === 0) {
            setIsEmpty(true);
            setSnapshot(null);
        }
    };

    const handleClear = () => {
        initCanvas();
        setSnapshot(null);
    };

    const handleSave = () => {
        const canvas = getCanvas();
        if (!canvas || isEmpty) return;
        const dataUrl = canvas.toDataURL("image/png");
        onSave(dataUrl, snapshot);
    };

    const PEN_COLORS = ["#1e293b", "#1d4ed8", "#059669", "#dc2626", "#7c3aed", "#d97706"];
    const PEN_SIZES = [1.5, 2.5, 4, 6];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/5">
                    <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <PenLine className="w-4 h-4 text-indigo-400" />
                            Nidaamka Saxeexa Dijital ah
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Biometric & E-Sign Verification</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/8 bg-white/2">
                    {/* Camera Preview / Snapshot */}
                    <div className="w-full md:w-64 bg-slate-900/50 p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5" />
                                Presence Check
                            </span>
                            {snapshot && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                    Captured
                                </span>
                            )}
                        </div>

                        <div className="aspect-video md:aspect-square relative rounded-xl overflow-hidden bg-slate-950 border border-white/10 group">
                            {isCameraActive && !hasCameraError ? (
                                <>
                                    {snapshot ? (
                                        <img src={snapshot} alt="Presence Snapshot" className="w-full h-full object-cover" />
                                    ) : (
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            className="w-full h-full object-cover opacity-80"
                                            onUserMediaError={() => setHasCameraError(true)}
                                        />
                                    )}
                                    {!snapshot && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none">
                                            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-2" />
                                            <p className="text-[10px]">Awaits first stroke...</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-slate-900 px-4 text-center">
                                    <UserSquare2 className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-[10px]">Camera not available or disabled</p>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            System-ku wuxuu si otomaatig ah u qaadi doonaa sawirkaaga marka aad bilaawdo saxeexa si loo hubiyo joogitaankaaga.
                        </p>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 p-4 bg-white/2">
                        {/* Toolbar */}
                        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    {PEN_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setPenColor(c)}
                                            className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${penColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-110" : "opacity-60 hover:opacity-100"}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex gap-1">
                                    {PEN_SIZES.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setPenSize(s)}
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${penSize === s ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                                        >
                                            <div className="rounded-full bg-current" style={{ width: s + 1, height: s + 1 }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleUndo}
                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all"
                                    title="Undo"
                                >
                                    <Undo2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    title="Reset"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="relative group">
                            <canvas
                                ref={canvasRef}
                                width={520}
                                height={260}
                                className="w-full rounded-2xl border border-white/15 cursor-crosshair touch-none shadow-inner bg-white"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                            {isEmpty && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                    <p className="text-slate-400 font-medium tracking-widest text-sm uppercase">Halkan ku saxeex (Sign Here)</p>
                                </div>
                            )}
                        </div>
                        <p className="text-center text-[10px] text-slate-500 mt-3 font-medium uppercase tracking-wider">
                            Ku saxeex tablet ama mouse
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/8 flex gap-3 bg-white/5">
                    <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isEmpty}
                        id="confirm-signature-btn"
                        className="flex-[2] btn-primary justify-center py-2.5 disabled:opacity-40 shadow-lg shadow-indigo-500/20"
                    >
                        <Check className="w-4 h-4" />
                        Capture & Apply Signature
                    </button>
                </div>
            </div>
        </div>
    );
}
