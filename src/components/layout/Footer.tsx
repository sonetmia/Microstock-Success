import { Mail, Phone, Copyright } from 'lucide-react';

export function Footer() {
  return (
    <footer className="h-16 border-t border-zinc-800 flex items-center justify-between px-8 md:px-12 bg-zinc-950 text-[11px] text-zinc-500">
      <div className="flex gap-4 items-center">
        <p>© {new Date().getFullYear()} Microstock Success Hub</p>
        <div className="w-1 h-1 bg-zinc-800 rounded-full hidden sm:block"></div>
        <p className="font-medium text-zinc-400 hidden sm:block">Developed by Md Sonet Mia (01797953059)</p>
      </div>
      <div className="flex gap-4">
        <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
        <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
        <a href="https://wa.me/8801797953059" target="_blank" className="hover:text-zinc-300 transition-colors">Support</a>
      </div>
    </footer>
  );
}
