import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Login from "./components/Login";

// ✅ IMPORTANTE: o seu app original vira "ProtectedApp"
import ProtectedApp from "./ProtectedApp";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-6">Carregando...</div>;
  if (!session) return <Login />;

  return <ProtectedApp />;
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, 
  Wallet, 
  Calendar as CalendarIcon, 
  Info, 
  Phone, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Globe,
  Mail,
  MapPin,
  MessageCircle, 
  User,
  FileText,
  Edit2,
  Save,
  Shield,
  Upload,
  Download,
  Eye,
  X,
  ExternalLink,
  Clock,
  FileCheck,
  Search,
  Filter,
  CloudUpload,
  Map,
  DollarSign
} from 'lucide-react';

/**
 * SN Contabilidade - MEI Tracker App (Versão 3.2 - Faturamento Mensal)
 * * Atualizações:
 * - Novo Card "Faturamento Mensal" com filtro por mês.
 * - Posicionado acima do Total de Despesas.
 */

// --- Paleta de Cores ---
const COLORS = {
  background: "bg-[#FEF8E5]", // Bege claro
  primary: "bg-[#1B2A41]",    // Azul escuro Institucional
  primaryText: "text-[#1B2A41]",
  cardBg: "bg-[#FFFFFF]",
  textMain: "text-[#1F2937]",
  border: "border-[#E5E7EB]",
  accent: "text-[#d4af37]",   // Dourado
  accentBg: "bg-[#d4af37]",
};

// --- Componentes UI ---

const Card = ({ children, className = "" }) => (
  <div className={`${COLORS.cardBg} rounded-xl shadow-sm border ${COLORS.border} p-4 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, type="button" }) => {
  const baseStyle = "px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition-all active:scale-95";
  const variants = {
    primary: `${COLORS.primary} text-white hover:opacity-90 shadow-md shadow-blue-900/20`,
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20",
    outline: `border-2 border-[#1B2A41] text-[#1B2A41] hover:bg-blue-50`,
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "text-slate-500 hover:bg-slate-100",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E] shadow-md shadow-green-500/20",
    icon: "p-2 rounded-full hover:bg-slate-100 text-slate-600"
  };
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-lg text-[#1B2A41]">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500"/>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Utilitários ---
const MEI_LIMIT = 81000;
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// --- Widgets ---

const CalendarWidget = () => {
  const [dateInfo, setDateInfo] = useState({ date: '', weekday: '', holiday: '' });
  const [location, setLocation] = useState('Atualizando local...');

  useEffect(() => {
    const now = new Date();
    const optionsDate = { day: '2-digit', month: 'long', year: 'numeric' };
    const optionsWeek = { weekday: 'long' };
    
    let holidayText = "Dia normal";
    const dayMonth = `${now.getDate()}/${now.getMonth()+1}`;
    if (dayMonth === '1/1') holidayText = "Confraternização Universal";
    if (dayMonth === '7/9') holidayText = "Independência";
    if (dayMonth === '25/12') holidayText = "Natal";
    if (dayMonth === '1/5') holidayText = "Dia do Trabalho";

    setDateInfo({
      date: now.toLocaleDateString('pt-BR', optionsDate),
      weekday: now.toLocaleDateString('pt-BR', optionsWeek),
      holiday: holidayText
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(`Lat: ${position.coords.latitude.toFixed(2)}, Long: ${position.coords.longitude.toFixed(2)}`),
        () => setLocation("Localização não permitida")
      );
    }
  }, []);

  return (
    <Card className="bg-white border-l-4 border-l-[#1B2A41] shadow-md">
       <div className="flex items-center justify-between">
          <div>
             <h4 className="text-[#1B2A41] font-bold text-lg capitalize">{dateInfo.weekday}</h4>
             <p className="text-slate-500 text-sm font-medium">{dateInfo.date}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg text-[#1B2A41]"><CalendarIcon size={24} /></div>
       </div>
       <div className="mt-3 flex gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><MapPin size={10}/> {location}</span>
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Info size={10}/> {dateInfo.holiday}</span>
       </div>
    </Card>
  );
};

// --- Telas ---

const Dashboard = ({ transactions, year, onContactClick, companyData }) => {
  // Estado para o filtro de mês (0 = Janeiro, 11 = Dezembro)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());

  const { totalRevenue, totalExpenses, monthlyRevenue } = useMemo(() => {
    const yearTransactions = transactions.filter(t => new Date(t.date).getFullYear() === year);
    
    // Cálculo Anual
    const revenueYear = yearTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expensesYear = yearTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

    // Cálculo Mensal (Baseado no filtro)
    const revenueMonth = yearTransactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === selectedMonthIndex)
        .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalRevenue: revenueYear,
      totalExpenses: expensesYear,
      monthlyRevenue: revenueMonth
    };
  }, [transactions, year, selectedMonthIndex]);

  const percentUsed = (totalRevenue / MEI_LIMIT) * 100;
  
  let statusColor = 'bg-emerald-500';
  let statusText = 'Dentro do Limite';
  if (percentUsed > 80) { statusColor = 'bg-amber-500'; statusText = 'Próximo do Limite'; }
  if (percentUsed >= 100) { statusColor = 'bg-red-500'; statusText = 'Limite Excedido!'; }

  const monthlyData = useMemo(() => {
    const data = new Array(12).fill(0);
    transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year).forEach(t => {
        const monthIndex = parseInt(t.date.split('-')[1]) - 1;
        if(monthIndex >= 0 && monthIndex < 12) data[monthIndex] += t.amount;
    });
    return data;
  }, [transactions, year]);

  const handlePrevMonth = () => setSelectedMonthIndex(prev => prev === 0 ? 11 : prev - 1);
  const handleNextMonth = () => setSelectedMonthIndex(prev => prev === 11 ? 0 : prev + 1);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in pt-4">
      
      {/* 1. Card Faturamento Anual */}
      <Card className="bg-gradient-to-br from-blue-900 to-slate-900 text-white border-none shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Faturamento Acumulado ({year})</p>
            <h3 className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</h3>
            {companyData.cnpj && <p className="text-xs text-blue-300 mt-1 font-mono uppercase">{companyData.fantasyName || 'Minha Empresa'}</p>}
          </div>
          <div className="bg-white/10 p-2 rounded-lg"><TrendingUp className="text-emerald-400" size={24} /></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-blue-200">
            <span>Limite MEI</span>
            <span>{percentUsed.toFixed(1)}% de {formatCurrency(MEI_LIMIT)}</span>
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div className={`h-full ${statusColor} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
          </div>
          <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${percentUsed > 80 ? 'text-amber-300' : 'text-emerald-300'}`}>
             {percentUsed > 80 ? <AlertTriangle size={12}/> : <CheckCircle size={12}/>} {statusText}
          </p>
        </div>
      </Card>

      {/* 2. Gráfico Mensal */}
      <div>
        <h3 className={`text-sm font-semibold ${COLORS.primaryText} mb-2 uppercase tracking-wider`}>Desempenho Mensal ({year})</h3>
        <div className="grid grid-cols-6 gap-2">
          {monthlyData.map((val, idx) => {
            const height = val > 0 ? Math.min((val / 15000) * 100, 100) : 5;
            const isZero = val === 0;
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className="w-full bg-white rounded-t-md h-24 relative flex items-end justify-center overflow-hidden border border-slate-200 shadow-sm">
                  <div className={`w-full mx-1 rounded-t-sm transition-all duration-500 ${isZero ? 'bg-slate-200' : 'bg-blue-600'}`} style={{ height: `${height}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">{MONTHS_SHORT[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. NOVO CARD: Faturamento Mensal */}
      <Card className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white border-none shadow-lg">
        <div className="flex flex-col gap-4">
           {/* Filtro de Mês */}
           <div className="flex items-center justify-between border-b border-emerald-600/50 pb-2">
              <p className="text-emerald-100 text-sm font-medium">Faturamento Mensal</p>
              <div className="flex items-center bg-black/20 rounded-full p-1">
                 <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={14}/></button>
                 <span className="text-xs font-bold w-20 text-center uppercase tracking-wide">{MONTHS[selectedMonthIndex]}</span>
                 <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={14}/></button>
              </div>
           </div>
           
           <div className="flex justify-between items-end">
              <div>
                 <h3 className="text-3xl font-bold text-white">{formatCurrency(monthlyRevenue)}</h3>
                 <p className="text-xs text-emerald-200 mt-1">Entradas em {MONTHS[selectedMonthIndex]} de {year}</p>
              </div>
              <div className="bg-white/10 p-2 rounded-lg"><Wallet className="text-emerald-300" size={24} /></div>
           </div>
        </div>
      </Card>

      {/* 4. Card Despesas */}
      <Card className="bg-gradient-to-br from-red-800 to-red-950 text-white border-none shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-red-200 text-sm font-medium mb-1">Total de Despesas ({year})</p>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</h3>
            <p className="text-xs text-red-300 mt-1">Saídas contabilizadas no período</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg"><TrendingDown className="text-red-300" size={24} /></div>
        </div>
      </Card>

      {/* 5. Calendário */}
      <CalendarWidget />

      {/* 6. Atalho Ajuda */}
      <div onClick={onContactClick} className="cursor-pointer bg-[#1B2A41] rounded-xl p-4 flex items-center justify-between shadow-lg text-white">
         <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-full text-white"><Phone size={20} /></div>
            <div><h4 className="font-bold text-sm">Precisa de Ajuda?</h4><p className="text-blue-200 text-xs">Fale com a SN Contabilidade</p></div>
         </div>
         <ChevronRight className="text-white" size={20} />
      </div>
    </div>
  );
};

const History = ({ transactions, onDelete, onEdit }) => {
  const [filterType, setFilterType] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const filtered = transactions.filter(t => {
     const matchesType = filterType === 'all' ? true : t.type === filterType;
     const tDate = new Date(t.date);
     const start = dateStart ? new Date(dateStart) : new Date('2000-01-01');
     const end = dateEnd ? new Date(dateEnd) : new Date('2100-01-01');
     return matchesType && tDate >= start && tDate <= end;
  });

  return (
    <div className="space-y-6 pb-20 animate-in pt-4">
      {/* Filtros */}
      <Card className="bg-white border-slate-200">
         <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-[#1B2A41]"/>
            <span className="text-xs font-bold text-[#1B2A41] uppercase">Filtros</span>
         </div>
         <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
               <label className="text-[10px] font-bold text-slate-500">De</label>
               <input type="date" className="w-full text-xs p-2 border rounded" value={dateStart} onChange={e => setDateStart(e.target.value)} />
            </div>
            <div>
               <label className="text-[10px] font-bold text-slate-500">Até</label>
               <input type="date" className="w-full text-xs p-2 border rounded" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
            </div>
         </div>
         <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            {['all', 'income', 'expense'].map(type => (
               <button key={type} onClick={() => setFilterType(type)} 
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === type ? 'bg-white shadow text-[#1B2A41]' : 'text-slate-400'}`}>
                  {type === 'all' ? 'Todos' : type === 'income' ? 'Entradas' : 'Saídas'}
               </button>
            ))}
         </div>
      </Card>

      {filtered.length === 0 ? <p className="text-center text-slate-400 py-10">Nenhum lançamento encontrado.</p> : 
        <div className="space-y-3">
           {filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map(t => (
             <Card key={t.id} className="flex justify-between items-center py-3 border-l-4" style={{borderLeftColor: t.type === 'income' ? '#10b981' : '#ef4444'}}>
                <div className="flex gap-3 items-center">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{t.type === 'income' ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}</div>
                   <div><p className="font-bold text-slate-800">{t.description}</p><p className="text-xs text-slate-500">{formatDate(t.date)}</p></div>
                </div>
                <div className="text-right">
                   <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</p>
                   <div className="flex justify-end gap-2 mt-1"><button onClick={() => onEdit(t)} className="text-blue-500"><Edit2 size={14}/></button><button onClick={() => onDelete(t.id)} className="text-red-400"><Trash2 size={14}/></button></div>
                </div>
             </Card>
           ))}
        </div>
      }
    </div>
  );
};

const DasManager = ({ dasList, onSaveDas, onDeleteDas }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentDas, setCurrentDas] = useState({ id: null, dueDate: '', paymentDate: '', status: 'pending', file: '' });
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const handleEdit = (das) => { setCurrentDas(das); setIsEditing(true); };
  const handleNew = () => { setCurrentDas({ id: Date.now(), dueDate: '', paymentDate: '', status: 'pending', file: '' }); setIsEditing(true); };
  const handleSubmit = (e) => { e.preventDefault(); onSaveDas(currentDas); setIsEditing(false); };

  const simulateAction = (action, das) => alert(`${action} simulado com sucesso para a DAS de vencimento ${formatDate(das.dueDate)}!`);

  const filteredList = dasList.filter(das => {
     if (!filterDateStart && !filterDateEnd) return true;
     const dasDate = new Date(das.dueDate);
     const start = filterDateStart ? new Date(filterDateStart) : new Date('2000-01-01');
     const end = filterDateEnd ? new Date(filterDateEnd) : new Date('2100-01-01');
     return dasDate >= start && dasDate <= end;
  });

  const checkStatus = (das) => {
    if (das.status === 'paid') return { color: 'text-emerald-600 bg-emerald-100', text: 'Pago', icon: <CheckCircle size={14}/> };
    const diffDays = Math.ceil((new Date(das.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { color: 'text-red-600 bg-red-100', text: 'Atrasado', icon: <AlertTriangle size={14}/> };
    if (diffDays <= 5) return { color: 'text-amber-600 bg-amber-100', text: 'Vence Logo', icon: <Clock size={14}/> };
    return { color: 'text-blue-600 bg-blue-100', text: 'Em dia', icon: <Clock size={14}/> };
  };

  return (
    <div className="space-y-6 pt-4 pb-20">
      <div className="flex justify-end">
        <button onClick={handleNew} className="text-xs bg-[#1B2A41] text-white px-3 py-2 rounded-full font-bold hover:bg-blue-900 shadow-lg flex items-center gap-2">+ Nova DAS</button>
      </div>

      <Card className="bg-slate-50 p-3">
         <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-bold"><Filter size={12}/> Filtrar por Vencimento</div>
         <div className="flex gap-2">
            <input type="date" className="w-full text-xs p-2 rounded border border-slate-200" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
            <input type="date" className="w-full text-xs p-2 rounded border border-slate-200" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
         </div>
      </Card>

      {filteredList.length === 0 ? <Card className="text-center py-8"><p className="text-slate-400 text-sm">Nenhuma DAS encontrada.</p></Card> : (
        <div className="space-y-3">
          {filteredList.sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate)).map(das => {
             const status = checkStatus(das);
             return (
              <Card key={das.id} className="flex flex-col gap-3">
                 <div className="flex justify-between items-start">
                    <div>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${status.color}`}>{status.icon} {status.text}</span>
                       <p className="font-bold text-slate-800 mt-1">Vencimento: {formatDate(das.dueDate)}</p>
                       {das.paymentDate && <p className="text-xs text-emerald-600">Pago em: {formatDate(das.paymentDate)}</p>}
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => simulateAction('Visualização', das)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Eye size={16}/></button>
                       <button onClick={() => simulateAction('Download', das)} className="p-1.5 bg-slate-50 text-slate-600 rounded hover:bg-slate-100"><Download size={16}/></button>
                       <button onClick={() => simulateAction('Upload', das)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"><CloudUpload size={16}/></button>
                       <button onClick={() => handleEdit(das)} className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"><Edit2 size={16}/></button>
                       <button onClick={() => onDeleteDas(das.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                    </div>
                 </div>
                 {das.file && <div className="text-xs bg-slate-50 p-2 rounded flex items-center gap-2 text-slate-600"><FileCheck size={12}/> {das.file}</div>}
              </Card>
             );
          })}
        </div>
      )}

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Gerenciar DAS">
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Data de Vencimento</label>
               <input type="date" required className="w-full p-2 border border-slate-300 rounded-lg" value={currentDas.dueDate} onChange={e => setCurrentDas({...currentDas, dueDate: e.target.value})} />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded text-[#1B2A41]" checked={currentDas.status === 'paid'} 
                    onChange={e => setCurrentDas({...currentDas, status: e.target.checked ? 'paid' : 'pending', paymentDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''})} />
                  <span className="font-bold text-slate-700">Marcar como Pago</span>
               </label>
               {currentDas.status === 'paid' && (
                 <div className="mt-3 animate-in fade-in">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Data do Pagamento</label>
                    <input type="date" required className="w-full p-2 border border-slate-300 rounded-lg text-sm" value={currentDas.paymentDate} onChange={e => setCurrentDas({...currentDas, paymentDate: e.target.value})} />
                 </div>
               )}
            </div>
            <Button type="submit" className="w-full">Salvar Alterações</Button>
         </form>
      </Modal>
    </div>
  );
};

const LearnMore = () => (
  <div className="pb-24 animate-in slide-in-from-right-8 duration-500 pt-4 space-y-6">
    <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Portais Oficiais</h3>
        <div className="grid grid-cols-1 gap-4">
            <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei" target="_blank" rel="noreferrer" 
               className="bg-[#1B2A41] p-4 rounded-xl flex items-center justify-between shadow-md border border-[#1B2A41] hover:opacity-90 transition-all group">
                <div className="flex items-center gap-3 text-white">
                   <div className="bg-white/10 p-2 rounded-lg"><Globe size={24} /></div>
                   <div><h4 className="font-bold">PORTAL MEI MENU</h4><p className="text-xs text-blue-200">Serviços Completos Gov.br</p></div>
                </div>
                <ExternalLink size={18} className="text-white"/>
            </a>

            <div className="grid grid-cols-2 gap-3">
                <a href="https://www.gov.br/nfse/pt-br" target="_blank" rel="noreferrer" className="bg-white p-3 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-slate-200 shadow-sm hover:border-blue-500">
                    <FileText className="text-blue-600" size={24} /><span className="text-xs font-bold text-slate-700">Emitir Nota Fiscal</span>
                </a>
                <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/pagamento-de-contribuicao-mensal" target="_blank" rel="noreferrer" className="bg-white p-3 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-slate-200 shadow-sm hover:border-emerald-500">
                    <Wallet className="text-emerald-600" size={24} /><span className="text-xs font-bold text-slate-700">Emitir Guia DAS</span>
                </a>
            </div>
        </div>
    </div>

    <div>
      <h3 className={`text-sm font-bold ${COLORS.primaryText} uppercase tracking-wide mb-3`}>Benefícios do MEI</h3>
      <div className="space-y-4">
        {[
          { title: "Portal Meu INSS", link: "https://meu.inss.gov.br/", desc: "Consulte benefícios e contribuições.", icon: <Globe className="text-blue-500" /> },
          { title: "Acesso a Crédito", desc: "Linhas de crédito especiais com juros reduzidos para MEI.", icon: <Wallet className="text-emerald-500" /> },
          { title: "Isenção de Tributos", desc: "Isento de IRPJ, CSLL, PIS, COFINS e IPI (Federal).", icon: <Shield className="text-indigo-500" /> },
          { title: "Aposentadoria", desc: "Idade: Mulheres (62), Homens (65). Min. 180 meses.", icon: <CalendarIcon className="text-blue-500" /> },
          { title: "Auxílio Incapacidade", desc: "Carência de 12 meses. Isento em acidentes.", icon: <AlertTriangle className="text-amber-500" /> },
          { title: "Salário-Maternidade", desc: "120 dias. Carência de 10 meses.", icon: <Wallet className="text-pink-500" /> },
        ].map((item, idx) => (
          <Card key={idx} className="flex gap-4 items-start hover:shadow-md transition-shadow cursor-default border-l-4 border-l-[#1B2A41]">
            <div className="mt-1 bg-slate-50 p-2 rounded-full h-fit border border-slate-100">{item.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              {item.link && (
                 <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold mt-2 inline-flex items-center gap-1 hover:underline">
                    Acessar site <ExternalLink size={10}/>
                 </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const ContactView = () => {
  const WHATSAPP_MAIN = "48988532258"; 
  const WHATSAPP_COMERCIAL = "48920003290";
  const WEBSITE_LINK = "https://www.sncontabilidade.net";
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="pb-24 animate-in pt-4 space-y-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-[#1B2A41] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-xl border-4 border-white">SN</div>
        <h3 className={`text-xl font-bold ${COLORS.primaryText}`}>SN Contabilidade</h3>
        <p className={`text-sm ${COLORS.accent} font-semibold mb-2`}>Excelência em Contabilidade</p>
      </div>

      <div className="space-y-4">
        {/* WhatsApp Principal */}
        <Button variant="whatsapp" className="w-full py-4 text-lg shadow-green-200" onClick={() => window.open(`https://wa.me/55${WHATSAPP_MAIN}`, '_blank')}>
          <MessageCircle className="mr-3" size={24} /> Falar no WhatsApp
        </Button>

        {/* Comercial */}
        <Card className="flex items-center justify-between border-l-4 border-l-blue-900 cursor-pointer hover:bg-slate-50" onClick={() => window.open(`https://wa.me/55${WHATSAPP_COMERCIAL}`, '_blank')}>
            <div className="flex items-center gap-3">
               <div className="bg-blue-100 p-2 rounded-full text-blue-800"><MessageCircle size={20}/></div>
               <div><h4 className="font-bold text-sm text-slate-800">Comercial</h4><p className="text-xs text-slate-500">Falar com Vendas</p></div>
            </div>
            <ExternalLink size={16} className="text-slate-400"/>
        </Card>

        {/* E-mails Setorizados */}
        <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase ml-1">E-mails por Setor</h4>
            {[
               {label: 'Setor Comercial', email: 'comercial@sncontabilidade.net', icon: <Mail size={16}/>},
               {label: 'Setor Contábil', email: 'contabil@sncontabilidade.net', icon: <FileText size={16}/>},
               {label: 'Setor Financeiro', email: 'financeiro@sncontabilidade.net', icon: <DollarSign size={16}/>}
            ].map((item, idx) => (
               <Card key={idx} className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50" onClick={() => window.location.href = `mailto:${item.email}`}>
                  <div className="flex items-center gap-3">
                     <div className="text-[#1B2A41]">{item.icon}</div>
                     <div><h5 className="font-bold text-xs text-slate-800">{item.label}</h5><p className="text-[10px] text-slate-500">{item.email}</p></div>
                  </div>
                  <Mail size={14} className="text-slate-300"/>
               </Card>
            ))}
        </div>

        <button onClick={() => setShowPrivacy(true)} className="w-full mt-4 flex items-center justify-center gap-2 text-slate-500 text-sm py-3 border border-slate-200 rounded-lg hover:bg-white transition-all">
           <Shield size={16} /> Política de Privacidade
        </button>
      </div>

      <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Política de Privacidade">
         <div className="text-sm text-slate-600 space-y-4">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 text-xs flex gap-2">
               <AlertTriangle size={32} className="shrink-0"/>
               <p><strong>OFFLINE LOCAL:</strong> Todos os seus dados são salvos EXCLUSIVAMENTE na memória do seu celular.</p>
            </div>
            <p>1. <strong>Coleta:</strong> Não enviamos dados para servidores.</p>
            <p>2. <strong>Segurança:</strong> Se limpar o cache, os dados somem.</p>
         </div>
      </Modal>
    </div>
  );
};

const CompanyProfileModal = ({ isOpen, onClose, data, onSave }) => {
  const [formData, setFormData] = useState(data);
  useEffect(() => { setFormData(data); }, [data, isOpen]);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); onClose(); };

  if (!isOpen) return null;
  return (
     <Modal isOpen={isOpen} onClose={onClose} title="Perfil da Empresa">
        <form onSubmit={handleSubmit} className="space-y-4">
           <div><label className="block text-xs font-bold text-slate-500 mb-1">CNPJ</label><input name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full p-2 border rounded" placeholder="00.000.000/0001-00" /></div>
           <div><label className="block text-xs font-bold text-slate-500 mb-1">Razão Social</label><input name="socialName" value={formData.socialName} onChange={handleChange} className="w-full p-2 border rounded" /></div>
           <div><label className="block text-xs font-bold text-slate-500 mb-1">Nome Fantasia (Aparece no App)</label><input name="fantasyName" value={formData.fantasyName} onChange={handleChange} className="w-full p-2 border rounded" /></div>
           <div><label className="block text-xs font-bold text-slate-500 mb-1">Endereço Comercial</label><input name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded" /></div>
           <Button type="submit" className="w-full">Salvar Perfil</Button>
        </form>
     </Modal>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [editingItem, setEditingItem] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [companyData, setCompanyData] = useState(() => {
     const saved = localStorage.getItem('sn_company');
     return saved ? JSON.parse(saved) : { cnpj: '', socialName: '', fantasyName: '', address: '' };
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('sn_transactions');
    if (saved) return JSON.parse(saved);
    return [{ id: 1, amount: 5000, date: `${new Date().getFullYear()}-01-15`, description: 'Serviços de Consultoria', type: 'income' }];
  });

  const [dasList, setDasList] = useState(() => {
     const saved = localStorage.getItem('sn_das');
     return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem('sn_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('sn_company', JSON.stringify(companyData)), [companyData]);
  useEffect(() => localStorage.setItem('sn_das', JSON.stringify(dasList)), [dasList]);

  const saveTransaction = (t) => {
    setTransactions(prev => prev.some(item => item.id === t.id) ? prev.map(item => item.id === t.id ? t : item) : [...prev, t]);
    setEditingItem(null); setActiveTab('dashboard'); 
  };
  const deleteTransaction = (id) => { if(window.confirm("Apagar?")) setTransactions(prev => prev.filter(t => t.id !== id)); };
  const saveDas = (das) => setDasList(prev => prev.some(d => d.id === das.id) ? prev.map(d => d.id === das.id ? das : d) : [...prev, das]);
  const deleteDas = (id) => { if(window.confirm("Excluir DAS?")) setDasList(prev => prev.filter(d => d.id !== id)); };

  const TransactionForm = () => {
     const [form, setForm] = useState(editingItem || { amount: '', date: new Date().toISOString().split('T')[0], description: '', type: 'income' });
     const handleSubmit = (e) => { e.preventDefault(); if(!form.amount) return; saveTransaction({...form, id: form.id || Date.now(), amount: parseFloat(form.amount)}); };
     
     return (
       <div className="pb-20 animate-in pt-4">
          <Card>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                   <button type="button" onClick={() => setForm({...form, type: 'income'})} className={`py-2 text-sm font-semibold rounded ${form.type === 'income' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500'}`}>Entrada</button>
                   <button type="button" onClick={() => setForm({...form, type: 'expense'})} className={`py-2 text-sm font-semibold rounded ${form.type === 'expense' ? 'bg-white text-red-600 shadow' : 'text-slate-500'}`}>Saída</button>
                </div>
                <div><label className="text-sm font-bold text-slate-600">Valor</label><input type="number" step="0.01" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm font-bold text-slate-600">Data</label><input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-2 border rounded" /></div>
                <div><label className="text-sm font-bold text-slate-600">Descrição</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 border rounded" /></div>
                <Button type="submit" className="w-full">{editingItem ? 'Atualizar' : 'Salvar'}</Button>
             </form>
          </Card>
       </div>
     );
  };

  const renderHeaderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="flex items-center justify-between mt-2">
               <h2 className="text-xl font-bold text-white">Visão Geral</h2>
               <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/20 backdrop-blur-sm">
                  <button onClick={() => setCurrentYear(currentYear - 1)} className="p-1 hover:bg-white/10 rounded-full text-white"><ChevronLeft size={16}/></button>
                  <span className="mx-3 font-semibold text-white">{currentYear}</span>
                  <button onClick={() => setCurrentYear(currentYear + 1)} className="p-1 hover:bg-white/10 rounded-full text-white"><ChevronRight size={16}/></button>
               </div>
            </div>
          </>
        );
      case 'history': return <h2 className="text-xl font-bold text-white mt-2">Histórico de Notas</h2>;
      case 'das': return <h2 className="text-xl font-bold text-white mt-2">Minhas DAS</h2>;
      case 'learnMore': return <h2 className="text-xl font-bold text-white mt-2">Saiba Mais</h2>;
      case 'contact': return <h2 className="text-xl font-bold text-white mt-2">Fale com a Contabilidade</h2>;
      case 'add': return <h2 className="text-xl font-bold text-white mt-2">Novo Lançamento</h2>;
      default: return null;
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard transactions={transactions} year={currentYear} onContactClick={() => setActiveTab('contact')} companyData={companyData} />;
      case 'add': return <TransactionForm />;
      case 'history': return <History transactions={transactions} onDelete={deleteTransaction} onEdit={(t) => {setEditingItem(t); setActiveTab('add')}} />;
      case 'das': return <DasManager dasList={dasList} onSaveDas={saveDas} onDeleteDas={deleteDas} />;
      case 'learnMore': return <LearnMore />;
      case 'contact': return <ContactView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${COLORS.background} font-sans text-slate-900 flex justify-center`}>
      <div className={`w-full max-w-md ${COLORS.background} min-h-screen relative shadow-2xl overflow-hidden flex flex-col`}>
        <header className={`${COLORS.primary} text-white p-6 pb-8 rounded-b-[2.5rem] shadow-lg z-10 transition-all`}>
          <div className="flex justify-between items-center mb-2">
            <div>
               <span className="text-[#d4af37] text-xs font-bold uppercase tracking-widest">App Oficial</span>
               <h1 className="text-2xl font-bold leading-none">SN Contabilidade</h1>
               <span className="text-xs text-blue-200 font-medium block mt-1">Exclusivo para MEI</span>
            </div>
            <button onClick={() => setShowProfile(true)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 relative">
               <User className="text-white" size={24} />
               {!companyData.cnpj && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1B2A41]"></span>}
            </button>
          </div>
          {renderHeaderContent()}
        </header>

        <main className="flex-1 px-4 -mt-4 z-20 overflow-y-auto pb-24 scroll-smooth">{renderContent()}</main>

        <nav className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-2 py-4 flex justify-between items-center z-30 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
          {[
            {id:'dashboard', icon:PieChart, label:'Início'}, 
            {id:'history', icon:CalendarIcon, label:'Notas'}, 
            {id:'das', icon:FileText, label:'DAS'}, 
            {id:'learnMore', icon:Info, label:'Mais'}, 
            {id:'contact', icon:Phone, label:'Contato'}
          ].map(item => (
             <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 w-14 ${activeTab === item.id ? 'text-[#1B2A41] font-bold' : 'text-slate-400'}`}>
                <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} /><span className="text-[9px]">{item.label}</span>
             </button>
          ))}
          {/* Botão FAB flutuante ajustado para não cobrir itens */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-12 pointer-events-none">
             {/* Espaço reservado para visual, o botão real é via aba 'add' no fluxo, mas podemos adicionar um botão de ação rápida */}
             <button onClick={() => { setEditingItem(null); setActiveTab('add'); }} className="pointer-events-auto bg-[#1B2A41] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-[#FEF8E5] hover:scale-105 transition-transform"><Plus size={24} /></button>
          </div>
        </nav>

        <CompanyProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} data={companyData} onSave={setCompanyData} />
      </div>
    </div>
  );
}
