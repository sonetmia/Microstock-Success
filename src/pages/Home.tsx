import React from 'react';
import { motion } from 'motion/react';
import { Wand2, Search, Scissors, Maximize, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ToolCard } from '../components/tools/ToolCard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-bold mb-4 tracking-tight leading-tight"
              >
                Microstock <br />Journey with <span className="text-indigo-400">SONET</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400 text-lg mb-8 leading-relaxed"
              >
                The ultimate hub for microstock contributors. Master the journey from 
                research to marketplace upload with AI-integrated tools and professional workflows.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <Link to="/tools" className="btn-indigo">
                  Explore AI Tools
                </Link>
                <a href="/tools" className="btn-zinc">
                  View Toolkit
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-500">
              AI Workstation Modules
            </h2>
            <div className="h-[1px] flex-1 bg-zinc-800 ml-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard
              title="AI Prompt Generator"
              description="Batch process images into high-performance prompts."
              icon={<Wand2 className="w-6 h-6" />}
              path="/tools/prompt-generator"
              index={0}
            />
            <ToolCard
              title="AI Metadata Forge"
              description="Vision-based keyword extraction and title optimization."
              icon={<Search className="w-6 h-6" />}
              path="/tools/metadata-generator"
              index={1}
            />
            <ToolCard
              title="Bulk BG Remover"
              description="Local AI background removal for mass production."
              icon={<Scissors className="w-6 h-6" />}
              path="/tools/bulk-bg"
              index={2}
            />
            <ToolCard
              title="Bulk AI Upscaler"
              description="Resolution enhancement with quality verification."
              icon={<Maximize className="w-6 h-6" />}
              path="/tools/bulk-upscale"
              index={3}
            />
          </div>

          <div className="mt-12 p-10 rounded-[2.5rem] bg-indigo-600 shadow-xl shadow-indigo-600/10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <h3 className="text-3xl font-bold mb-4">Professional Microstock Efficiency.</h3>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                Scale your portfolio with AI-integrated workflows designed specifically for high-volume stock contributors.
              </p>
              <Link to="/settings" className="btn-zinc bg-white text-indigo-600 hover:bg-zinc-100">
                Configure API Access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
