import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  ListFilter,
  Plus,
  PieChart,
  Sun,
  Moon,
  CreditCard,
  Coffee,
  ShoppingBag,
  Smartphone,
  Car,
  Home,
  Utensils,
  ArrowLeftRight,
  LayoutGrid,
  List as ListIcon,
  Delete,
  Loader2,
  Banknote,
  Gift,
  TrendingUp,
  Award,
  User,
  Settings,
  Crown,
  Zap,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import Slider from "react-slick";
import { SlickStyles } from "./components/ui/SlickStyles";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";

// --- Types & Config ---

type Theme = "light" | "dark";
type View = "home" | "details" | "add" | "profile" | "stats";

interface Transaction {
  id: string;
  category: string;
  amount: number;
  date: string;
  timestamp?: number;
  iconName: string;
  color: string;
  image?: string;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-63cf4c5a`;

const ICON_MAP: Record<string, React.ElementType> = {
  Coffee,
  ShoppingBag,
  Car,
  CreditCard,
  Utensils,
  Smartphone,
  Home,
  Wallet,
  Banknote,
  Gift,
  TrendingUp,
  Award,
};

// Seed data for first-time use
const INITIAL_DATA: Omit<Transaction, "id">[] = [
  {
    category: "下午茶",
    amount: -28.5,
    date: "1月19日",
    iconName: "Coffee",
    color: "bg-orange-100 text-orange-600",
    image:
      "https://images.unsplash.com/photo-1751151015825-e68d02db0a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    category: "服饰",
    amount: -359.0,
    date: "1月18日",
    iconName: "ShoppingBag",
    color: "bg-teal-100 text-teal-600",
    image:
      "https://images.unsplash.com/photo-1758328537049-aae2d077f1dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    category: "交通",
    amount: -12.0,
    date: "1月18日",
    iconName: "Car",
    color: "bg-blue-100 text-blue-600",
  },
  {
    category: "工资",
    amount: 8500.0,
    date: "1月15日",
    iconName: "CreditCard",
    color: "bg-green-100 text-green-600",
    image:
      "https://images.unsplash.com/photo-1683998781662-58a977404502?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    category: "餐饮",
    amount: -45.0,
    date: "1月14日",
    iconName: "Utensils",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    category: "话费",
    amount: -100.0,
    date: "1月10日",
    iconName: "Smartphone",
    color: "bg-purple-100 text-purple-600",
  },
];

const TAGS = [
  {
    id: "餐饮",
    icon: Utensils,
    iconName: "Utensils",
    color: "text-orange-500 bg-orange-100",
    wrapperColor: "bg-orange-100 text-orange-600",
  },
  {
    id: "购物",
    icon: ShoppingBag,
    iconName: "ShoppingBag",
    color: "text-pink-500 bg-pink-100",
    wrapperColor: "bg-pink-100 text-pink-600",
  },
  {
    id: "交通",
    icon: Car,
    iconName: "Car",
    color: "text-blue-500 bg-blue-100",
    wrapperColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "奶茶",
    icon: Coffee,
    iconName: "Coffee",
    color: "text-teal-500 bg-teal-100",
    wrapperColor: "bg-teal-100 text-teal-600",
  },
  {
    id: "话费",
    icon: Smartphone,
    iconName: "Smartphone",
    color: "text-purple-500 bg-purple-100",
    wrapperColor: "bg-purple-100 text-purple-600",
  },
  {
    id: "住房",
    icon: Home,
    iconName: "Home",
    color: "text-indigo-500 bg-indigo-100",
    wrapperColor: "bg-indigo-100 text-indigo-600",
  },
];

const INCOME_TAGS = [
  {
    id: "工资",
    icon: Banknote,
    iconName: "Banknote",
    color: "text-green-500 bg-green-100",
    wrapperColor: "bg-green-100 text-green-600",
  },
  {
    id: "兼职",
    icon: Wallet,
    iconName: "Wallet",
    color: "text-blue-500 bg-blue-100",
    wrapperColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "理财",
    icon: TrendingUp,
    iconName: "TrendingUp",
    color: "text-red-500 bg-red-100",
    wrapperColor: "bg-red-100 text-red-600",
  },
  {
    id: "红包",
    icon: Gift,
    iconName: "Gift",
    color: "text-pink-500 bg-pink-100",
    wrapperColor: "bg-pink-100 text-pink-600",
  },
  {
    id: "奖金",
    icon: Award,
    iconName: "Award",
    color: "text-yellow-500 bg-yellow-100",
    wrapperColor: "bg-yellow-100 text-yellow-600",
  },
];

// --- API Helpers ---

async function fetchTransactions() {
  const res = await fetch(`${API_URL}/transactions`, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function createTransaction(
  data: Omit<Transaction, "id">,
) {
  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}

// --- Components ---

const NavBar = ({
  active,
  onChange,
}: {
  active: View;
  onChange: (v: View) => void;
}) => {
  const items = [
    { id: "home", icon: Wallet, label: "首页" },
    { id: "details", icon: ListFilter, label: "明细" },
    { id: "add", icon: Plus, label: "记账", isFab: true },
    { id: "stats", icon: PieChart, label: "统计" },
    { id: "profile", icon: User, label: "我的" },
  ];

  return (
    <div className="absolute bottom-6 left-4 right-4 h-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-around px-2 z-50 border border-slate-100 dark:border-slate-700">
      {items.map((item) => {
        const isActive = active === item.id;
        if (item.isFab) {
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(item.id as View)}
              className="relative -top-6 w-14 h-14 rounded-full bg-gradient-to-tr from-orange-400 to-teal-300 shadow-xl flex items-center justify-center text-white border-4 border-slate-50 dark:border-slate-900"
            >
              <Plus size={28} strokeWidth={3} />
            </motion.button>
          );
        }
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id as View)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
              isActive
                ? "text-teal-500 dark:text-teal-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <item.icon
              size={24}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium mt-1">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const HomeView = ({
  transactions,
  loading,
}: {
  transactions: Transaction[];
  loading: boolean;
}) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const [canRenderChart, setCanRenderChart] = useState(false);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  const { income, expense, balance, chartData } =
    useMemo(() => {
      let inc = 0,
        exp = 0;
      const dailyData: Record<
        string,
        { expense: number; income: number }
      > = {};

      transactions.forEach((t) => {
        const day = t.date.replace(/[^0-9]/g, ""); // Extract numbers
        if (!dailyData[day])
          dailyData[day] = { expense: 0, income: 0 };

        if (t.amount > 0) {
          inc += t.amount;
          dailyData[day].income += t.amount;
        } else {
          exp += Math.abs(t.amount);
          dailyData[day].expense += Math.abs(t.amount);
        }
      });

      const data = Object.keys(dailyData)
        .map((d) => ({
          day: d,
          expense: dailyData[d].expense,
          income: dailyData[d].income,
        }))
        .slice(-7);

      if (data.length === 0) {
        // Fallback chart data
        return {
          income: inc,
          expense: exp,
          balance: inc - exp,
          chartData: [
            { day: "1", expense: 20, income: 50 },
            { day: "5", expense: 120, income: 30 },
            { day: "10", expense: 80, income: 100 },
          ],
        };
      }

      return {
        income: inc,
        expense: exp,
        balance: inc - exp,
        chartData: data,
      };
    }, [transactions]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    const timer = setTimeout(() => {
      if (!chartContainerRef.current) return;
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setContainerSize({ width, height });
            setCanRenderChart(true);
          }
        }
      });
      resizeObserver.observe(chartContainerRef.current);
      const styles = window.getComputedStyle(
        chartContainerRef.current,
      );
      const width =
        chartContainerRef.current.clientWidth -
        parseFloat(styles.paddingLeft) -
        parseFloat(styles.paddingRight);
      const height =
        chartContainerRef.current.clientHeight -
        parseFloat(styles.paddingTop) -
        parseFloat(styles.paddingBottom);
      if (width > 0 && height > 0) {
        setContainerSize({ width, height });
        setCanRenderChart(true);
      }
    }, 100);
    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6 pt-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center px-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            早安，Alex! 👋
          </h1>
          <p className="text-slate-500 text-sm dark:text-slate-400">
            又是元气满满的一天
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-200 to-teal-200 overflow-hidden border-2 border-white dark:border-slate-700">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="avatar"
          />
        </div>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-4 h-48 rounded-[2rem] bg-gradient-to-br from-orange-400 to-teal-300 p-6 text-white shadow-xl shadow-orange-200/50 dark:shadow-none relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <p className="text-orange-50 font-medium opacity-90">
              本月钱包余额
            </p>
            <h2 className="text-4xl font-bold mt-2">
              ¥ {balance.toLocaleString()}
            </h2>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="flex items-center gap-1 text-orange-100 text-sm mb-1">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  ↓
                </div>
                支出
              </div>
              <p className="font-semibold text-lg">
                ¥ {expense.toLocaleString()}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-teal-100 text-sm mb-1">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  ↑
                </div>
                收入
              </div>
              <p className="font-semibold text-lg">
                ¥ {income.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Section */}
      <div className="px-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            本月收支总览
          </h3>
          <button className="text-xs text-teal-500 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full font-medium">
            查看报表
          </button>
        </div>
        <div
          ref={chartContainerRef}
          className="h-48 w-full bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
          style={{ minHeight: "192px", minWidth: "200px" }}
        >
          {canRenderChart &&
          containerSize.width > 0 &&
          containerSize.height > 0 ? (
            <AreaChart
              width={containerSize.width}
              height={containerSize.height}
              data={chartData}
            >
              <defs>
                <linearGradient
                  id="colorExpense"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#FB923C"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#FB923C"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="colorIncome"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#2DD4BF"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#2DD4BF"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                cursor={{
                  stroke: "#cbd5e1",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#2DD4BF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#FB923C"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
              <span className="animate-pulse">
                Loading Chart...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="px-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
          最近三笔
        </h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-slate-400 py-4">
              <Loader2 className="animate-spin inline mr-2" />
              Loading...
            </div>
          ) : (
            transactions.slice(0, 3).map((t, i) => {
              const Icon = ICON_MAP[t.iconName] || Wallet;
              return (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {t.category}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${t.amount > 0 ? "text-teal-500" : "text-slate-800 dark:text-white"}`}
                  >
                    {t.amount > 0 ? "+" : ""}
                    {t.amount}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const CATEGORY_IMAGES: Record<string, string> = {
  餐饮: "https://images.unsplash.com/photo-1737141500169-4208e3296b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGluaW5nJTIwZGVsaWNpb3VzfGVufDF8fHx8MTc2ODgyMTQzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  购物: "https://images.unsplash.com/photo-1650625706210-eabfcc942fd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBmYXNoaW9ufGVufDF8fHx8MTc2ODgyMTQzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  交通: "https://images.unsplash.com/photo-1768224723729-b9c19e7381e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwY2FyJTIwY2l0eSUyMHN0cmVldHxlbnwxfHx8fDE3Njg4MjE0MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  奶茶: "https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWJibGUlMjB0ZWElMjBkcmlua3xlbnwxfHx8fDE3Njg3MTA0MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  话费: "https://images.unsplash.com/photo-1758599543117-f996daf4978b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMGNvbW11bmljYXRpb258ZW58MXx8fHwxNzY4Nzc4Mzg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  住房: "https://images.unsplash.com/photo-1650091507687-5ea34d80e674?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwaW50ZXJpb3IlMjBjb3p5JTIwbGl2aW5nJTIwcm9vbXxlbnwxfHx8fDE3Njg4MjE0MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";

const DetailsView = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const [mode, setMode] = useState<"list" | "card">("list");

  const cardTransactions = useMemo(() => {
    return transactions.map((t) => ({
      ...t,
      image:
        t.image || CATEGORY_IMAGES[t.category] || DEFAULT_IMAGE,
    }));
  }, [transactions]);

  const sliderSettings = {
    dots: true,
    className: "center",
    centerMode: true,
    infinite: false,
    centerPadding: "40px",
    slidesToShow: 1,
    speed: 500,
    arrows: false,
    dotsClass: "slick-dots !bottom-[-20px]", // Customize dots position
    focusOnSelect: true,
  };

  return (
    <div className="h-full flex flex-col pt-4 pb-24">
      <div className="px-6 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          账单明细
        </h2>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1">
          <button
            onClick={() => setMode("list")}
            className={`p-2 rounded-full transition-all ${mode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-teal-500" : "text-slate-400"}`}
          >
            <ListIcon size={20} />
          </button>
          <button
            onClick={() => setMode("card")}
            className={`p-2 rounded-full transition-all ${mode === "card" ? "bg-white dark:bg-slate-700 shadow-sm text-orange-500" : "text-slate-400"}`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
        <AnimatePresence mode="wait">
          {mode === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {transactions.map((t, i) => {
                const Icon = ICON_MAP[t.iconName] || Wallet;
                return (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={t.id}
                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${t.color} flex items-center justify-center`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">
                          {t.category}
                        </p>
                        <p className="text-xs text-slate-400">
                          {t.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-lg font-bold ${t.amount > 0 ? "text-teal-500" : "text-slate-800 dark:text-white"}`}
                    >
                      {t.amount > 0 ? "+" : ""}
                      {t.amount}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-6"
            >
              {cardTransactions.length > 0 ? (
                <Slider {...sliderSettings}>
                  {cardTransactions.map((t) => {
                    const Icon = ICON_MAP[t.iconName] || Wallet;
                    return (
                      <div
                        key={t.id}
                        className="px-2 outline-none"
                      >
                        <div className="relative w-full aspect-[9/14] rounded-3xl overflow-hidden shadow-2xl group transition-all duration-300 transform hover:scale-[1.02]">
                          <img
                            src={t.image}
                            alt={t.category}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />

                          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className={`w-10 h-10 rounded-full ${t.color} bg-opacity-90 backdrop-blur flex items-center justify-center`}
                              >
                                <Icon size={16} />
                              </div>
                              <span className="font-bold text-lg opacity-90">
                                {t.category}
                              </span>
                            </div>
                            <div className="flex justify-between items-end border-t border-white/20 pt-4">
                              <div>
                                <p className="text-white/60 text-sm mb-1">
                                  {t.date}
                                </p>
                                <p className="text-4xl font-bold tracking-tight">
                                  {t.amount > 0 ? "+" : ""}
                                  {t.amount}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Slider>
              ) : (
                <div className="text-center text-slate-400 py-20">
                  <p>暂无带图账单</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProfileView = () => {
  const menuItems = [
    {
      icon: Crown,
      label: "我的徽章",
      value: "Lv.5",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Settings,
      label: "类别设置",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Shield,
      label: "数据安全",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Zap,
      label: "Pro 会员",
      value: "开通",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 pt-4 pb-24 px-6 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          个人中心
        </h2>
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Settings
            size={20}
            className="text-slate-600 dark:text-slate-400"
          />
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-200 to-teal-200 p-1">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-800"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Alex
          </h3>
          <p className="text-slate-400 text-sm">
            记账第 128 天
          </p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full">
              存钱达人
            </span>
            <span className="px-2 py-0.5 bg-teal-100 text-teal-600 text-[10px] font-bold rounded-full">
              自律标兵
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-98 transition-transform border border-slate-100 dark:border-slate-700/50"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}
              >
                <item.icon size={20} />
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {item.value && (
                <span className="text-sm font-medium text-slate-400">
                  {item.value}
                </span>
              )}
              <ChevronRight
                size={18}
                className="text-slate-300"
              />
            </div>
          </button>
        ))}

        <button className="w-full mt-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-red-500 font-bold active:scale-95 transition-transform">
          <LogOut size={18} />
          退出登录
        </button>
      </div>
    </div>
  );
};

const AddView = ({
  onAdd,
}: {
  onAdd: (data: Omit<Transaction, "id">) => Promise<void>;
}) => {
  const [amount, setAmount] = useState("0");
  const [transactionType, setTransactionType] = useState<
    "expense" | "income"
  >("expense");
  // Auto-select first tag when switching types
  const currentTags =
    transactionType === "expense" ? TAGS : INCOME_TAGS;
  const [selectedTagId, setSelectedTagId] = useState(
    currentTags[0].id,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedTagId(currentTags[0].id);
  }, [transactionType]);

  const handleNumPress = (num: string) => {
    if (amount === "0" && num !== ".") setAmount(num);
    else setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    if (amount.length > 1)
      setAmount((prev) => prev.slice(0, -1));
    else setAmount("0");
  };

  const handleSubmit = async () => {
    if (amount === "0" || isSubmitting) return;
    setIsSubmitting(true);
    const tag =
      currentTags.find((t) => t.id === selectedTagId) ||
      currentTags[0];
    const numericAmount = parseFloat(amount);
    const finalAmount =
      transactionType === "expense"
        ? -numericAmount
        : numericAmount;

    const newTransaction = {
      category: tag.id,
      amount: finalAmount,
      date:
        new Date().toLocaleDateString("zh-CN", {
          month: "numeric",
          day: "numeric",
        }) + "日",
      timestamp: Date.now(),
      iconName: tag.iconName,
      color: tag.wrapperColor,
    };
    try {
      await onAdd(newTransaction);
      setAmount("0"); // Reset
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Type Switcher */}
      <div className="flex justify-center pt-6">
        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-full p-1 relative">
          <motion.div
            layoutId="active-pill"
            className={`absolute inset-1 w-[calc(50%-4px)] rounded-full shadow-sm ${transactionType === "expense" ? "bg-white left-1" : "bg-white left-[calc(50%+4px)]"} `}
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
          <button
            onClick={() => setTransactionType("expense")}
            className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${transactionType === "expense" ? "text-slate-800" : "text-slate-500"}`}
          >
            支出
          </button>
          <button
            onClick={() => setTransactionType("income")}
            className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${transactionType === "income" ? "text-slate-800" : "text-slate-500"}`}
          >
            收入
          </button>
        </div>
      </div>

      {/* Display Area */}
      <div className="flex-1 flex flex-col justify-end p-6 pb-0">
        <div className="mb-8 text-right">
          <p className="text-slate-400 text-sm mb-2">
            {transactionType === "expense"
              ? "支出金额"
              : "收入金额"}
          </p>
          <motion.div
            key={amount}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-6xl font-bold tracking-tight ${transactionType === "expense" ? "text-slate-800 dark:text-white" : "text-teal-500"}`}
          >
            {transactionType === "expense" ? "" : "+"}¥ {amount}
          </motion.div>
        </div>

        {/* Tags */}
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {currentTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTagId(tag.id)}
              className={`flex flex-col items-center gap-2 min-w-[4rem] transition-all ${selectedTagId === tag.id ? "opacity-100 scale-110" : "opacity-50 scale-100"}`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${tag.color}`}
              >
                <tag.icon size={24} />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {tag.id}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div className="bg-white dark:bg-slate-800 rounded-t-[2.5rem] p-6 pb-24 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4 gap-4">
          {[
            1,
            2,
            3,
            "+",
            4,
            5,
            6,
            "-",
            7,
            8,
            9,
            "OK",
            ".",
            0,
            "DEL",
          ].map((key) => {
            const isOperator = ["+", "-", "OK", "DEL"].includes(
              key.toString(),
            );

            if (key === "OK")
              return (
                <button
                  key={key}
                  onClick={handleSubmit}
                  className={`row-span-2 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-lg dark:shadow-none active:scale-95 transition-transform ${transactionType === "expense" ? "bg-teal-400 shadow-teal-200" : "bg-green-500 shadow-green-200"}`}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "OK"
                  )}
                </button>
              );

            return (
              <button
                key={key}
                onClick={() =>
                  key === "DEL"
                    ? handleDelete()
                    : typeof key !== "object" &&
                      handleNumPress(key.toString())
                }
                className={`h-16 rounded-2xl font-bold text-xl flex items-center justify-center transition-all active:scale-95
                  ${
                    isOperator
                      ? "bg-orange-50 text-orange-500 dark:bg-slate-700 dark:text-orange-400"
                      : "bg-slate-50 text-slate-800 dark:bg-slate-700 dark:text-white hover:bg-slate-100"
                  }`}
              >
                {key === "DEL" ? <Delete size={20} /> : key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatsView = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const stats = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    let totalExp = 0;

    transactions.forEach((t) => {
      if (t.amount < 0) {
        const absAmount = Math.abs(t.amount);
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + absAmount;
        categoryCounts[t.category] =
          (categoryCounts[t.category] || 0) + 1;
        totalExp += absAmount;
      }
    });

    // Top Expense Category
    const sortedByExpense = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    );
    const topExpense = sortedByExpense[0] || ["无", 0];

    // Top Frequency Category
    const sortedByCount = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const topFreq = sortedByCount[0] || ["无", 0];

    // Chart Data
    const chartData = sortedByExpense.map(([name, value]) => ({
      name,
      value,
      color:
        TAGS.find((t) => t.id === name)
          ?.wrapperColor.split(" ")[0]
          .replace("bg-", "#") || "#94a3b8",
    }));

    // Fix colors to actual hex values for chart since Tailwind classes won't work in Recharts fill
    const colorMap: Record<string, string> = {
      餐饮: "#fb923c", // orange-400
      购物: "#f472b6", // pink-400
      交通: "#60a5fa", // blue-400
      奶茶: "#2dd4bf", // teal-400
      话费: "#c084fc", // purple-400
      住房: "#818cf8", // indigo-400
    };

    const coloredChartData = chartData.map((d) => ({
      ...d,
      fill: colorMap[d.name] || "#cbd5e1",
    }));

    return {
      totalExp,
      topExpense: {
        name: topExpense[0],
        amount: topExpense[1],
      },
      topFreq: { name: topFreq[0], count: topFreq[1] },
      chartData: coloredChartData,
    };
  }, [transactions]);

  // Insights Logic
  const getExpenseInsight = (category: string) => {
    const map: Record<
      string,
      {
        title: string;
        desc: string;
        icon: string;
        bg: string;
        shadow: string;
      }
    > = {
      餐饮: {
        title: "干饭人干饭魂 🍚",
        desc: "唯有美食不可辜负，但也要注意恩格尔系数哦！",
        icon: "🍗",
        bg: "bg-orange-400",
        shadow: "shadow-orange-200",
      },
      购物: {
        title: "千手观音下凡 🛍️",
        desc: "新衣服虽好，衣柜快塞不下啦，建议断舍离～",
        icon: "👗",
        bg: "bg-pink-400",
        shadow: "shadow-pink-200",
      },
      交通: {
        title: "城市旅行家 🚗",
        desc: "在此城市穿梭的每一公里，都是为了抵达梦想。",
        icon: "🚕",
        bg: "bg-blue-400",
        shadow: "shadow-blue-200",
      },
      奶茶: {
        title: "奶茶星人 🥤",
        desc: "今日份糖分超标！建议下周少喝一杯，钱包和体重都开心。",
        icon: "🥤",
        bg: "bg-teal-400",
        shadow: "shadow-teal-200",
      },
      话费: {
        title: "煲电话粥 📞",
        desc: "沟通是桥梁，但也要注意话费账单哦！",
        icon: "📱",
        bg: "bg-purple-400",
        shadow: "shadow-purple-200",
      },
      住房: {
        title: "恋家一族 🏠",
        desc: "把家建设得温馨舒适，是给生活最好的礼物。",
        icon: "🛋️",
        bg: "bg-indigo-400",
        shadow: "shadow-indigo-200",
      },
    };
    return (
      map[category] || {
        title: "消费达人 💸",
        desc: "每一笔支出都是对美好生活的投资。",
        icon: "💰",
        bg: "bg-slate-400",
        shadow: "shadow-slate-200",
      }
    );
  };

  const topExpenseInsight = getExpenseInsight(
    stats.topExpense.name,
  );

  return (
    <div className="pt-4 pb-24 px-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        消费习惯分析
      </h2>

      {/* Top Expense Insight Card */}
      {stats.totalExp > 0 ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${topExpenseInsight.bg} rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg ${topExpenseInsight.shadow} dark:shadow-none`}
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-medium">
                {stats.topExpense.name}支出 No.1 🏆
              </div>
            </div>
            <h3 className="text-2xl font-bold leading-tight mb-2">
              {topExpenseInsight.title}
            </h3>
            <p className="text-white/90 text-sm opacity-90">
              {topExpenseInsight.desc}
            </p>
            <div className="mt-4 text-xs bg-white/10 w-fit px-2 py-1 rounded-lg">
              占比{" "}
              {(
                (stats.topExpense.amount / stats.totalExp) *
                100
              ).toFixed(0)}
              % (¥{stats.topExpense.amount})
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 text-9xl opacity-20 rotate-12 select-none">
            {topExpenseInsight.icon}
          </div>
        </motion.div>
      ) : (
        <div className="p-6 bg-slate-100 rounded-[2rem] text-center text-slate-400">
          暂无数据
        </div>
      )}

      {/* Real Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">
          分类占比
        </h3>
        <div className="h-48 flex items-center justify-center gap-4">
          <div className="w-1/2 h-full flex items-center justify-center relative">
            <RechartsPieChart width={160} height={160}>
              <Pie
                data={stats.chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {stats.chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `¥${value}`}
              />
            </RechartsPieChart>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block">
                  总支出
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  ¥{stats.totalExp}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-1/2 space-y-2 text-sm overflow-y-auto max-h-40 scrollbar-hide">
            {stats.chartData.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-slate-600 dark:text-slate-300 text-xs">
                    {item.name}
                  </span>
                </div>
                <span className="text-slate-500 text-xs font-medium">
                  {Math.round(
                    (item.value / stats.totalExp) * 100,
                  )}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frequency Insight Card */}
      {stats.totalExp > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-indigo-500 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-medium">
                高频剁手 👋
              </div>
            </div>
            <h3 className="text-xl font-bold leading-tight mb-2">
              你最爱买【{stats.topFreq.name}】
            </h3>
            <p className="text-indigo-50 text-sm opacity-90">
              本月累计消费 {stats.topFreq.count}{" "}
              次，看来是真爱无疑了！
            </p>
          </div>
          <div className="absolute -bottom-6 -right-2 text-9xl opacity-20 rotate-[-12deg] select-none">
            🧾
          </div>
        </motion.div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<View>("home");
  const [direction, setDirection] = useState(0);
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);

  // --- Data Loading & Seeding ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();

      const sortTransactions = (txs: Transaction[]) => {
        return txs.sort((a, b) => {
          // Use timestamp if available
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          // Fallback: Parse "1月19日" format
          const parse = (d: string) => {
            const match = d.match(/(\d+)月(\d+)日/);
            if (match) {
              // Assume current year 2026
              return new Date(
                2026,
                parseInt(match[1]) - 1,
                parseInt(match[2]),
              ).getTime();
            }
            // Try standard date parse
            const date = new Date(d);
            if (!isNaN(date.getTime())) return date.getTime();
            return 0;
          };
          return parse(b.date) - parse(a.date);
        });
      };

      if (data.length === 0) {
        // Seed initial data if empty
        console.log("Seeding initial data...");
        const promises = INITIAL_DATA.map((t) => {
          // Add timestamp to initial data
          const match = t.date.match(/(\d+)月(\d+)日/);
          const ts = match
            ? new Date(
                2026,
                parseInt(match[1]) - 1,
                parseInt(match[2]),
              ).getTime()
            : Date.now();
          return createTransaction({ ...t, timestamp: ts });
        });
        await Promise.all(promises);
        const seededData = await fetchTransactions();
        setTransactions(sortTransactions(seededData));
      } else {
        setTransactions(sortTransactions(data));
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (
    data: Omit<Transaction, "id">,
  ) => {
    try {
      const newTx = await createTransaction(data);
      setTransactions((prev) => [newTx, ...prev]);
      setActiveTab("home"); // Go back home after add
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("添加失败，请重试");
    }
  };

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const handleTabChange = (newTab: View) => {
    const tabs = ["home", "details", "add", "stats", "profile"];
    const oldIndex = tabs.indexOf(activeTab);
    const newIndex = tabs.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className={theme}>
      <SlickStyles />
      <div className="min-h-screen bg-slate-100 dark:bg-black flex items-center justify-center p-0 md:p-8 font-sans transition-colors duration-300">
        {/* Mobile Frame */}
        <div className="w-full h-screen md:w-[414px] md:h-[896px] bg-slate-50 dark:bg-slate-900 md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:border-[6px] border-slate-900/5 dark:border-slate-800">
          {/* Status Bar Shim */}
          <div className="h-12 w-full flex justify-between items-end px-6 pb-2 z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0">
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              9:41
            </span>
            <div className="flex gap-1.5">
              <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <button
              onClick={toggleTheme}
              className="absolute top-3 left-1/2 -translate-x-1/2 opacity-50 hover:opacity-100"
            >
              {theme === "light" ? (
                <Moon size={16} />
              ) : (
                <Sun size={16} className="text-white" />
              )}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={activeTab}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0 w-full h-full overflow-y-auto scrollbar-hide"
              >
                {activeTab === "home" && (
                  <HomeView
                    transactions={transactions}
                    loading={loading}
                  />
                )}
                {activeTab === "details" && (
                  <DetailsView transactions={transactions} />
                )}
                {activeTab === "add" && (
                  <AddView onAdd={handleAddTransaction} />
                )}
                {activeTab === "profile" && <ProfileView />}
                {activeTab === "stats" && (
                  <StatsView transactions={transactions} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <NavBar
            active={activeTab}
            onChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
}