import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

import { ExternalLink } from 'lucide-react';

interface StepCardProps {
  number: number;
  title: string;
  tools: string[];
  index: number;
  link?: string;
}

export const StepCard: React.FC<StepCardProps> = ({ number, title, tools, index, link }) => {
  const CardContent = (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">STEP {number.toString().padStart(2, '0')}</div>
        {link && <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-indigo-400 transition-colors" />}
      </div>
      <h3 className="text-sm font-bold mb-2 tracking-tight transition-colors group-hover:text-indigo-400">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {tools.slice(0, 3).map((tool) => (
          <span key={tool} className="px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] text-zinc-500 font-medium">
            {tool}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      {link ? (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-indigo-500/30 transition-all hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {CardContent}
        </a>
      ) : (
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 transition-all">
          {CardContent}
        </div>
      )}
    </motion.div>
  );
}
