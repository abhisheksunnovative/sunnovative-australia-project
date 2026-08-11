/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  SlidersHorizontal,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Briefcase,
  MapPin,
  Award,
  X,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge, RatingStars, DetailDrawer, EmptyState } from "./CommonUI";
import { MasterFilterBar } from "./common/MasterFilterBar";
import { COUNTRY_DATA } from "../utils/geography";
import { useAdminSettings } from "../hooks/useAdminSettings";

const availableCountries = Object.keys(COUNTRY_DATA);

export const EpcPartnerScreen = ({
  partners,
  projects,
  installers,
  onAddPartner,
  onUpdatePartner,
  isFormOpenExternal,
  onCloseFormExternal,
  searchQuery,
  setSearchQuery,
}) => {
  // Page states
  const { settings, loading: settingsLoading } = useAdminSettings();
  const dynamicProjectTypes = settings?.projectTypes?.length > 0 ? settings.projectTypes : ["Residential"];
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [filterCity, setFilterCity] = useState("All");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, partner: null, reason: "" });
  const [profileActiveTab, setProfileActiveTab] = useState("overview");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 20;

  // Real database state
  const [dbPartners, setDbPartners] = useState([]);

  // Fetch real data from backend (with pagination)
  const fetchPartners = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        country: filterCountry,
        state: filterState,
        district: filterDistrict,
        city: filterCity,
        isOverdue: filterStatus === 'Overdue',
        page,
        limit: ITEMS_PER_PAGE,
      }).toString();

      const response = await fetch(`http://localhost:4005/api/admin/epc?${query}`);
      if (response.ok) {
        const result = await response.json();
        // Support both old array response and new paginated { data, pagination } response
        const rawList = Array.isArray(result) ? result : (result.data || []);
        const paginationInfo = result.pagination || null;

        const mappedData = rawList.map(dbP => ({
          ...dbP,
          id: dbP._id,
          partnerName: dbP.ownerName,
          companyName: dbP.companyName,
          email: dbP.email,
          mobile: dbP.mobile,
          hqLocation: dbP.hqLocation || dbP.city || dbP.district || '',
          state: dbP.state,
          district: dbP.district,
          city: dbP.city,
          pincode: dbP.pincode,
          address: dbP.address,
          country: dbP.country || 'india',
          subscriptionPlan: dbP.plan || "Free",
          kycStatus: dbP.onboardingStatus,
          hasTrustBadge: dbP.trustBadge?.status === 'Approved' || false,
          status: dbP.isActive ? "Active" : (dbP.deactivationReason ? "Suspended" : dbP.onboardingStatus),
          experience: dbP.yearsOfExperience || 0,
          projectTypes: dbP.qualifiedProjectTypes || ["Residential"],
          cluster: dbP.district || "Default Cluster",
          rating: dbP.rating || 0,
          minKW: 5,
          maxKW: 250,
          installersCount: dbP.districtCapacities?.reduce((sum, d) => sum + (d.installerCount || 0), 0) || 0,
          agreementStatus: dbP.kycDocuments?.agreementSigned ? "Signed" : "Pending",
          kycDetails: {
            gstNumber: dbP.kycDocuments?.gstNumber || '',
            panNumber: dbP.kycDocuments?.panNumber || '',
            aadhaarNumber: dbP.kycDocuments?.aadhaarNumber || '',
            bankAccountNumber: dbP.kycDocuments?.bankAccountNumber || '',
            ifscCode: dbP.kycDocuments?.ifscCode || '',
            agreementSigned: dbP.kycDocuments?.agreementSigned || false,
            authPersonName: dbP.ownerName || '',
            authPersonEmail: dbP.email || '',
            authPersonMobile: dbP.mobile || '',
            authPersonDesignation: 'Director',
          },
          districtCapacities: dbP.districtCapacities || [],
          activeDistricts: dbP.activeDistricts || [],
          overdueCount: dbP.overdueCount || 0,
          isFrozen: dbP.isFrozen || false,
          warnings: dbP.warnings || [],
          trustBadge: dbP.trustBadge || { status: 'None' },
        }));

        setDbPartners(mappedData);
        if (paginationInfo) {
          setTotalPages(paginationInfo.totalPages || 1);
          setTotalCount(paginationInfo.total || mappedData.length);
          setCurrentPage(paginationInfo.page || page);
        }
      }
    } catch (err) {
      console.error("Error fetching partners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Flag to skip the page-change effect when filters reset page to 1
  const skipPageEffect = useRef(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    skipPageEffect.current = true;  // mark: page effect should be skipped once
    setCurrentPage(1);
    fetchPartners(1);
  }, [filterCountry, filterState, filterDistrict, filterCity, filterStatus]);

  // Fetch when page changes (skip if triggered by filter reset above)
  useEffect(() => {
    if (skipPageEffect.current) {
      skipPageEffect.current = false;
      return;
    }
    fetchPartners(currentPage);
  }, [currentPage]);


  // Form management
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // Form fields state
  const [formData, setFormData] = useState({
    partnerName: "",
    companyName: "",
    email: "",
    mobile: "",
    hqLocation: "",
    state: "",
    district: "",
    cluster: "",
    experience: 3,
    projectTypes: dynamicProjectTypes,
    minKW: 5,
    maxKW: 250,
    installersCount: 2,
    subscriptionPlan: "Starter Plan",
    status: "Pending",
    rating: 4.5,
    kycStatus: "Pending",
    agreementStatus: "Pending",
  });

  // Handle opening form
  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormData({
      partnerName: "",
      companyName: "",
      email: "",
      mobile: "",
      hqLocation: "",
      state: "",
      district: "",
      cluster: "",
      experience: 3,
      projectTypes: dynamicProjectTypes,
      minKW: 5,
      maxKW: 250,
      installersCount: 2,
      subscriptionPlan: "Starter Plan",
      status: "Pending",
      rating: 4.5,
      kycStatus: "Pending",
      agreementStatus: "Pending",
    });
    setShowAddForm(true);
  };

  const handleEditOpen = (p, e) => {
    e.stopPropagation();
    setEditingPartner(p);
    setFormData(p);
    setShowAddForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingPartner) {
      onUpdatePartner({ ...editingPartner, ...formData });
    } else {
      const generated = {
        ...formData,
        id: `epc-${partners.length + 10}`,
        kycStatus: "Pending",
        agreementStatus: "Pending",
        status: "Pending",
        rating: 4.0,
        kycDetails: {
          companyRegNo: "U401" + Math.floor(Math.random() * 90000) + "PL",
          gstNumber: "GST" + Math.floor(Math.random() * 90000) + "IN",
          panNumber: "PAN" + Math.floor(Math.random() * 90000),
          addressProofUrl: "reg_cert.pdf",
          bankName: "HDFC Bank",
          accountNo: "501000" + Math.floor(Math.random() * 90000),
          ifscCode: "HDFC0000102",
          cancelledChequeUrl: "undone_cheque.jpg",
          authPersonName: formData.partnerName || "Authorized Admin",
          authPersonEmail: formData.email || "",
          authPersonMobile: formData.mobile || "",
          authPersonDesignation: "Director",
          authPersonIdUrl: "pan_card.jpg",
          undertakingChecked: true,
        },
      };
      onAddPartner(generated);
    }
    setShowAddForm(false);
    onCloseFormExternal();
  };

  // Multiple checkboxes toggler
  const handleProjectTypeToggle = (type) => {
    const list = formData.projectTypes || [];
    if (list.includes(type)) {
      setFormData({
        ...formData,
        projectTypes: list.filter((t) => t !== type),
      });
    } else {
      setFormData({ ...formData, projectTypes: [...list, type] });
    }
  };

  const handleToggleActive = async (partner) => {
    const isCurrentlyActive = partner.status === "Active";
    const newStatus = !isCurrentlyActive;

    if (!newStatus) {
      // Open modal instead of prompt
      setDeactivateModal({ isOpen: true, partner, reason: "" });
      return;
    }

    try {
      const response = await fetch(`http://localhost:4005/api/admin/epc/${partner.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true, deactivationReason: "" })
      });
      if (response.ok) {
        fetchPartners();
        setDrawerOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitDeactivation = async () => {
    if (!deactivateModal.partner) return;
    try {
      const response = await fetch(`http://localhost:4005/api/admin/epc/${deactivateModal.partner.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false, deactivationReason: deactivateModal.reason })
      });
      if (response.ok) {
        fetchPartners();
        setDrawerOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivateModal({ isOpen: false, partner: null, reason: "" });
    }
  };

  const handleUpdateKyc = async (partner, kycStatus) => {
    try {
      const response = await fetch(`http://localhost:4005/api/admin/epc/${partner.id}/kyc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: kycStatus })
      });
      if (response.ok) {
        fetchPartners();
        setDrawerOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTrustBadge = async (partner) => {
    try {
      const newStatus = !partner.hasTrustBadge;
      // Optimistic update
      setSelectedPartner({ ...partner, hasTrustBadge: newStatus });
      setDbPartners(prev => prev.map(p => p.id === partner.id ? { ...p, hasTrustBadge: newStatus } : p));

      await fetch(`http://localhost:4005/api/admin/epc/${partner.id}/trust-badge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasTrustBadge: newStatus })
      });
    } catch (err) {
      console.error(err);
      // Revert on error
      fetchPartners();
    }
  };

  // Filter partners list
  const filteredPartners = dbPartners.filter((p) => {
    // Search input
    const matchesSearch =
      searchQuery === "" ||
      (p.partnerName && p.partnerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.companyName && p.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.hqLocation && p.hqLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.cluster && p.cluster.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.state && p.state.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus = filterStatus === "All" ||
      (filterStatus === "Overdue" ? (p.isRedAlert || p.overdueCount > 0) :
        p.status === filterStatus || (filterStatus === 'Pending' && p.kycStatus === 'Pending'));

    // Region filters
    const matchesCountry = filterCountry === "All" || p.country === filterCountry;
    const matchesState = filterState === "All" || p.state === filterState;
    const matchesDistrict = filterDistrict === "All" || p.district === filterDistrict;

    return matchesSearch && matchesStatus && matchesCountry && matchesState && matchesDistrict;
  });

  const uniqueCountries = Array.from(new Set(dbPartners.map((p) => p.country).filter(Boolean)));
  const uniqueStates = Array.from(new Set(dbPartners.map((p) => p.state).filter(Boolean)));
  const uniqueDistricts = Array.from(new Set(dbPartners.map((p) => p.district).filter(Boolean)));

  // Drawer selected item info
  const viewPartnerDetails = (p) => {
    setSelectedPartner(p);
    setProfileActiveTab("overview");
    setDrawerOpen(true);
  };

  const currentFormOpen = showAddForm || isFormOpenExternal;

  return (
    <div className="space-y-6">
      {/* FILTER & OPERATIONAL BOARD */}
      {!currentFormOpen && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">EPC Partner Management</h2>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-primary text-white hover:bg-orange-800 transition-all px-4 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-secondary" />
              Onboard New EPC
            </button>
          </div>
          
          <MasterFilterBar
            search={searchQuery}
            setSearch={setSearchQuery}
            statusFilter={filterStatus}
            setStatusFilter={setFilterStatus}
            statusOptions={["Active", "Pending", "Suspended", "Overdue"]}
            countryFilter={filterCountry}
            setCountryFilter={(val) => {
              const newC = val;
              setFilterCountry(newC);
              const newStates = Object.keys(COUNTRY_DATA[newC] || {});
              const newS = newStates[0] || "";
              setFilterState(newS);
              const newDistricts = COUNTRY_DATA[newC]?.[newS] || [];
              setFilterDistrict(newDistricts[0] || "");
            }}
            onClear={() => {
              setSearchQuery("");
              setFilterStatus("All");
              setFilterCountry(availableCountries[0]);
              setFilterState("All");
              setFilterDistrict("All");
            }}
            extraFilters={[
              {
                isActive: filterState !== 'All',
                component: (
                  <select
                    value={filterState}
                    onChange={(e) => {
                      const newS = e.target.value;
                      setFilterState(newS);
                      const newDistricts = COUNTRY_DATA[filterCountry]?.[newS] || [];
                      setFilterDistrict(newDistricts[0] || "");
                    }}
                    className="text-sm font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 text-primary focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="All">All States</option>
                    {Object.keys(COUNTRY_DATA[filterCountry] || {}).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                )
              },
              {
                isActive: filterDistrict !== 'All',
                component: (
                  <select
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    className="text-sm font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 text-primary focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="All">All Districts</option>
                    {(COUNTRY_DATA[filterCountry]?.[filterState] || []).map((dst) => (
                      <option key={dst} value={dst}>{dst}</option>
                    ))}
                  </select>
                )
              }
            ]}
          />
        </div>
      )}

      {/* --- FORM BOARD: ADD OR EDIT EPC --- */}
      {currentFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <h3 className="text-lg font-bold text-primary font-display">
              {editingPartner
                ? `Revise Registry: ${editingPartner.partnerName}`
                : "Onboard Partner: Solar EPC Application"}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                onCloseFormExternal();
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Partner Name */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Partner / Coordinator Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.partnerName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, partnerName: e.target.value })
                  }
                  placeholder="e.g. Anand Vikram"
                  className="w-full text-xs bg-gray-50 hover:bg-gray-100/50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20 transition-all"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Registered Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="e.g. Vikram Solar Solutions Ltd"
                  className="w-full text-xs bg-gray-50 hover:bg-gray-100/50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Primary Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="e.g. info@vikramsolar.com"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20 transition-all"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Coordinator Mobile *
                </label>
                <input
                  type="text"
                  required
                  value={formData.mobile || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  placeholder="e.g. +91 98765 43210"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20 transition-all"
                />
              </div>

              {/* HQ Location */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  HQ / Registry Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hqLocation || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, hqLocation: e.target.value })
                  }
                  placeholder="e.g. Salt Lake, Kolkata"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20 transition-all"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Administrative State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="e.g. West Bengal"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20 transition-all"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={formData.district || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  placeholder="e.g. Kolkata"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20 transition-all"
                />
              </div>

              {/* Cluster */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Target Cluster/Area *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cluster || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cluster: e.target.value })
                  }
                  placeholder="e.g. East Cluster-A"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20 transition-all"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.experience ?? 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Min Capacity */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Minimum Project Size (kW) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.minKW ?? 5}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minKW: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Max Capacity */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Maximum Project Size (kW) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.maxKW ?? 250}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxKW: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Number of Installers */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Available On-site Installers *
                </label>
                <input
                  type="number"
                  required
                  value={formData.installersCount ?? 2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      installersCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Subscription Plan selection */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Subscription Tier Assignment *
                </label>
                <select
                  value={formData.subscriptionPlan || "Starter Plan"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subscriptionPlan: e.target.value,
                    })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden focus:border-primary/20"
                >
                  <option value="Starter Plan">Starter Plan</option>
                  <option value="Growth Plan">Growth Plan</option>
                  <option value="Premium Plan">Premium Plan</option>
                  <option value="Enterprise Plan">
                    Enterprise/Custom Plan
                  </option>
                </select>
              </div>

              {/* Operational Status selector */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Platform Status *
                </label>
                <select
                  value={formData.status || "Pending"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3.5 focus:bg-white focus:outline-hidden"
                >
                  <option value="Pending">Pending Audit</option>
                  <option value="Active">Active Operational</option>
                  <option value="Suspended">Suspended / Frozen</option>
                </select>
              </div>
            </div>

            {/* Checkbox multi-select for Supported project types */}
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <label className="block text-xs font-bold text-primary mb-2.5">
                Grid Project Types Supported *
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  "Residential",
                  "Commercial",
                  "Industrial",
                  "Utility Scale",
                ].map((type) => {
                  const checked = (formData.projectTypes || []).includes(type);
                  return (
                    <label
                      key={type}
                      className="inline-flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleProjectTypeToggle(type)}
                        className="rounded text-accent focus:ring-accent"
                      />

                      <span className="text-xs text-gray-700 font-medium">
                        {type} Solar
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Form actions groups */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  onCloseFormExternal();
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-[#22A06B] text-white rounded-xl hover:bg-[#1b8557] cursor-pointer shadow-xs"
              >
                {editingPartner
                  ? "Update Configuration"
                  : "Confirm & Register On-site"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- DATA TABLE: RENDER PRIMARY ACTIVE EPC GRID --- */}
      {!currentFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full divide-y divide-gray-105 text-left">
              <thead className="bg-orange-600 text-white">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                    Partner & Company
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                    Contact & Mobile
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                    State / HQ Location
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                    Capacity Allowed
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                    Installers
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                    KYC / Agreement
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold font-display uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 bg-gray-100 rounded-full" style={{ width: j === 0 ? '80%' : j === 8 ? '50%' : '65%' }} />
                          {j === 0 && <div className="h-2 bg-gray-50 rounded-full mt-2 w-1/2" />}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredPartners.length > 0 ? (
                  filteredPartners.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => viewPartnerDetails(p)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Name & Company */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary group-hover:text-accent transition-colors font-display">
                            {p.partnerName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {p.companyName}
                          </span>
                        </div>
                      </td>

                      {/* Contact details */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs">
                        <div className="flex flex-col text-gray-600">
                          <span>{p.email}</span>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {p.mobile}
                          </span>
                        </div>
                      </td>

                      {/* HQ location */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div className="flex flex-col text-gray-600">
                            <span>
                              {p.hqLocation}, {p.state}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {p.cluster}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Capacity rating */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700">
                            {p.minKW} - {p.maxKW} kW
                          </span>
                          <span className="text-[9px] text-[#22A06B] font-semibold uppercase font-mono">
                            {p.subscriptionPlan}
                          </span>
                        </div>
                      </td>

                      {/* Installers Count */}
                      <td className="px-5 py-4 whitespace-nowrap text-center text-xs font-semibold text-gray-700">
                        {p.installersCount} crews
                      </td>

                      {/* Status Check badge */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* KYC and Agreement tags */}
                      <td className="px-5 py-4 whitespace-nowrap text-center text-xs font-semibold">
                        <div className="flex flex-col gap-1 items-center">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono ${p.kycStatus === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                          >
                            KYC: {p.kycStatus}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono ${p.agreementStatus === "Signed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-500"}`}
                          >
                            AGREE: {p.agreementStatus}
                          </span>
                        </div>
                      </td>

                      {/* Rating Grade */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <RatingStars rating={p.rating} />
                      </td>

                      {/* Actions column */}
                      <td
                        className="px-5 py-4 whitespace-nowrap text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => viewPartnerDetails(p)}
                            className="p-1.5 rounded-lg text-primary hover:bg-[#F9B233]/10 hover:text-primary transition-all cursor-pointer"
                            title="View Detail Tabs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => handleEditOpen(p, e)}
                            className="p-1.5 rounded-lg text-[#2563EB] hover:bg-[#2563EB]/10 transition-all cursor-pointer"
                            title="Edit Basic Form"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12">
                      <EmptyState
                        title="No EPC Grid Match Found"
                        description="Try clarifying state boundaries or search names to find matches."
                        actionButton={
                          <button
                            onClick={() => {
                              setFilterStatus("All");
                              setFilterRegion("All");
                            }}
                            className="px-4 py-2 text-xs bg-primary text-white rounded-lg cursor-pointer font-bold"
                          >
                            Clear All Filters
                          </button>
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ---- PAGINATION CONTROLS ---- */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              {/* Left: count info */}
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-primary">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
                </span>{" "}
                of <span className="font-semibold text-primary">{totalCount}</span> partners
              </p>

              {/* Right: page buttons */}
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>

                {/* Page number pills */}
                {(() => {
                  const pages = [];
                  const delta = 2;
                  const left = Math.max(2, currentPage - delta);
                  const right = Math.min(totalPages - 1, currentPage + delta);

                  pages.push(1);
                  if (left > 2) pages.push('...');
                  for (let i = left; i <= right; i++) pages.push(i);
                  if (right < totalPages - 1) pages.push('...');
                  if (totalPages > 1) pages.push(totalPages);

                  return pages.map((pg, idx) =>
                    pg === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-gray-400">…</span>
                    ) : (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all ${pg === currentPage
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'border border-gray-200 text-gray-600 hover:bg-white hover:border-primary/30'
                          }`}
                      >
                        {pg}
                      </button>
                    )
                  );
                })()}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* When only 1 page — show simple count */}
          {!isLoading && totalPages <= 1 && totalCount > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Total <span className="font-semibold text-primary">{totalCount}</span> partners
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB-BASED EPCPARTNERS DETAIL SLIDABLE DRAWER --- */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedPartner?.partnerName || "EPC Partner Registry Profile"}
        subtitle={selectedPartner?.companyName}
      >
        {selectedPartner && (
          <div className="space-y-6">
            {/* Slide Profile Header summary card */}
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary text-white rounded-xl">
                  <Briefcase className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary font-display flex items-center gap-2">
                    {selectedPartner.partnerName}
                    {selectedPartner.hasTrustBadge && (
                      <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border border-yellow-300">
                        <ShieldCheck className="w-3 h-3" /> Verified Trust Badge
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-accent">
                    {selectedPartner.subscriptionPlan}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <StatusBadge status={selectedPartner.status} />
                <div className="mt-1.5">
                  <RatingStars rating={selectedPartner.rating} />
                </div>
              </div>
            </div>

            {/* TAB LIST SELECTOR */}
            <div className="flex border-b border-gray-100 overflow-x-auto gap-2">
              {[
                { name: "Overview", id: "overview" },
                { name: "KYC Details", id: "kyc" },
                { name: "Agreement Terms", id: "agreement" },
                { name: "Qualification Rules", id: "qualification" },
                { name: "Subscription Plan", id: "subscription" },
                { name: "Active Grid Projects", id: "projects" },
                { name: "Assigned Crew", id: "installers" },
                { name: "SaaS Ratings & Badges", id: "ratings" },
              ].map((tab) => {
                const isActive = profileActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProfileActiveTab(tab.id)}
                    className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${isActive
                        ? "border-secondary text-primary font-bold"
                        : "border-transparent text-gray-500 hover:text-primary"
                      }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTAINER OUTLET */}
            <div className="pt-2">
              {/* --- TAB 1: OVERVIEW --- */}
              {profileActiveTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 border border-gray-100/50 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                        Administrative Region
                      </span>
                      <span className="text-xs text-primary font-bold mt-1 block">
                        {selectedPartner.hqLocation}, {selectedPartner.state}
                      </span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        {selectedPartner.cluster} Cluster
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-100/50 rounded-xl">
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                        Grid Size Experience
                      </span>
                      <span className="text-xs text-primary font-bold mt-1 block">
                        {selectedPartner.experience} Years in Solar EPC
                      </span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Capacity Allowance: {selectedPartner.minKW} -{" "}
                        {selectedPartner.maxKW} kW
                      </span>
                    </div>
                  </div>

                  <div className="bg-orange-600/5 p-4 rounded-xl border border-orange-600/10">
                    <h5 className="text-xs font-bold text-primary mb-2">
                      Capabilities Checklist
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Residential Solar",
                        "Commercial Grid",
                        "Industrial High-Load",
                        "CEIG Approvals",
                        "Discom Net Metering",
                      ].map((cap, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-primary font-medium"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-yellow-800 mb-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Premium Trust Badge
                      </h5>
                      <p className="text-[10px] text-yellow-600">Assign this badge to give EPC priority lead assignments.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={selectedPartner.hasTrustBadge || false}
                        onChange={() => handleToggleTrustBadge(selectedPartner)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* --- TAB 2: KYC DETAILS --- */}
              {profileActiveTab === "kyc" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                        Company Reg No
                      </span>
                      <span className="font-bold text-primary mt-1 block font-mono">
                        {selectedPartner.kycDetails?.companyRegNo || "Pending"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                        GST Number
                      </span>
                      <span className="font-bold text-primary mt-1 block font-mono">
                        {selectedPartner.kycDetails?.gstNumber || "Pending"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                        PAN Number
                      </span>
                      <span className="font-bold text-primary mt-1 block font-mono">
                        {selectedPartner.kycDetails?.panNumber || "Pending"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                        Authorized signatory
                      </span>
                      <span className="font-bold text-accent mt-1 block font-semibold">
                        {selectedPartner.kycDetails?.authPersonName ||
                          "Pending"}{" "}
                        ({selectedPartner.kycDetails?.authPersonDesignation})
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                    <h5 className="font-bold text-primary mb-2 text-[10px] uppercase">
                      Bank Disbursement Config
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-gray-400 block text-[9px]">
                          Bank Name
                        </span>
                        <span className="font-semibold text-gray-700">
                          {selectedPartner.kycDetails?.bankName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px]">
                          IFSC Code
                        </span>
                        <span className="font-semibold text-gray-700 font-mono">
                          {selectedPartner.kycDetails?.ifscCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px]">
                          Account Number
                        </span>
                        <span className="font-semibold text-gray-700 font-mono">
                          {selectedPartner.kycDetails?.accountNo}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateKyc(selectedPartner, 'Verified')} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors">
                        Approve KYC
                      </button>
                      <button onClick={() => handleUpdateKyc(selectedPartner, 'Rejected')} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors">
                        Reject KYC
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button onClick={() => handleToggleActive(selectedPartner)} className={`w-full py-2.5 text-xs font-bold rounded-xl transition-colors ${selectedPartner.status === 'Active' ? 'bg-orange-50 hover:bg-orange-100 text-orange-600' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        {selectedPartner.status === 'Active' ? 'Deactivate / Suspend Partner' : 'Activate Partner'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 3: AGREEMENT AGREEMENT --- */}
              {profileActiveTab === "agreement" && (
                <div className="space-y-3 p-1 text-xs">
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#22A06B]" />
                      <div>
                        <p className="font-bold">E-Sign Execution Complete</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          Agreement status in valid state
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] bg-white rounded px-2 py-0.5 font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">
                      Undertaking checkbox state
                    </p>
                    <p className="text-slate-700 italic leading-relaxed">
                      "We hereby confirm that all solar rooftop structures are
                      rust-protected hot-dip galvanized or modular aluminum,
                      carrying structural certificates issued by verified
                      third-party civil inspectors."
                    </p>
                    <p className="text-[10px] text-primary font-bold mt-2">
                      Accepted on:{" "}
                      {selectedPartner.kycDetails?.agreementAcceptedDate ||
                        "2026-02-10"}
                    </p>
                  </div>
                </div>
              )}

              {/* --- TAB 4: QUALIFICATION RULES --- */}
              {profileActiveTab === "qualification" && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Based on the experience of{" "}
                    <strong className="text-primary font-semibold">
                      {selectedPartner.experience} Years
                    </strong>{" "}
                    and installer size, the following qualification rules govern
                    assignments on EmergeSun SaaS:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 border rounded-xl">
                      <span className="text-gray-400 text-[10px] font-bold uppercase">
                        Partner Classification Range
                      </span>
                      <p className="font-bold mt-1 text-primary">
                        {selectedPartner.experience >= 8
                          ? "Large Scale premium / Industrial EPC"
                          : "Experienced Standard Residential EPC"}
                      </p>
                    </div>
                    <div className="p-3 border rounded-xl">
                      <span className="text-gray-400 text-[10px] font-bold uppercase">
                        Weekly Concurrent limits
                      </span>
                      <p className="font-bold mt-1 text-primary">
                        {selectedPartner.subscriptionPlan === "Enterprise Plan"
                          ? "Unlimited Project Assignment"
                          : "15 Active Assignments limit"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB 5: SUBSCRIPTION --- */}
              {profileActiveTab === "subscription" && (
                <div className="space-y-4 p-1">
                  <div className="p-5 bg-gradient-to-br from-[#0B3A53] to-[#154E6F] text-white rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 bg-secondary font-bold text-primary rounded-bl-2xl text-xs uppercase tracking-wide">
                      Active Subscription
                    </div>
                    <span className="text-sky-200 text-[10px] font-mono tracking-widest block uppercase">
                      CURRENT PLAN
                    </span>
                    <h4 className="text-xl font-bold font-display text-white mt-1">
                      {selectedPartner.subscriptionPlan}
                    </h4>
                    <p className="text-xs text-sky-100/80 mt-2 max-w-md">
                      Provides unlimited on-field installer accounts, real-time
                      dispatch dashboard, custom branding on reports, and
                      Priority Bidding access.
                    </p>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2 text-xs">
                    <span className="text-gray-500 font-semibold">
                      Sub Monthly Renewal Fee:
                    </span>
                    <strong className="text-primary font-mono">
                      $699/month
                    </strong>
                  </div>
                </div>
              )}

              {/* --- TAB 6: PROJECTS --- */}
              {profileActiveTab === "projects" && (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-500 mb-2">
                    Projects assigned to this registered Solar EPC Partner:
                  </p>
                  {projects.filter(
                    (p) => p.assignedEPCPartnerId === selectedPartner.id,
                  ).length > 0 ? (
                    projects
                      .filter(
                        (p) => p.assignedEPCPartnerId === selectedPartner.id,
                      )
                      .map((proj) => (
                        <div
                          key={proj.id}
                          className="flex justify-between items-center text-xs p-3.5 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div>
                            <strong className="text-primary block font-display">
                              {proj.projectName}
                            </strong>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {proj.kwSize}kW Solar · {proj.location},{" "}
                              {proj.state}
                            </span>
                          </div>
                          <StatusBadge status={proj.status} />
                        </div>
                      ))
                  ) : (
                    <EmptyState
                      title="No Projects Assigned"
                      description="Choose active unassigned projects and assign them to this partner."
                    />
                  )}
                </div>
              )}

              {/* --- TAB 7: INSTALLERS --- */}
              {profileActiveTab === "installers" && (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Assigned installer personnel in custom cluster ranges:
                  </p>
                  {installers.filter(
                    (i) => i.epcPartnerId === selectedPartner.id,
                  ).length > 0 ? (
                    installers
                      .filter((i) => i.epcPartnerId === selectedPartner.id)
                      .map((inst) => (
                        <div
                          key={inst.id}
                          className="flex justify-between items-center p-3 border rounded-xl hover:shadow-xs transition-shadow"
                        >
                          <div>
                            <p className="text-xs font-bold text-primary font-display">
                              {inst.installerName}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {inst.experienceYears} Years experience ·{" "}
                              {inst.mobile}
                            </p>
                          </div>
                          <StatusBadge status={inst.availabilityStatus} />
                        </div>
                      ))
                  ) : (
                    <EmptyState
                      title="No Registered Installer Crew"
                      description="This partner hasn't assigned individual labor installer users to their account yet."
                    />
                  )}
                </div>
              )}

              {/* --- TAB 8: RATINGS & BENEFITS --- */}
              {profileActiveTab === "ratings" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex flex-col items-center justify-center border border-amber-200">
                      <Award className="w-8 h-8 text-secondary animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wide">
                        GRADE CERTIFIED BY CLIENTS
                      </p>
                      <h4 className="text-lg font-bold text-primary mt-0.5 font-display flex items-center gap-2">
                        {selectedPartner.rating} Star Rating
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          PLATINUM QUALITY
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2">
                    <p className="font-bold text-primary">
                      Priority Lead dispatch Status:
                    </p>
                    <p className="text-gray-500 leading-relaxed">
                      SaaS algorithm grants Vikram Solar Solutions high priority
                      dispatch. Residential or commercial bookings within Mumbai
                      Suburban or Kolkata clusters bypass unassigned buffers and
                      are automatically emailed to their dispatchers.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Deactivation Modal */}
      {deactivateModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Deactivate EPC Partner</h3>
              <button
                onClick={() => setDeactivateModal({ isOpen: false, partner: null, reason: "" })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                You are about to deactivate <strong>{deactivateModal.partner?.companyName}</strong>.
                Please provide a reason for this action.
              </p>
              <textarea
                value={deactivateModal.reason}
                onChange={(e) => setDeactivateModal({ ...deactivateModal, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="3"
                placeholder="Enter deactivation reason..."
                autoFocus
              ></textarea>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setDeactivateModal({ isOpen: false, partner: null, reason: "" })}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitDeactivation}
                disabled={!deactivateModal.reason.trim()}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
