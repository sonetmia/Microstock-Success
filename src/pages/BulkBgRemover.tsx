import React, { useState, useRef } from 'react';
import { Scissors, Upload, Loader2, Download, Trash2, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { removeBackground } from '@imgly/background-removal';

interface QueuedImage {
  id: string;
  file: File;
  preview: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  result?: string;
  error?: string;
}

export default function BulkBgRemover() {
  const [queue, setQueue] = useState<QueuedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiKey = localStorage.getItem('groq_api_key');

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newItems: QueuedImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'queued'
    }));
    
    setQueue(prev => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const processQueue = async () => {
    if (processing) return;
    setProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'completed') continue;

      setQueue(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'processing' } : item
      ));

      try {
        const blob = await removeBackground(queue[i].file, {
          progress: (side, res) => {
            console.log(`Processing ${queue[i].file.name}: ${side} ${res}`);
          }
        });
        
        const resultUrl = URL.createObjectURL(blob);
        
        setQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'completed', result: resultUrl } : item
        ));
      } catch (err) {
        console.error(err);
        setQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'error', error: 'Fast local processing failed' } : item
        ));
      }
    }

    setProcessing(false);
  };

  const downloadAll = () => {
    queue.forEach(item => {
      if (item.result) {
        const a = document.createElement('a');
        a.href = item.result;
        a.download = `no-bg-${item.file.name}`;
        a.click();
      }
    });
  };

  return (
    <div className="pt-32 pb-20 px-8 md:px-12 bg-zinc-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400">
              <Scissors className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight italic">Bulk BG <span className="text-zinc-600">Remover</span></h1>
          </div>
          <p className="text-zinc-400 text-sm">Professional-grade local AI background removal for mass microstock production.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-sm">
              <div 
                className="aspect-video rounded-2xl border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-950/50 flex flex-col items-center justify-center cursor-pointer transition-all mb-6 relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {queue.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 p-2 w-full h-full overflow-hidden">
                    {queue.slice(0, 6).map(item => (
                      <img key={item.id} src={item.preview} className="w-full h-full object-cover rounded-lg" alt="Queue" />
                    ))}
                    {queue.length > 6 && (
                      <div className="bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-500 rounded-lg">
                        +{queue.length - 6}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-zinc-700 mb-4" />
                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Select Assets</p>
                  </>
                )}
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => handleFiles(e.target.files)} 
                  accept="image/*"
                />
                {queue.length > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">Add More Assets</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={processQueue}
                  disabled={processing || queue.length === 0}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "START BATCH PROCESSING"}
                </button>

                {queue.some(i => i.status === 'completed') && (
                  <button
                    onClick={downloadAll}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold border border-zinc-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD ALL
                  </button>
                )}
              </div>

              <div className="mt-8 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <div className="flex gap-3">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Processes locally in your browser. No images are uploaded to any server. High resolution supported.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Queue Display */}
          <div className="lg:col-span-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Processing Queue ({queue.length})</h2>
                {queue.length > 0 && (
                  <button 
                    onClick={() => setQueue([])}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-widest"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 grayscale opacity-20">
                  <Scissors className="w-16 h-16 mb-6" />
                  <p className="text-xs font-bold tracking-widest uppercase">Waiting for input</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {queue.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group aspect-square rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800"
                      >
                        <img 
                          src={item.status === 'completed' ? item.result : item.preview} 
                          className={cn(
                            "w-full h-full object-cover transition-opacity duration-500",
                            item.status === 'processing' ? "opacity-40" : "opacity-100"
                          )} 
                          alt="Queue item" 
                        />
                        
                        {item.status === 'processing' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                          </div>
                        )}

                        {item.status === 'completed' && (
                          <div className="absolute top-2 right-2 p-1.5 bg-indigo-600 rounded-lg text-white">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}

                        <button 
                          onClick={() => removeFile(item.id)}
                          className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-[8px] text-zinc-400 truncate">{item.file.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
