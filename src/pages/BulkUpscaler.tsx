import React, { useState, useRef } from 'react';
import { Maximize, Upload, Loader2, Download, Trash2, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getGroqClient } from '../lib/groq';

interface UpscaleItem {
  id: string;
  file: File;
  preview: string;
  status: 'queued' | 'processing' | 'verifying' | 'completed' | 'error';
  result?: string;
  scale: 2 | 4 | 6 | 8;
  report?: string;
}

export default function BulkUpscaler() {
  const [queue, setQueue] = useState<UpscaleItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentScale, setCurrentScale] = useState<2 | 4 | 6 | 8>(2);
  const apiKey = localStorage.getItem('groq_api_key');

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newItems: UpscaleItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'queued',
      scale: currentScale
    }));
    
    setQueue(prev => [...prev, ...newItems]);
  };

  const upscaleImage = async (item: UpscaleItem): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return reject('No context');

        canvas.width = img.width * item.scale;
        canvas.height = img.height * item.scale;

        // High quality drawing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.onerror = reject;
      img.src = item.preview;
    });
  };

  const verifyWithAI = async (imageData: string): Promise<string> => {
    if (!apiKey) return "AI verification skipped: No API Key.";
    
    try {
      const groq = getGroqClient(apiKey);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this upscaled image for microstock quality. Check for artifacts, noise, or blur. Response in 10 words maximum." },
              {
                type: "image_url",
                image_url: { url: imageData }
              }
            ]
          }
        ],
        model: "llama-3.2-11b-vision-preview",
      });

      return completion.choices[0]?.message?.content || "No AI feedback.";
    } catch (err) {
      console.error(err);
      return "AI Verification Error.";
    }
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
        const resultData = await upscaleImage(queue[i]);
        
        setQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'verifying' } : item
        ));

        const report = await verifyWithAI(resultData);

        setQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'completed', result: resultData, report } : item
        ));
      } catch (err) {
        setQueue(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'error' } : item
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
        a.download = `upscaled-x${item.scale}-${item.file.name.split('.')[0]}.png`;
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
              <Maximize className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight italic">Bulk AI <span className="text-zinc-600">Upscaler</span></h1>
          </div>
          <p className="text-zinc-400 text-sm">Professional resolution enhancement with AI-driven quality verification.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-sm">
              <div className="mb-6">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Upscale Factor</label>
                <div className="grid grid-cols-2 gap-2">
                  {[2, 4, 6, 8].map(s => (
                    <button
                      key={s}
                      onClick={() => setCurrentScale(s as any)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold border transition-all",
                        currentScale === s 
                          ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-400" 
                          : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"
                      )}
                    >
                      {s}X Scale
                    </button>
                  ))}
                </div>
              </div>

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
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "PROCESS BATCH"}
                </button>
                
                {queue.some(i => i.status === 'completed') && (
                  <button
                    onClick={downloadAll}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold border border-zinc-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD BATCH
                  </button>
                )}
              </div>

              {!apiKey && (
                <div className="mt-6 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                  <div className="flex gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-600 leading-relaxed">
                      Pro Tip: Add Groq API Key to enable AI verification against stock technical requirements.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Upscale Queue ({queue.length})</h2>
                {queue.length > 0 && <button onClick={() => setQueue([])} className="text-[10px] font-bold text-rose-400 uppercase">Clear All</button>}
              </div>

              {queue.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 grayscale opacity-20">
                  <Maximize className="w-16 h-16 mb-6" />
                  <p className="text-xs font-bold tracking-widest uppercase">Select images to upscale</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {queue.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 group"
                    >
                      <img 
                        src={item.status === 'completed' ? item.result : item.preview} 
                        className={cn(
                          "w-full h-full object-cover transition-all duration-500",
                          (item.status === 'processing' || item.status === 'verifying') ? "opacity-30 blur-sm" : "opacity-100"
                        )} 
                        alt="Upscale item" 
                      />
                      
                      {(item.status === 'processing' || item.status === 'verifying') && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                          <p className="text-[8px] text-indigo-400 uppercase font-bold tracking-widest">
                            {item.status === 'verifying' ? 'AI Reviewing' : 'Resampling'}
                          </p>
                        </div>
                      )}

                      {item.status === 'completed' && (
                        <div className="absolute top-2 right-2 p-1.5 bg-indigo-600 rounded-lg text-white">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[8px] text-zinc-400 truncate mb-1">{item.file.name}</p>
                        {item.report && <p className="text-[7px] text-indigo-400 italic font-medium leading-none">{item.report}</p>}
                      </div>

                      <button 
                        onClick={() => setQueue(q => q.filter(i => i.id !== item.id))}
                        className="absolute top-2 left-2 p-2 bg-black/60 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                       <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
