import { useState } from 'react';
import { Key, ShieldCheck, Phone, User, Trash2, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { useApiKey } from '../hooks/useApiKey';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { apiKey, saveApiKey, clearApiKey } = useApiKey();
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (inputValue.trim()) {
      saveApiKey(inputValue.trim());
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInputValue('');
  };

  return (
    <div className="pt-32 pb-20 px-8 md:px-12 bg-zinc-950 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400">
              <Key className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Access <span className="text-zinc-600">Control</span></h1>
          </div>
          <p className="text-zinc-400 text-lg">Manage your AI credentials and developer connections.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                API Integration
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold mb-3 block text-zinc-500 uppercase tracking-widest">Groq API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-xs text-zinc-300 focus:border-indigo-500/50 outline-none pr-12 transition-all"
                    />
                    {apiKey && (
                       <button 
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-4 flex items-start gap-2 leading-relaxed">
                    <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    Storage: LocalStorage (Client-only). Get your key at <a href="https://console.groq.com/keys" target="_blank" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">console.groq.com <ExternalLink className="w-2.5 h-2.5" /></a>
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  Save Credentials
                </button>

                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-xs font-bold"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Configuration saved successfully.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-600 text-white p-12 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-indigo-600/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl pointer-events-none" />
              
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-10">Lead Developer</h2>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight">Md Sonet Mia</h3>
                    <p className="text-white/60 text-xs font-medium mt-1">Founding Developer</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 space-y-4">
                  <a 
                    href="tel:01797953059" 
                    className="flex items-center gap-4 group/item"
                  >
                    <div className="p-3 bg-white/10 rounded-xl group-hover/item:bg-white/20 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-bold">01797953059</span>
                  </a>
                  
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 italic text-[11px] text-white/70 leading-relaxed">
                    "Scaling your vision through AI automation. If you have questions or need technical support, get in touch."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
