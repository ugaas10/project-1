import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Coins, AlertTriangle, CheckCircle, Wallet, HelpCircle } from 'lucide-react';

interface ProjectBudgetVsSpendCardProps {
  selectedProject: any;
  projects: any[];
  onSelectProject: (id: number) => void;
}

export function ProjectBudgetVsSpendCard({
  selectedProject,
  projects,
  onSelectProject,
}: ProjectBudgetVsSpendCardProps) {
  if (!selectedProject) {
    return (
      <div className="bg-card/40 border border-border/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
        <Coins className="w-8 h-8 text-muted-foreground/50 mb-3 animate-pulse" />
        <h4 className="text-xs font-bold text-white uppercase tracking-widest">No Selected Project</h4>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-[250px]">
          Click on any project card in the directory to analyze its real-time budget vs. actual spend variance.
        </p>
      </div>
    );
  }

  // Robust parsing and fallback calculations for dynamic user projects
  const getBudgetAndSpend = (p: any) => {
    // Check if we explicit budgetAmt or parse string
    const budgetAmt = p.budgetAmt || parseInt(p.budget?.replace(/[^0-9]/g, '') || '0') || 50000;
    
    let actualSpendAmt = p.actualSpendAmt;
    if (actualSpendAmt === undefined) {
      // Calculate realistic spend based on progress/health
      const progressRatio = (p.progress || 0) / 100;
      const delayFactor = p.health === 'Delayed' ? 1.15 : 0.92;
      actualSpendAmt = Math.round(budgetAmt * progressRatio * delayFactor + (budgetAmt * 0.05));
      // Clamp bounds
      if (actualSpendAmt > budgetAmt * 1.35) actualSpendAmt = Math.round(budgetAmt * 1.35);
      if (actualSpendAmt < budgetAmt * 0.1) actualSpendAmt = Math.round(budgetAmt * 0.1);
    }
    return { budgetAmt, actualSpendAmt };
  };

  const { budgetAmt, actualSpendAmt } = getBudgetAndSpend(selectedProject);
  const variance = budgetAmt - actualSpendAmt;
  const isOverBudget = variance < 0;
  const absVariance = Math.abs(variance);
  const variancePercentage = budgetAmt > 0 ? Math.round((absVariance / budgetAmt) * 100) : 0;

  // Formatting utility
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Prepare chart data matching the design philosophy
  const data = [
    {
      name: 'Allocated Budget',
      Amount: budgetAmt,
      fillColor: '#06b6d4', // Cyan/Primary
    },
    {
      name: 'Actual Spend',
      Amount: actualSpendAmt,
      fillColor: isOverBudget ? '#f43f5e' : '#10b981', // Rose/Green dynamic indicating budget state
    },
  ];

  // Intelligence Advice generator based on project metrics
  const getAdviceString = () => {
    if (isOverBudget) {
      if (selectedProject.health === 'Delayed') {
        return `Over-budget by ${variancePercentage}% due to unresolved delays in milestones. Recommend auditing Surveyor fieldwork hours and optimizing GNSS rental equipment allocation.`;
      }
      return `Exceeded budget limit by ${variancePercentage}% in active phase. Immediately review contractor billings and limit additional site layout runs.`;
    }
    
    if (selectedProject.progress >= 90) {
      return `Excellent financial management. Project is completed ${selectedProject.progress}% and saved ${formatUSD(variance)} (${variancePercentage}%) of the total planned budget.`;
    }
    
    return `On Track with spending under control. Savings of ${formatUSD(variance)} currently achieved. High-efficiency spatial layouts deployed successfully.`;
  };

  return (
    <div id="financial-budget-spend-card" className="bg-card border border-border/50 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col h-full min-h-[460px] animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Decorative gradient blur header */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-3xl opacity-[0.06] -mr-8 -mt-8 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`} />

      {/* Header section with interactive project selector dropdown */}
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-border/25 relative z-10">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-extrabold tracking-[0.2em] text-primary uppercase">Financial Analysis</h3>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono tracking-tight ${
              isOverBudget 
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isOverBudget ? 'Over Budget' : 'Within Budget'}
            </span>
          </div>
          <h4 className="text-base font-black text-white mt-1 leading-snug line-clamp-1">
            {selectedProject.name}
          </h4>
          <span className="text-[10px] text-muted-foreground block font-medium">
            {selectedProject.location}
          </span>
        </div>

        {/* Dropdown for quick selection */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Inspect Project</span>
          <select
            value={selectedProject.id}
            onChange={(e) => onSelectProject(Number(e.target.value))}
            className="bg-sidebar/80 border border-border/60 hover:border-primary/50 text-white rounded-lg p-1.5 px-3 text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer transition-colors"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-card text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPI Stats Block */}
      <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
        {/* Allocated Budget */}
        <div className="bg-sidebar/40 p-3 rounded-xl border border-border/10 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Planned</span>
            <Wallet className="w-3 h-3 text-muted-foreground/50" />
          </div>
          <div className="mt-2.5">
            <span className="text-sm font-black text-white font-mono tracking-tighter block leading-none">
              {formatUSD(budgetAmt)}
            </span>
            <span className="text-[8px] text-muted-foreground/60 font-mono mt-1 block">Allocated Limit</span>
          </div>
        </div>

        {/* Actual Spend */}
        <div className="bg-sidebar/40 p-3 rounded-xl border border-border/10 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Expended</span>
            <Coins className="w-3.5 h-3.5 text-primary/50" />
          </div>
          <div className="mt-2.5">
            <span className="text-sm font-black text-white font-mono tracking-tighter block leading-none">
              {formatUSD(actualSpendAmt)}
            </span>
            <span className="text-[8px] text-muted-foreground/60 font-mono mt-1 block">Actual Spend</span>
          </div>
        </div>

        {/* Variance Difference */}
        <div className={`bg-sidebar/40 p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
          isOverBudget ? 'border-rose-500/15 bg-rose-500/[0.01]' : 'border-emerald-500/15 bg-emerald-500/[0.01]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Variance</span>
            {isOverBudget ? (
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <div className="mt-2.5">
            <span className={`text-sm font-black font-mono tracking-tighter block leading-none ${
              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {isOverBudget ? '+' : '-'}{formatUSD(absVariance)}
            </span>
            <span className="text-[8px] text-muted-foreground/60 font-mono mt-1 block">
              {isOverBudget ? `${variancePercentage}% Over Limit` : `${variancePercentage}% Savings`}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 min-h-[160px] bg-sidebar/20 rounded-2xl border border-border/40 p-4 relative flex flex-col justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} 
              axisLine={{ stroke: '#334155', strokeWidth: 1 }}
              tickLine={false} 
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 9 }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: '#ffffff04' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0];
                  return (
                    <div className="bg-slate-900 border border-slate-700/60 p-2.5 rounded-xl shadow-xl font-mono text-[10px] text-left">
                      <p className="text-slate-400 font-extrabold uppercase text-[8px] tracking-widest">{entry.name}</p>
                      <p className="text-white font-black text-sm mt-1">{formatUSD(Number(entry.value))}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="Amount" radius={[8, 8, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fillColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Intelligence Advice / Bottom Banner */}
      <div className={`mt-4 p-3 rounded-xl border flex items-start gap-2.5 transition-colors relative z-10 ${
        isOverBudget 
          ? 'bg-rose-500/5 border-rose-500/15 text-rose-300' 
          : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-300'
      }`}>
        <div className="shrink-0 mt-0.5">
          {isOverBudget ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <div className="text-left space-y-1">
          <span className="text-[8px] font-black uppercase tracking-widest block text-white opacity-70">
            System Finance Advice
          </span>
          <p className="text-[10px] leading-relaxed font-semibold">
            {getAdviceString()}
          </p>
        </div>
      </div>
    </div>
  );
}
