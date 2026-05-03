/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import Home from './pages/Home';
import Tools from './pages/Tools';
import PromptGenerator from './pages/PromptGenerator';
import MetadataGenerator from './pages/MetadataGenerator';
import BulkBgRemover from './pages/BulkBgRemover';
import BulkUpscaler from './pages/BulkUpscaler';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/prompt-generator" element={<PromptGenerator />} />
            <Route path="/tools/metadata-generator" element={<MetadataGenerator />} />
            <Route path="/tools/bulk-bg" element={<BulkBgRemover />} />
            <Route path="/tools/bulk-upscale" element={<BulkUpscaler />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
