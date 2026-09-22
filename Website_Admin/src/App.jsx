/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MainLayout } from "./components/MainLayout";
import { LoginScreen } from "./components/LoginScreen";
import BDELayout from "./components/bde/BDELayout";

const DashboardScreen = React.lazy(() => import('./components/DashboardScreen').then(module => ({ default: module.DashboardScreen })));
const EpcPartnerScreen = React.lazy(() => import('./components/EpcPartnerScreen').then(module => ({ default: module.EpcPartnerScreen })));
const TrustBadgeEpcScreen = React.lazy(() => import('./components/TrustBadgeEpcScreen'));
const EpcBulkUploadScreen = React.lazy(() => import('./components/EpcBulkUploadScreen').then(module => ({ default: module.EpcBulkUploadScreen })));
const KycScreen = React.lazy(() => import('./components/KycScreen').then(module => ({ default: module.KycScreen })));
const QualificationScreen = React.lazy(() => import('./components/QualificationScreen').then(module => ({ default: module.QualificationScreen })));
const SubscriptionScreen = React.lazy(() => import('./components/SubscriptionScreen').then(module => ({ default: module.SubscriptionScreen })));
const ProjectScreen = React.lazy(() => import('./components/ProjectScreen').then(module => ({ default: module.ProjectScreen })));
const ProductInstallerScreen = React.lazy(() => import('./components/ProductInstallerScreen').then(module => ({ default: module.ProductInstallerScreen })));
const WorkflowSettingsScreen = React.lazy(() => import('./components/WorkflowSettingsScreen').then(module => ({ default: module.WorkflowSettingsScreen })));
const SaaSAdminSettingsScreen = React.lazy(() => import('./components/SaaSAdminSettingsScreen').then(module => ({ default: module.SaaSAdminSettingsScreen })));
const WebsiteSettingsScreen = React.lazy(() => import('./components/WebsiteSettingsScreen'));
const CustomerEligibilityScreen = React.lazy(() => import('./components/CustomerEligibilityScreen').then(module => ({ default: module.CustomerEligibilityScreen })));
const CountrySubsidyManagementScreen = React.lazy(() => import('./components/CountrySubsidyManagementScreen').then(module => ({ default: module.CountrySubsidyManagementScreen })));
const OrderJourneyScreen = React.lazy(() => import('./components/OrderJourneyScreen').then(module => ({ default: module.OrderJourneyScreen })));
const LiveProjectTrackingScreen = React.lazy(() => import('./components/LiveProjectTrackingScreen').then(module => ({ default: module.LiveProjectTrackingScreen })));
const EpcWalletSettingsScreen = React.lazy(() => import('./components/Epcwalletsettingsscreen').then(module => ({ default: module.EpcWalletSettingsScreen })));
const EpcSystemSettingsScreen = React.lazy(() => import('./components/EpcSystemSettingsScreen'));
const BlogManagementScreen = React.lazy(() => import('./components/BlogManagementScreen'));
const BDEManagementScreen = React.lazy(() => import('./components/BDEManagementScreen'));
const BDEOnboardingScreen = React.lazy(() => import('./components/BDEOnboardingScreen'));
const PlatformAnalyticsScreen = React.lazy(() => import('./components/PlatformAnalyticsScreen'));
const WebAppAnalyticsScreen = React.lazy(() => import('./components/WebAppAnalyticsScreen'));
const EpcRewardsScreen = React.lazy(() => import('./components/EpcRewardsScreen').then(module => ({ default: module.EpcRewardsScreen })));
const LeadScreenNew = React.lazy(() => import('./components/LeadScreenNew'));
const DemandSupplyScreen = React.lazy(() => import('./components/DemandSupplyScreen').then(module => ({ default: module.DemandSupplyScreen })));
const DiscomManagementScreen = React.lazy(() => import('./components/DiscomManagementScreen').then(module => ({ default: module.DiscomManagementScreen })));
const BrandManagementScreen = React.lazy(() => import('./components/BrandManagementScreen'));
const ProductsScreen = React.lazy(() => import('./components/ProductsScreen'));
const ProjectsScreen = React.lazy(() => import('./components/ProjectsScreen'));
const BillTemplateManagementScreen = React.lazy(() => import('./components/BillTemplateManagementScreen'));
const CountryWebsiteScreen = React.lazy(() => import('./components/country/CountryWebsiteScreen'));
const StcManagementDashboard = React.lazy(() => import('./components/country/StcManagementDashboard'));
const PaymentSettingsTab = React.lazy(() => import('./components/country/PaymentSettingsTab'));
const EpcRatesForBrandsTab = React.lazy(() => import('./components/EpcRatesForBrandsTab'));
const UnifiedCountrySettings = React.lazy(() => import('./components/UnifiedCountrySettings'));

// â”€â”€ BDE Portal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BDEDashboard = React.lazy(() => import("./components/bde/BDEDashboard"));
const BDEMyLeads = React.lazy(() => import('./components/bde/BDEMyLeads'));
const BDELeadManagement = React.lazy(() => import("./components/bde/BDELeadManagement"));
const BDEDemandPool = React.lazy(() => import("./components/bde/BDEDemandPool"));
const BDEProjectTracking = React.lazy(() => import("./components/bde/BDEProjectTracking"));
const BDEAustDashboard = React.lazy(() => import("./components/bde/BDEAustDashboard"));
const BDEProfile = React.lazy(() => import("./components/bde/BDEProfile"));
const BDEProspects = React.lazy(() => import("./components/bde/BDEProspects"));
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
  
  const [bdeType, setBdeType] = useState(() => {
    return localStorage.getItem("sunnovative_bde_type") || "";
  });

  const handleLoginSuccess = (email, role = "admin", loginUserId = null, country = "", type = "") => {
    setIsAuthenticated(true);
    setAdminEmail(email);
    setUserRole(role);
    setUserId(loginUserId);
    if (country) setUserCountry(country);
    if (type) setBdeType(type);

    localStorage.setItem("sunnovative_admin_authenticated", "true");
    localStorage.setItem("sunnovative_admin_email", email);
    localStorage.setItem("sunnovative_user_role", role);
    if (loginUserId) localStorage.setItem("sunnovative_user_id", loginUserId);
    if (country) localStorage.setItem("sunnovative_user_country", country);
    if (type) localStorage.setItem("sunnovative_bde_type", type);
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
      case "bill-templates":
        return <BillTemplateManagementScreen />;
        
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

      // â”€â”€ Order Journey Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      

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
              case "web-app-analytics":
          return <WebAppAnalyticsScreen />;
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

      // â”€â”€ BDE Overrides â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "bde-dashboard":
      case "bde-aust":
        return userCountry?.toLowerCase() === "australia" ? (
          <BDEAustDashboard bdeId={userId} onTabChange={setCurrentTab} bdeType={bdeType} />
        ) : (
          <BDEDashboard bdeId={userId} onTabChange={setCurrentTab} bdeType={bdeType} />
        );
      case "bde-profile":
        return <BDEProfile bdeId={userId} onTabChange={setCurrentTab} />;
      case "bde-my-leads":
        return <BDEMyLeads bdeId={userId} country={userCountry} bdeType={bdeType} onTabChange={setCurrentTab} />;
      case "bde-customer-eligibility":
        return <BDELeadManagement bdeId={userId} country={userCountry} bdeType={bdeType} filterTab="eligibility" onTabChange={setCurrentTab} />;
      case "bde-leads":
        return <BDELeadManagement bdeId={userId} country={userCountry} bdeType={bdeType} filterTab="self-leads" onTabChange={setCurrentTab} />;
      case "bde-projects":
        return <BDEProjectTracking bdeId={userId} onTabChange={setCurrentTab} />;
      case "bde-prospects":
        return <BDEProspects bdeId={userId} country={userCountry} bdeType={bdeType} onTabChange={setCurrentTab} />;
      case "bde-demand":
        return <BDEDemandPool bdeId={userId} onTabChange={setCurrentTab} />;

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
        bdeType={bdeType}
        userCountry={userCountry}
        onCountryChange={(c) => { setUserCountry(c); localStorage.setItem('sunnovative_user_country', c); }}
      >
        <div className="animate-fade-in-up duration-300">
          <React.Suspense fallback={<div className="p-12 text-center text-sm font-semibold text-slate-500">Loading screen...</div>}>
            {renderTabContent()}
          </React.Suspense>
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
        <React.Suspense fallback={<div className="p-12 text-center text-sm font-semibold text-slate-500">Loading screen...</div>}>
          {renderTabContent()}
        </React.Suspense>
      </div>
    </MainLayout>
  );
}
