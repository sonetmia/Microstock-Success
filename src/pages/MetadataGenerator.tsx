import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Copy, Check, Upload, ImageIcon, Info, FileText, LayoutGrid, CheckCircle2, Trash2 } from 'lucide-react';
import { useApiKey } from '../hooks/useApiKey';
import { getGroqClient } from '../lib/groq';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface MetadataResult {
  id: string;
  preview: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  title?: string;
  description?: string;
  keywords?: string[];
  file: File;
}

export default function MetadataGenerator() {
  const { apiKey } = useApiKey();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [queue, setQueue] = useState<MetadataResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      status: 'queued' as const,
      file
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

  const processBatch = async () => {
    if (!apiKey || loading) return;
    setLoading(true);
    setError('');

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed') continue;

      setQueue(prev => prev.map((q, idx) => 
        idx === i ? { ...q, status: 'processing' } : q
      ));

      try {
        const groq = getGroqClient(apiKey);
        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(item.file);
        });

        const systemPrompt = `You are a high-performance microstock metadata expert. 
        Analyze the input image and generate professional metadata focused on high search visibility for agencies like Adobe Stock and Shutterstock.
        Output ONLY a JSON object with this structure:
        {
          "title": "Clear, descriptive title (under 70 characters)",
          "description": "Professional description including key concepts",
          "keywords": ["keyword1", "keyword2", ..., "keyword30"]
        }
        Generate exactly 30 relevant, commercially focused keywords. Avoid filler words.`;

        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: [
              { type: "image_url", image_url: { url: base64Image } },
              { type: "text", text: "Analyze this image and generate the metadata JSON." }
            ]}
          ],
          model: 'llama-3.2-11b-vision-preview',
          response_format: { type: 'json_object' }
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) throw new Error('No response');
        
        const parsed = JSON.parse(responseText);
        setQueue(prev => prev.map((q, idx) => 
          idx === i ? { ...q, status: 'completed', ...parsed } : q
        ));
      } catch (err) {
        setQueue(prev => prev.map((q, idx) => 
          idx === i ? { ...q, status: 'error' } : q
        ));
      }
    }
    setLoading(false);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400">
              <Search className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">AI Metadata <span className="text-indigo-400">Forge</span></h1>
          </div>
          <p className="text-zinc-400 text-sm">Automated keyword indexing and professional titling for cross-marketplace assets.</p>
        </header>

        {!apiKey && (
          <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl flex items-center gap-4 mb-8">
            <Info className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-destructive uppercase tracking-widest">Vision Disabled</h3>
              <p className="text-xs text-destructive/70">Enable visual analysis by providing your API key in settings.</p>
            </div>
            <Link to="/settings" className="px-4 py-2 bg-destructive/10 text-destructive rounded-xl text-xs font-bold hover:bg-destructive/20 transition-colors">Setup</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Side */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <span className="text-[9px] font-mono text-zinc-600 uppercase">Vision Modules v3.2</span>
              </div>
              
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                <Upload className="w-3 h-3" />
                Batch Input
              </h2>

              <div className="space-y-6">
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
                    onClick={processBatch}
                    disabled={loading || !apiKey || queue.length === 0}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "RUN BATCH METADATA ENGINE"}
                  </button>

                  {queue.length > 0 && (
                    <button 
                      onClick={() => setQueue([])}
                      className="w-full py-3 text-zinc-500 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Clear Batch
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-8">
            <div className="bg-zinc-900 border border-zinc-800 h-full rounded-[2rem] p-8 flex flex-col relative overflow-hidden group min-h-[600px]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Processing Queue ({queue.length})</h2>
              </div>

              {queue.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center h-full text-center py-20 grayscale opacity-20">
                  <Search className="w-16 h-16 mb-6" />
                  <p className="text-xs font-bold tracking-widest uppercase">Waiting for input</p>
                </div>
              ) : (
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[700px]">
                  <AnimatePresence>
                    {queue.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden"
                      >
                        <div className="flex gap-4 p-4">
                          <div className="w-24 h-24 relative rounded-xl overflow-hidden shrink-0">
                            <img src={item.preview} className="w-full h-full object-cover" alt="Item" />
                            {item.status === 'processing' && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                              </div>
                            )}
                            {item.status === 'completed' && (
                              <div className="absolute top-1 right-1 p-1 bg-indigo-600 rounded text-white">
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            {item.status === 'completed' ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                  <h3 className="text-zinc-100 font-bold text-sm truncate">{item.title}</h3>
                                  <button onClick={() => handleCopy(item.title || '', item.id + '-title')} className="text-indigo-400 hover:text-indigo-300">
                                    {copied === item.id + '-title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <p className="text-[10px] text-zinc-500 truncate">{item.keywords?.join(', ')}</p>
                                  <button onClick={() => handleCopy(item.keywords?.join(', ') || '', item.id + '-kw')} className="text-indigo-400 hover:text-indigo-300 shrink-0">
                                    {copied === item.id + '-kw' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            ) : item.status === 'error' ? (
                              <p className="text-rose-400 text-[10px] font-bold uppercase">Processing Failed</p>
                            ) : (
                              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                {item.status === 'processing' ? 'Synthesizing Metadata...' : 'Queued'}
                              </p>
                            )}
                          </div>

                          <button onClick={() => removeFile(item.id)} className="p-2 text-zinc-600 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
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
