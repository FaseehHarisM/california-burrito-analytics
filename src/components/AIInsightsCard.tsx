"use client";

import React, { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChefHat, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { AIInsight } from "@/types/analytics";

interface AIInsightsCardProps {
  insights: AIInsight[];
}

export default function AIInsightsCard({ insights }: AIInsightsCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!insights || insights.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case "warning":
        return <Clock className="h-4 w-4 text-amber-400" />;
      case "highlight":
        return <ChefHat className="h-4 w-4 text-orange-400" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-400" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "highlight":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                AI Executive Intelligence & Operational Insights
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30">
                Live Data Synthesis
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Dynamic recommendations synthesized from current transaction filters & POS velocity
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title={isExpanded ? "Collapse Insights" : "Expand Insights"}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Insights Cards Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-1.5 font-semibold text-xs text-gray-200 min-w-0">
                    {getIcon(ins.type)}
                    <span className="truncate">{ins.title}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0 self-start sm:self-auto ${getBadgeStyle(
                      ins.type
                    )}`}
                  >
                    {ins.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {ins.observation}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-800/60">
                <div className="text-[11px] text-orange-400 font-semibold mb-0.5 flex items-center space-x-1">
                  <span>Actionable Recommendation:</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-snug">
                  {ins.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
