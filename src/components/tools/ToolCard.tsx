import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  index: number;
  isExternal?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, path, index, isExternal }) => {
  const Component = isExternal ? 'a' : Link;
  const props = isExternal ? { href: path, target: '_blank', rel: 'noopener noreferrer' } : { to: path };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Component
        {...props as any}
        className="block p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 transition-all relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-400">
            {icon}
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>
        
        <h3 className="text-sm font-bold mb-1 tracking-tight">{title}</h3>
        <p className="text-[11px] text-zinc-500 leading-snug">
          {description}
        </p>
      </Component>
    </motion.div>
  );
}
