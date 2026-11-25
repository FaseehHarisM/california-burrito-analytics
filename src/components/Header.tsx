"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  Database, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  ExternalLink,
  Layers,
  Zap
} from "lucide-react";
import ArchitectureModal from "./ArchitectureModal";

interface HeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  isExporting: boolean;
  queryLatencyMs: number;
}

export default function Header({
  onRefresh,
  onExport,
  isExporting,
  queryLatencyMs,
}: HeaderProps) {
  const [showArchModal, setShowArchModal] = useState(false);

  return (
    <>
      <header className="border-b border-gray-800 bg-[#0E131F]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Burger Town
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium border border-orange-500/30">
                  California Burrito Analytics
                </span>
                <span className="hidden md:inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>300,000 Records</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Enterprise Multi-Outlet POS Performance & Business Intelligence
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Latency Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-800/80 border border-gray-700/60 text-xs text-gray-300">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Query:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {queryLatencyMs} ms
              </span>
            </div>

            {/* Architecture / Decisions Button */}
            <button
              onClick={() => setShowArchModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 transition-colors shadow-sm"
              title="View Architecture Decisions & Benchmarks"
            >
              <Cpu className="h-3.5 w-3.5 text-orange-400" />
              <span className="hidden sm:inline">Technical Decisions</span>
              <span className="sm:hidden">Docs</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={onExport}
              disabled={isExporting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 transition-colors shadow-sm disabled:opacity-50"
              title="Export Current Filtered Data to CSV"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">
                {isExporting ? "Exporting..." : "Export CSV"}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition-colors"
              title="Reset Filters & Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Architecture Decisions Modal */}
      {showArchModal && (
        <ArchitectureModal onClose={() => setShowArchModal(false)} />
      )}
    </>
  );
}
