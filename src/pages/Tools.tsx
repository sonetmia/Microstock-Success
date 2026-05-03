import React from 'react';
import { Wand2, Search, LayoutGrid, Sparkles, Phone, Scissors, Maximize } from 'lucide-react';
import { ToolCard } from '../components/tools/ToolCard';
import { motion } from 'motion/react';

export default function Tools() {
  const tools = [
    {
      title: "AI Prompt Generator",
      description: "Llama 3 powered prompt engineering for Adobe Stock and Midjourney.",
      icon: <Wand2 className="w-6 h-6" />,
      path: "/tools/prompt-generator"
    },
    {
      title: "AI Metadata Forge",
      description: "Vision-based keyword extraction and title optimization.",
      icon: <Search className="w-6 h-6" />,
      path: "/tools/metadata-generator"
    },
    {
      title: "Bulk BG Remover",
      description: "Fast local AI-powered background removal for mass production.",
      icon: <Scissors className="w-6 h-6" />,
      path: "/tools/bulk-bg"
    },
    {
      title: "Bulk AI Upscaler",
      description: "High-fidelity resolution enhancement with Vision QA.",
      icon: <Maximize className="w-6 h-6" />,
      path: "/tools/bulk-upscale"
    }
  ];

  return (
    <div className="pt-32 pb-20 px-8 md:px-12 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold tracking-tight italic"
            >
              AI <span className="text-zinc-600">Workstation</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl"
          >
            A comprehensive suite of intelligence modules designed to enhance your microstock visibility and production speed.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, idx) => (
            <ToolCard 
              key={tool.path} 
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              path={tool.path}
              index={idx} 
            />
          ))}
        </div>

        <div className="mt-24 p-12 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Need a custom tool?</h2>
            <p className="text-zinc-400 max-w-lg mb-8 leading-relaxed">
              If there's a specific AI utility that would help your 
              microstock business, let us know and we'll build it.
            </p>
            <a
              href="https://wa.me/8801797953059"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-indigo flex items-center gap-2 w-max"
            >
              <Phone className="w-4 h-4" />
              Contact Developer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
