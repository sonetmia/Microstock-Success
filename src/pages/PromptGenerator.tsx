import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, Copy, Check, Loader2, Sparkles, MessageCircle, Info, Upload, Trash2 } from 'lucide-react';
import { useApiKey } from '../hooks/useApiKey';
import { getGroqClient } from '../lib/groq';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const categories = ['Business', 'Technology', 'Lifestyle', 'Nature', 'Food', 'Architectural', 'Abstract'];
const styles = ['Realistic Photo', '3D Render', 'Digital Illustration', 'Oil Painting', 'Cinematic', 'Flat Design'];

interface BatchResult {
  id: string;
  preview: string;
  prompt: string;
  status: 'processing' | 'completed' | 'error';
}

export default function PromptGenerator() {
  const { apiKey } = useApiKey();
  const [category, setCategory] = useState(categories[0]);
  const [style, setStyle] = useState(styles[0]);
  const [keywords, setKeywords] = useState('');
  const [batchFiles, setBatchFiles] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));
    setBatchFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setBatchFiles(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const generatePrompt = async () => {
    if (!apiKey) {
      setError('Please provide an API Key in settings.');
      return;
    }
    setError('');

    // Single prompt mode (if no files uploaded)
    if (batchFiles.length === 0) {
      setLoading(true);
      try {
        const groq = getGroqClient(apiKey);
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are an expert microstock image prompt engineer. Generate a descriptive, optimized prompt for AI image generators (like Midjourney, Dall-E, or Stable Diffusion). 
              Focus on high-converting microstock aesthetics: clean compositions, great lighting, and clear subjects. 
              Output ONLY the generated prompt text, no explanations.`
            },
            {
              role: 'user',
              content: `Generate a prompt for:
              Category: ${category}
              Style: ${style}
              Additional Keywords: ${keywords || 'trending on Adobe Stock, high quality'}`
            }
          ],
          model: 'llama-3.1-8b-instant',
        });

        setResult(completion.choices[0]?.message?.content || '');
      } catch (err: any) {
        setError(err.message || 'Failed to generate prompt. Please check your API key.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Batch mode (Vision-based)
    setLoading(true);
    setBatchResults([]);
    
    try {
      const groq = getGroqClient(apiKey);

      for (const item of batchFiles) {
        setBatchResults(prev => [...prev, { id: item.id, preview: item.preview, prompt: '', status: 'processing' }]);
        
        try {
          const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(item.file);
          });

          const visionResult = await groq.chat.completions.create({
            model: "llama-3.2-11b-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Describe this image accurately for high-end microstock purposes. 
                    Then generate a high-performance commercial image prompt for the category "${category}" and style "${style}". 
                    Output only the final optimized prompt text. Limit to 60 words.`
                  },
                  {
                    type: "image_url",
                    image_url: { url: base64Data }
                  }
                ]
              }
            ]
          });

          const promptText = visionResult.choices[0]?.message?.content || '';
          
          setBatchResults(prev => prev.map(res => 
            res.id === item.id ? { ...res, prompt: promptText, status: 'completed' } : res
          ));
        } catch (err) {
          setBatchResults(prev => prev.map(res => 
            res.id === item.id ? { ...res, status: 'error' } : res
          ));
        }
      }
    } catch (err: any) {
      setError('Batch processing failed. Verify your Groq API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400">
              <Wand2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">AI Prompt <span className="text-indigo-400">Optimizer</span></h1>
          </div>
          <p className="text-zinc-400 text-sm">Generate descriptive, hardware-accelerated prompts for pixel-perfect stock imagery.</p>
        </header>

        {!apiKey && (
          <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl flex items-center gap-4 mb-8">
            <Info className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-destructive uppercase tracking-widest">API Key Missing</h3>
              <p className="text-xs text-destructive/70">Enable AI capabilities by providing your Groq key in settings.</p>
            </div>
            <Link to="/settings" className="px-4 py-2 bg-destructive/10 text-destructive rounded-xl text-xs font-bold hover:bg-destructive/20 transition-colors">Setup</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-sm">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block mb-3">Category</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all border",
                          category === cat 
                            ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/50 font-bold" 
                            : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block mb-3">Visual Style</label>
                  <select 
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-indigo-500/50 transition-all appearance-none"
                  >
                    {styles.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block mb-3">Batch Upload (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-xl border border-dashed border-zinc-700 bg-zinc-800/30 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-all group/upload overflow-hidden relative"
                  >
                    {batchFiles.length > 0 ? (
                      <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
                        {batchFiles.slice(0, 5).map(f => (
                          <div key={f.id} className="relative group/img">
                            <img src={f.preview} className="w-full h-full object-cover rounded" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                              className="absolute top-0 right-0 p-1 bg-rose-600 text-white rounded opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                        {batchFiles.length > 5 && (
                          <div className="bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-500 rounded">
                            +{batchFiles.length - 5}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-zinc-600 mb-2 group-hover/upload:text-indigo-400 transition-colors" />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Add Images</span>
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
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block mb-3">Target Scene Details</label>
                  <textarea
                    placeholder={batchFiles.length > 0 ? "Images will guide the core content..." : "e.g. minimalist, 8k, diverse..."}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-xs text-zinc-300 focus:border-indigo-500/50 outline-none resize-none transition-all"
                  />
                </div>

                <button
                  onClick={generatePrompt}
                  disabled={loading || !apiKey}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "GENERATE PROMPT"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 h-full rounded-[2rem] p-8 flex flex-col relative overflow-hidden min-h-[500px]">
              <AnimatePresence mode="wait">
                {batchResults.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Batch Processing Pipeline</span>
                      <button 
                        onClick={() => {
                          const text = batchResults.map(r => r.prompt).filter(Boolean).join('\n\n');
                          navigator.clipboard.writeText(text);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        COPY ALL PROMPTS
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {batchResults.map((res) => (
                        <div key={res.id} className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 flex gap-4 items-start">
                          <img src={res.preview} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                          <div className="flex-1 min-w-0">
                            {res.status === 'processing' ? (
                              <div className="flex items-center gap-2 text-indigo-400">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="text-[10px] font-bold tracking-widest uppercase italic">Synthesizing...</span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-zinc-100 leading-relaxed italic">{res.prompt}</p>
                            )}
                          </div>
                          {res.status === 'completed' && (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(res.prompt);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <Copy className="w-3 h-3 text-zinc-500" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full h-full flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono italic">Optimized Output // GROQ</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold text-zinc-300 transition-colors border border-zinc-700"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-zinc-950/50 rounded-2xl p-8 border border-zinc-800 flex items-center justify-center">
                      <p className="text-zinc-100 text-lg md:text-xl font-medium leading-relaxed text-center select-all selection:bg-indigo-500/30">
                        {result}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center py-20"
                  >
                    <div className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-700 mb-6 border border-zinc-700/50">
                      <Wand2 className="w-8 h-8 opacity-40" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-300 mb-2">Engine Ready</h3>
                    <p className="text-[11px] text-zinc-500 max-w-[200px]">
                      Configure your scene and let the AI build your commercial prompt.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
