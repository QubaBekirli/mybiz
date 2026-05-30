import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import DetailPage from "@/pages/DetailPage";
import NotificationsPage from "@/pages/NotificationsPage";
import PromotionsPage from "@/pages/PromotionsPage";
import HelpPage from "@/pages/HelpPage";
import ProfilePage from "@/pages/ProfilePage";

import InventoryPage from "@/pages/InventoryPage";
import TaxPage from "@/pages/TaxPage";
import AppLayout from "@/components/AppLayout";
import ChatBot from "@/components/ChatBot";

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [detailType, setDetailType] = useState<"income" | "expense" | "profit" | null>(null);

  if (!isAuthenticated) return <LoginPage />;

  const handleNavigateDetail = (type: "income" | "expense" | "profit") => {
    setDetailType(type);
    setCurrentPage("detail");
  };

  const renderPage = () => {
    if (currentPage === "detail" && detailType) {
      return <DetailPage type={detailType} onBack={() => setCurrentPage("dashboard")} />;
    }
    switch (currentPage) {
      case "dashboard": return <DashboardPage onNavigateDetail={handleNavigateDetail} />;
      case "transactions": return <TransactionsPage />;
      case "analytics": return <AnalyticsPage />;
      
      case "inventory": return <InventoryPage />;
      case "tax": return <TaxPage />;
      case "profile": return <ProfilePage onNavigate={setCurrentPage} />;
      case "settings": return <SettingsPage onBack={() => setCurrentPage("profile")} onNavigate={setCurrentPage} />;
      case "notifications": return <NotificationsPage />;
      case "promotions": return <PromotionsPage onBack={() => setCurrentPage("dashboard")} />;
      case "help": return <HelpPage onBack={() => setCurrentPage("settings")} />;
      default: return <DashboardPage onNavigateDetail={handleNavigateDetail} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
      <ChatBot />
    </AppLayout>
  );
};

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="max-w-5xl opacity-0 animate-fade-up">
    <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>{title}</h1>
    <p className="text-muted-foreground text-sm mt-1">Bu bölmə tezliklə əlavə olunacaq.</p>
    <div className="mt-8 bg-card rounded-2xl card-shadow p-8 text-center text-muted-foreground text-sm">Tezliklə...</div>
  </div>
);

export default Index;
