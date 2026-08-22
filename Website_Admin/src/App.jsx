/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MainLayout } from "./components/MainLayout";
import { DashboardScreen } from "./components/DashboardScreen";
import { EpcPartnerScreen } from "./components/EpcPartnerScreen";
import TrustBadgeEpcScreen from "./components/TrustBadgeEpcScreen";
import { EpcBulkUploadScreen } from "./components/EpcBulkUploadScreen";
import { KycScreen } from "./components/KycScreen";
import { QualificationScreen } from "./components/QualificationScreen";
import { SubscriptionScreen } from "./components/SubscriptionScreen";
import { ProjectScreen } from "./components/ProjectScreen";
import { ProductInstallerScreen } from "./components/ProductInstallerScreen";
import { WorkflowSettingsScreen } from "./components/WorkflowSettingsScreen";
import { SaaSAdminSettingsScreen } from "./components/SaaSAdminSettingsScreen";
import WebsiteSettingsScreen from "./components/WebsiteSettingsScreen";
import { CustomerEligibilityScreen } from "./components/CustomerEligibilityScreen";
import { CountrySubsidyManagementScreen } from "./components/CountrySubsidyManagementScreen";
import { OrderJourneyScreen } from "./components/OrderJourneyScreen";
import { LiveProjectTrackingScreen } from "./components/LiveProjectTrackingScreen";
import { LoginScreen } from "./components/LoginScreen";
import { EpcWalletSettingsScreen } from "./components/Epcwalletsettingsscreen";
import EpcSystemSettingsScreen from "./components/EpcSystemSettingsScreen";
import BlogManagementScreen from "./components/BlogManagementScreen";
import BDEManagementScreen from "./components/BDEManagementScreen";
import BDEOnboardingScreen from "./components/BDEOnboardingScreen";
import PlatformAnalyticsScreen from "./components/PlatformAnalyticsScreen";
import { EpcRewardsScreen } from "./components/EpcRewardsScreen";
import LeadScreenNew from "./components/LeadScreenNew";
import { DemandSupplyScreen } from "./components/DemandSupplyScreen";
import { DiscomManagementScreen } from "./components/DiscomManagementScreen";
import BrandManagementScreen from "./components/BrandManagementScreen";
import ProductsScreen from "./components/ProductsScreen";
import ProjectsScreen from "./components/ProjectsScreen";
import CountryWebsiteScreen from "./components/country/CountryWebsiteScreen";
import StcManagementDashboard from "./components/country/StcManagementDashboard";

import PaymentSettingsTab from "./components/country/PaymentSettingsTab";
import EpcRatesForBrandsTab from "./components/EpcRatesForBrandsTab";

import UnifiedCountrySettings from "./components/UnifiedCountrySettings";

// ── BDE Portal ─────────────────────────────────────────────────────────────
import BDELayout from "./components/bde/BDELayout";
import BDEDashboard from "./components/bde/BDEDashboard";
import BDELeadManagement from "./components/bde/BDELeadManagement";
import BDEDemandPool from "./components/bde/BDEDemandPool";
import BDEProjectTracking from "./components/bde/BDEProjectTracking";
import BDEAustDashboard from "./components/bde/BDEAustDashboard";
import BDEProfile from "./components/bde/BDEProfile";
import {
  initialEPCPartners,
  initialQualificationRules,
  subscriptionPlans,
  initialProjects,
  initialProducts,
  initialInstallers,
  initialProjectOrderSettings,
  initialOrderProcessSettings,
  initialRatingBenefitRules,
} from "./data";

export default function App() {
  // Authentication states with LocalStorage persistence support
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("sunnovative_admin_authenticated") === "true";
  });
  const [adminEmail, setAdminEmail] = useState(() => {
    return (
      localStorage.getItem("sunnovative_admin_email") ||
      "structasoftadmin@gmail.com"
    );
  });
  
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("sunnovative_user_role") || "admin";
  });
  
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("sunnovative_user_id") || null;
  });

  const [userCountry, setUserCountry] = useState(() => {
    return localStorage.getItem("sunnovative_user_country") || "";
  });

  const handleLoginSuccess = (email, role = "admin", loginUserId = null, country = "") => {
    setIsAuthenticated(true);
    setAdminEmail(email);
    setUserRole(role);
    setUserId(loginUserId);
    if (country) setUserCountry(country);

    localStorage.setItem("sunnovative_admin_authenticated", "true");
    localStorage.setItem("sunnovative_admin_email", email);
    localStorage.setItem("sunnovative_user_role", role);
    if (loginUserId) localStorage.setItem("sunnovative_user_id", loginUserId);
    if (country) localStorage.setItem("sunnovative_user_country", country);
    
    if (role === "BDE") {
      setCurrentTab("bde-aust");
    } else {
      setCurrentTab("dashboard");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("admin");
    setUserId(null);
    setUserCountry("");
    localStorage.removeItem("sunnovative_admin_authenticated");
    localStorage.removeItem("sunnovative_admin_email");
    localStorage.removeItem("sunnovative_user_role");
    localStorage.removeItem("sunnovative_user_id");
    localStorage.removeItem("sunnovative_user_country");
  };

  // Navigation states
  const [currentTab, setCurrentTab] = useState(userRole === "BDE" ? "bde-aust" : "dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail) {
        setCurrentTab(e.detail);
      }
    };
    window.addEventListener("change-tab", handleTabChange);
    return () => window.removeEventListener("change-tab", handleTabChange);
  }, []);

  // Core Persistent State Pools for SaaS Administration
  const [partners, setPartners] = useState(initialEPCPartners);
  const [qualificationRules, setQualificationRules] = useState(
    initialQualificationRules,
  );
  const [plans, setPlans] = useState(subscriptionPlans);
  const [projects, setProjects] = useState(initialProjects);
  const [products, setProducts] = useState(initialProducts);
  const [installers, setInstallers] = useState(initialInstallers);
  const [orderRules, setOrderRules] = useState(initialProjectOrderSettings);
  const [processRules, setProcessRules] = useState(initialOrderProcessSettings);
  const [ratingRules, setRatingRules] = useState(initialRatingBenefitRules);

  // External Action Triggers
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [partnerFormOpen, setPartnerFormOpen] = useState(false);

  // PARTNERS HANDLERS
  const handleAddPartner = (newP) => {
    setPartners([newP, ...partners]);
  };

  const handleUpdatePartner = (updatedP) => {
    setPartners(partners.map((p) => (p.id === updatedP.id ? updatedP : p)));
  };

  const handleDeletePartner = (id) => {
    setPartners(partners.filter((p) => p.id !== id));
  };

  // QUALIFICATION RULES HANDLERS
  const handleAddQualificationRule = (newRule) => {
    setQualificationRules([newRule, ...qualificationRules]);
  };

  const handleUpdateQualificationRule = (updatedRule) => {
    setQualificationRules(
      qualificationRules.map((r) =>
        r.id === updatedRule.id ? updatedRule : r,
      ),
    );
  };

  const handleDeleteQualificationRule = (id) => {
    setQualificationRules(qualificationRules.filter((r) => r.id !== id));
  };

  // SUBSCRIPTION PLANS
  const handleAddPlan = (newPlan) => {
    setPlans([newPlan, ...plans]);
  };

  const handleUpdatePlan = (updatedPlan) => {
    setPlans(plans.map((pl) => (pl.id === updatedPlan.id ? updatedPlan : pl)));
  };

  // SOLAR PROJECTS
  const handleAddProject = (newProj) => {
    setProjects([newProj, ...projects]);
  };

  const handleUpdateProject = (updatedProj) => {
    setProjects(
      projects.map((p) => (p.id === updatedProj.id ? updatedProj : p)),
    );
  };

  // INVENTORY PRODUCTS
  const handleAddProduct = (newProd) => {
    setProducts([newProd, ...products]);
  };

  const handleUpdateProduct = (updatedProd) => {
    setProducts(
      products.map((p) => (p.id === updatedProd.id ? updatedProd : p)),
    );
  };

  // LABOR INSTALLERS ROSTER
  const handleAddInstaller = (newInst) => {
    setInstallers([newInst, ...installers]);
  };

  const handleUpdateInstaller = (updatedInst) => {
    setInstallers(
      installers.map((i) => (i.id === updatedInst.id ? updatedInst : i)),
    );
  };

  // DISPATCH/WORKFLOW DATE RULES
  const handleAddOrderRule = (rule) => {
    setOrderRules([rule, ...orderRules]);
  };

  const handleUpdateOrderRule = (updated) => {
    setOrderRules(orderRules.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleAddProcessRule = (rule) => {
    setProcessRules([rule, ...processRules]);
  };

  const handleUpdateProcessRule = (updated) => {
    setProcessRules(
      processRules.map((r) => (r.id === updated.id ? updated : r)),
    );
  };

  const handleAddRatingRule = (rule) => {
    setRatingRules([rule, ...ratingRules]);
  };

  const handleUpdateRatingRule = (updated) => {
    setRatingRules(ratingRules.map((r) => (r.id === updated.id ? updated : r)));
  };

  // VIEW OUTLET ROUTING ENGINE
  const renderTabContent = () => {
    switch (currentTab) {
      case "country-settings":
        return <UnifiedCountrySettings />;

      case "dashboard":
        return (
          <DashboardScreen
            partners={partners}
            projects={projects}
            installers={installers}
            onNavigateTab={(tab) => {
              setCurrentTab(tab);
              if (tab === "projects-add") {
                setCurrentTab("projects");
                setProjectFormOpen(true);
              }
            }}
            onQuickAction={(actionId) => {
              if (actionId === "add-partner") {
                setCurrentTab("epc-partners");
                setPartnerFormOpen(true);
              } else if (actionId === "add-project") {
                setCurrentTab("projects");
                setProjectFormOpen(true);
              } else if (actionId === "add-product") {
                setCurrentTab("products");
              } else if (actionId === "create-plan") {
                setCurrentTab("subscriptions");
              }
            }}
          />
        );

      case "epc-partners":
        return (
          <EpcPartnerScreen
            partners={partners}
            projects={projects}
            installers={installers}
            onAddPartner={handleAddPartner}
            onUpdatePartner={handleUpdatePartner}
            isFormOpenExternal={partnerFormOpen}
            onCloseFormExternal={() => setPartnerFormOpen(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );

      case "trust-badge-epc":
        return (
          <TrustBadgeEpcScreen 
            partners={partners}
            projects={projects}
            installers={installers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );

      case "epc-rewards":
        return <EpcRewardsScreen />;

      case "kyc-agreement":
        return (
          <KycScreen
            partners={partners}
            onUpdatePartner={handleUpdatePartner}
            searchQuery={searchQuery}
          />
        );

      case "qualification":
        return (
          <QualificationScreen
            rules={qualificationRules}
            onAddRule={handleAddQualificationRule}
            onUpdateRule={handleUpdateQualificationRule}
            onDeleteRule={handleDeleteQualificationRule}
          />
        );

      case "epc-bulk-upload":
        return <EpcBulkUploadScreen />;

      case "subscriptions":
        return (
          <SubscriptionScreen
            plans={plans}
            partners={partners}
            onAddPlan={handleAddPlan}
            onUpdatePlan={handleUpdatePlan}
            onUpdatePartner={handleUpdatePartner}
          />
        );

      case "projects":
        return (
          <ProjectScreen
            projects={projects}
            partners={partners}
            installers={installers}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            isFormOpenExternal={projectFormOpen}
            onCloseFormExternal={() => setProjectFormOpen(false)}
            searchQuery={searchQuery}
          />
        );

      case "products":
        return (
          <ProductInstallerScreen
            activeSubTab="products"
            products={products}
            installers={installers}
            partners={partners}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onAddInstaller={handleAddInstaller}
            onUpdateInstaller={handleUpdateInstaller}
          />
        );

      case "installers":
        return (
          <ProductInstallerScreen
            activeSubTab="installers"
            products={products}
            installers={installers}
            partners={partners}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onAddInstaller={handleAddInstaller}
            onUpdateInstaller={handleUpdateInstaller}
          />
        );

      case "order-settings":
        return (
          <WorkflowSettingsScreen
            activeSubTab="order-settings"
            orderRules={orderRules}
            processRules={processRules}
            ratingRules={ratingRules}
            onUpdateOrderRule={handleUpdateOrderRule}
            onUpdateProcessRule={handleUpdateProcessRule}
            onUpdateRatingRule={handleUpdateRatingRule}
            onAddOrderRule={handleAddOrderRule}
            onAddProcessRule={handleAddProcessRule}
            onAddRatingRule={handleAddRatingRule}
          />
        );

      case "process-settings":
        return (
          <WorkflowSettingsScreen
            activeSubTab="process-settings"
            orderRules={orderRules}
            processRules={processRules}
            ratingRules={ratingRules}
            onUpdateOrderRule={handleUpdateOrderRule}
            onUpdateProcessRule={handleUpdateProcessRule}
            onUpdateRatingRule={handleUpdateRatingRule}
            onAddOrderRule={handleAddOrderRule}
            onAddProcessRule={handleAddProcessRule}
            onAddRatingRule={handleAddRatingRule}
          />
        );

      case "ratings-benefits":
        return (
          <WorkflowSettingsScreen
            activeSubTab="ratings-benefits"
            orderRules={orderRules}
            processRules={processRules}
            ratingRules={ratingRules}
            onUpdateOrderRule={handleUpdateOrderRule}
            onUpdateProcessRule={handleUpdateProcessRule}
            onUpdateRatingRule={handleUpdateRatingRule}
            onAddOrderRule={handleAddOrderRule}
            onAddProcessRule={handleAddProcessRule}
            onAddRatingRule={handleAddRatingRule}
          />
        );

      case "epc-settings":
        return (
          <SaaSAdminSettingsScreen
            activeSubTab="epc-settings"
            partners={partners}
            projects={projects}
          />
        );

      case "reports-analytics":
        return (
          <SaaSAdminSettingsScreen
            activeSubTab="reports"
            partners={partners}
            projects={projects}
          />
        );

      case "admin-settings":
        return (
          <SaaSAdminSettingsScreen
            activeSubTab="admin-settings"
            partners={partners}
            projects={projects}
          />
        );

      case "website-content":
        return <WebsiteSettingsScreen />;
        
      case "blog-management":
        return <BlogManagementScreen />;

      case "customer-eligibility":
      case "eligibility-categories":
        return <CustomerEligibilityScreen section="projectCategories" />;
      case "eligibility-inverters":
        return <CustomerEligibilityScreen section="inverterTypes" />;
      case "eligibility-meter":
        return <CustomerEligibilityScreen section="meterCategories" />;
      case "eligibility-billstatus":
        return <CustomerEligibilityScreen section="billStatusRules" />;
      case "eligibility-kw":
        return <CustomerEligibilityScreen section="kwDerivationRules" />;
      case "eligibility-subsidy":
        return <CustomerEligibilityScreen section="subsidyCriteria" />;
      case "eligibility-dueamount":
        return <CustomerEligibilityScreen section="dueAmountThreshold" />;
      case "eligibility-bill-kw":
        return <CustomerEligibilityScreen section="billToKwRanges" />;
      case "eligibility-state-subsidy":
        return <CustomerEligibilityScreen section="stateSubsidy" />;

      case "subsidy-management":
        return <CountrySubsidyManagementScreen />;

      // ── Order Journey Settings ──────────────────────────────────
      

         case "epc-wallet-settings":
        return <EpcWalletSettingsScreen />;
      case "epc-system-settings":
        return <EpcSystemSettingsScreen />;

      case "discom-management":
        return <DiscomManagementScreen />;

      case "bde-management":
        return <BDEManagementScreen />;
      case "bde-onboarding":
        return <BDEOnboardingScreen />;
      case "platform-analytics":
        return <PlatformAnalyticsScreen />;
      case "brand-management":
        return <BrandManagementScreen />;
      case "products-configuration":
        return <ProductsScreen />;
      case "projects-configuration":
        return <ProjectsScreen />;
      case "country-websites":
        return <CountryWebsiteScreen />;
      case "epc-rates-brands":
        return <EpcRatesForBrandsTab />;
      case "order-journey":
        return <OrderJourneyScreen />;

      case "stc-management":
        return <StcManagementDashboard />;
        

      case "australia-payments":
        return <PaymentSettingsTab />;

      case "project-orders":
        return <LiveProjectTrackingScreen />;

      case "website-leads":
        return <LeadScreenNew uploadSource="website" />;

      case "bde-leads-admin":
        return <LeadScreenNew uploadSource="bde_manual" />;

      case "demand-supply":
        return <DemandSupplyScreen />;

      // ── BDE Overrides ───────────────────────────────────────
      case "bde-dashboard":
      case "bde-aust":
        return userCountry?.toLowerCase() === "australia" ? (
          <BDEAustDashboard bdeId={userId} />
        ) : (
          <BDEDashboard bdeId={userId} />
        );
      case "bde-profile":
        return <BDEProfile bdeId={userId} />;
      case "bde-leads":
        return <BDELeadManagement bdeId={userId} country={userCountry} />;
      case "bde-projects":
        return <BDEProjectTracking bdeId={userId} />;
      case "bde-demand":
        return <BDEDemandPool bdeId={userId} />;

      default:
        return (
          <div className="p-12 text-center text-sm font-semibold text-gray-400">
            Navigation route "{currentTab}" not registered yet.
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (userRole === "BDE") {
    return (
      <BDELayout
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onLogout={handleLogout}
        bdeName={adminEmail} // For now, passing email as name
        bdeId={userId}
      >
        <div className="animate-fade-in-up duration-300">
          {renderTabContent()}
        </div>
      </BDELayout>
    );
  }

  return (
    <MainLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onLogout={handleLogout}
    >
      <div className="animate-fade-in-up duration-300">
        {renderTabContent()}
      </div>
    </MainLayout>
  );
}
