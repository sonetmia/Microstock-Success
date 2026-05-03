import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Settings as SettingsIcon, Moon, Sun, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Tools', path: '/tools', icon: <Layers className="w-4 h-4" /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 glass border-b border-border h-16 flex items-center justify-between px-8 md:px-12 transition-all"
    )}>
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 tracking-tighter">
          M
        </div>
        <span className="font-semibold text-lg tracking-tight hidden sm:block">
          Microstock <span className="text-indigo-400">Success</span>
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                location.pathname === item.path ? "text-foreground" : "text-zinc-400"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="h-4 w-[1px] bg-zinc-800"></div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-zinc-400" /> : <Moon className="w-4 h-4 text-zinc-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Toggle */}
      <div className="flex md:hidden items-center gap-4">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full hover:bg-accent transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full hover:bg-accent transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-colors",
                  location.pathname === item.path ? "bg-accent text-primary" : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
