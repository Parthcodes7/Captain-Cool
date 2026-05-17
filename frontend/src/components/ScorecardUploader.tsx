import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Sparkles, Loader2 } from 'lucide-react';

interface ScorecardUploaderProps {
  onMatchStateExtracted: (matchState: any) => void;
}

const ScorecardUploader: React.FC<ScorecardUploaderProps> = ({ onMatchStateExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file.');
      setStatus('error');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setStatus('scanning');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('scorecard', file);

      const res = await fetch('http://localhost:3001/api/analyze-scorecard', {
        method: 'POST',
        body: formData
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      if (data.success && data.matchState) {
        setStatus('done');
        onMatchStateExtracted(data.matchState);
      } else {
        throw new Error(data.error || 'Could not read scorecard');
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'Vision scan failed');
    }
  }, [onMatchStateExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setPreview(null);
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden">
      {/* Purple Gemini glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-bl-full pointer-events-none"></div>

      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-sm tracking-widest uppercase flex items-center gap-2 text-white">
          <Sparkles size={16} className="text-purple-400" />
          Gemini Vision — Scorecard Reader
        </h3>
        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full font-bold tracking-widest">GEMINI 2.5 FLASH</span>
      </div>

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.label
            key="drop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            htmlFor="scorecard-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
              isDragging ? 'border-purple-400 bg-purple-500/10 scale-[1.02]' : 'border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5'
            }`}
          >
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Upload size={24} className="text-purple-400" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Camera size={24} className="text-purple-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-bold mb-1">📸 Drop scorecard screenshot here</p>
              <p className="text-gray-400 text-sm">or tap to upload from camera · Cricbuzz · TV screenshot</p>
            </div>
            <input id="scorecard-upload" type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFileInput} />
          </motion.label>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <img src={preview} alt="Scorecard" className="w-full max-h-48 object-cover rounded-2xl border border-white/10" />
            
            {/* Scanner Line Overlay */}
            <AnimatePresence>
              {status === 'scanning' && (
                <motion.div
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-md rounded-xl px-4 py-3 flex items-center gap-3 border border-purple-500/30">
                      <Loader2 size={18} className="text-purple-400 animate-spin" />
                      <span className="text-purple-300 font-mono text-sm">🔍 Reading with Gemini Vision...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {status === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 rounded-2xl flex items-center justify-center bg-green-900/60 backdrop-blur-sm border border-green-500/50"
              >
                <div className="text-center">
                  <p className="text-green-300 text-4xl mb-2">✓</p>
                  <p className="text-white font-bold">Form auto-filled!</p>
                  <p className="text-green-300 text-sm">✨ Read by Gemini Vision</p>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-2xl flex items-center justify-center bg-red-900/60 backdrop-blur-sm border border-red-500/50"
              >
                <div className="text-center px-4">
                  <p className="text-red-300 text-2xl mb-2">⚠</p>
                  <p className="text-white font-bold text-sm">{errorMsg}</p>
                </div>
              </motion.div>
            )}

            <button onClick={reset} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
              <X size={14} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScorecardUploader;
