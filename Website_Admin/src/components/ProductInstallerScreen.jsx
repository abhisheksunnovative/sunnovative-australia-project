/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Package,
  Plus,
  X,
  Edit,
  SlidersHorizontal,
  HardHat,
} from "lucide-react";
import { StatusBadge } from "./CommonUI";

export const ProductInstallerScreen = ({
  activeSubTab,
  products,
  installers,
  partners,
  onAddProduct,
  onUpdateProduct,
  onAddInstaller,
  onUpdateInstaller,
}) => {
  // Page states
  const [productCatFilter, setProductCatFilter] = useState("All");
  const [installerStatusFilter, setInstallerStatusFilter] = useState("All");

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showInstallerForm, setShowInstallerForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingInstaller, setEditingInstaller] = useState(null);

  // Product Fields state
  const [prodForm, setProdForm] = useState({
    productName: "",
    category: "Solar Panel",
    brand: "",
    modelNumber: "",
    kwCapacity: "0.54",
    price: 180,
    stockQuantity: 100,
    warranty: "10 Years",
    status: "In Stock",
    description: "",
  });

  // Installer Fields state
  const [instForm, setInstForm] = useState({
    installerName: "",
    epcPartnerId: "",
    mobile: "",
    experienceYears: 3,
    skills: ["Earthing Setup"],
    location: "",
    projectTypesAllowed: ["Residential"],
    assignedProjectsCount: 0,
    availabilityStatus: "Available",
    rating: 4.5,
    documents: ["Aadhaar", "Solar Wiring Cert"],
  });

  // PRODUCT ACTIONS
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      productName: "",
      category: "Solar Panel",
      brand: "",
      modelNumber: "",
      kwCapacity: "0.54",
      price: 180,
      stockQuantity: 100,
      warranty: "10 Years",
      status: "In Stock",
      description: "",
    });
    setShowProductForm(true);
  };

  const handleOpenEditProduct = (p) => {
    setEditingProduct(p);
    setProdForm(p);
    setShowProductForm(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const resolvedStatus =
      prodForm.stockQuantity && prodForm.stockQuantity > 20
        ? "In Stock"
        : prodForm.stockQuantity && prodForm.stockQuantity > 0
          ? "Low Stock"
          : "Out of Stock";

    const completeProd = {
      id: editingProduct ? editingProduct.id : `prod-${products.length + 12}`,
      productName: prodForm.productName || "",
      category: prodForm.category || "Solar Panel",
      brand: prodForm.brand || "",
      modelNumber: prodForm.modelNumber || "",
      kwCapacity: prodForm.kwCapacity || "0",
      price: Number(prodForm.price) || 100,
      stockQuantity: Number(prodForm.stockQuantity) || 0,
      warranty: prodForm.warranty || "5 Years",
      status: resolvedStatus,
      description: prodForm.description || "",
      image: prodForm.category === "Solar Panel" ? "panel" : "inverter",
    };

    if (editingProduct) {
      onUpdateProduct(completeProd);
    } else {
      onAddProduct(completeProd);
    }
    setShowProductForm(false);
  };

  // INSTALLER ACTIONS
  const handleOpenAddInstaller = () => {
    setEditingInstaller(null);
    setInstForm({
      installerName: "",
      epcPartnerId: partners.length > 0 ? partners[0].id : "",
      mobile: "",
      experienceYears: 3,
      skills: ["Rooftop Layout Design"],
      location: "",
      projectTypesAllowed: ["Residential"],
      assignedProjectsCount: 0,
      availabilityStatus: "Available",
      rating: 4.2,
      documents: ["Aadhaar"],
    });
    setShowInstallerForm(true);
  };

  const handleOpenEditInstaller = (i) => {
    setEditingInstaller(i);
    setInstForm(i);
    setShowInstallerForm(true);
  };

  const handleInstallerSubmit = (e) => {
    e.preventDefault();
    const partner = partners.find((p) => p.id === instForm.epcPartnerId);
    const completeInst = {
      id: editingInstaller
        ? editingInstaller.id
        : `inst-${installers.length + 11}`,
      installerName: instForm.installerName || "",
      epcPartnerId: instForm.epcPartnerId || "",
      epcPartnerName: partner?.partnerName || "Unassigned",
      mobile: instForm.mobile || "",
      experienceYears: Number(instForm.experienceYears) || 1,
      skills: instForm.skills || ["Civil Setup"],
      location: instForm.location || "",
      projectTypesAllowed: instForm.projectTypesAllowed || ["Residential"],
      assignedProjectsCount: instForm.assignedProjectsCount || 0,
      availabilityStatus: instForm.availabilityStatus || "Available",
      rating: instForm.rating || 4.5,
      documents: instForm.documents || ["Aadhaar"],
    };

    if (editingInstaller) {
      onUpdateInstaller(completeInst);
    } else {
      onAddInstaller(completeInst);
    }
    setShowInstallerForm(false);
  };

  const handleToggleInstAvailability = (ins, status) => {
    onUpdateInstaller({
      ...ins,
      availabilityStatus: status,
    });
  };

  const handleSkillToggle = (skill) => {
    const list = instForm.skills || [];
    if (list.includes(skill)) {
      setInstForm({ ...instForm, skills: list.filter((s) => s !== skill) });
    } else {
      setInstForm({ ...instForm, skills: [...list, skill] });
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------ PRODUCTS TAB ------------------ */}
      {activeSubTab === "products" && (
        <div className="space-y-6 text-left">
          {/* Filters Bar Products */}
          {!showProductForm && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-primary px-3 py-2 bg-gray-50 rounded-xl flex items-center gap-1.5 grayscale shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                  Inventory Categories:
                </span>

                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="text-xs font-semibold bg-white border border-gray-100 px-3.5 py-2 rounded-xl text-primary"
                >
                  <option value="All">All Categories</option>
                  <option value="Solar Panel">Solar Panels</option>
                  <option value="Inverter">Inverters</option>
                  <option value="Battery">Batteries</option>
                  <option value="Mounting Structure">
                    Mounting Structures
                  </option>
                  <option value="Cable">Cables</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-1 bg-orange-600 text-white hover:bg-orange-700 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4 text-secondary animate-pulse" />
                Add Product Item
              </button>
            </div>
          )}

          {/* ADD PRODUCT FORM */}
          {showProductForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-6">
                <h4 className="font-bold text-primary text-sm font-display flex items-center gap-2">
                  <Package className="w-4.5 h-4.5 text-accent" />
                  {editingProduct
                    ? `Edit Product: ${editingProduct.productName}`
                    : "Add Product to EPC Catalog"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="rounded-full hover:bg-gray-100 p-1.5"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Product Model Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodForm.productName}
                      onChange={(e) =>
                        setProdForm({
                          ...prodForm,
                          productName: e.target.value,
                        })
                      }
                      placeholder="e.g. Vikram Mono-PERC 540W"
                      className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2 px-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Category Type *
                    </label>
                    <select
                      value={prodForm.category}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, category: e.target.value })
                      }
                      className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl"
                    >
                      <option value="Solar Panel">Solar Panel</option>
                      <option value="Inverter">Inverter</option>
                      <option value="Battery">Battery</option>
                      <option value="Mounting Structure">
                        Mounting Structure
                      </option>
                      <option value="Cable">Cable</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Manufacturer Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodForm.brand}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, brand: e.target.value })
                      }
                      placeholder="e.g. Sungrow"
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Model / Part Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodForm.modelNumber}
                      onChange={(e) =>
                        setProdForm({
                          ...prodForm,
                          modelNumber: e.target.value,
                        })
                      }
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Disbursement Price ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={prodForm.price}
                      onChange={(e) =>
                        setProdForm({
                          ...prodForm,
                          price: (e.target.value === '' ? '' : parseInt(e.target.value)) || 0,
                        })
                      }
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={prodForm.stockQuantity}
                      onChange={(e) =>
                        setProdForm({
                          ...prodForm,
                          stockQuantity: (e.target.value === '' ? '' : parseInt(e.target.value)) || 0,
                        })
                      }
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      KW / Wh Capacity rating *
                    </label>
                    <input
                      type="text"
                      value={prodForm.kwCapacity}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, kwCapacity: e.target.value })
                      }
                      placeholder="e.g. 5kW or 0.54kW"
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Manufacturer Warranty *
                    </label>
                    <input
                      type="text"
                      value={prodForm.warranty}
                      onChange={(e) =>
                        setProdForm({ ...prodForm, warranty: e.target.value })
                      }
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">
                    Operational description
                  </label>
                  <textarea
                    value={prodForm.description}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, description: e.target.value })
                    }
                    className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3.5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#22A06B] text-white rounded-xl text-xs font-semibold font-sans"
                  >
                    Save Catalog Item
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PRODUCTS INVENTORY LIST */}
          {!showProductForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <table className="min-w-full divide-y text-xs text-left">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="px-5 py-3.5 font-bold font-display uppercase">
                      Model specs
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase">
                      Brand & Catalog
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase">
                      Power (kW)
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase">
                      Disbursement Cost
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase text-center">
                      In-Stock Quantity
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase">
                      Warranty duration
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase text-center">
                      Operational state
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products
                    .filter(
                      (p) =>
                        productCatFilter === "All" ||
                        p.category === productCatFilter,
                    )
                    .map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-primary font-display">
                              {p.productName}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              MPN: {p.modelNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                          <div className="flex flex-col">
                            <span>{p.brand}</span>
                            <span className="text-[9px] text-[#22A06B] font-extrabold uppercase">
                              {p.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-gray-600">
                          {p.kwCapacity} kW
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-primary">
                          ${p.price}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center text-gray-700 font-bold">
                          {p.stockQuantity} units
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {p.warranty}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1 rounded-sm text-blue-500 hover:bg-blue-50 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------ INSTALLERS TAB ------------------ */}
      {activeSubTab === "installers" && (
        <div className="space-y-6 text-left">
          {/* Filters Bar Installers */}
          {!showInstallerForm && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-primary px-3 py-2 bg-gray-50 rounded-xl flex items-center gap-1 grayscale shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                  Roster Filter:
                </span>

                <select
                  value={installerStatusFilter}
                  onChange={(e) => setInstallerStatusFilter(e.target.value)}
                  className="text-xs font-semibold bg-white border border-gray-100 px-3 py-2 rounded-xl text-primary focus:outline-hidden"
                >
                  <option value="All">All Availabilities</option>
                  <option value="Available">Available Status</option>
                  <option value="On Field">On Field Assignment</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddInstaller}
                className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-[#072535] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs"
              >
                <Plus className="w-4.5 h-4.5 text-secondary animate-pulse" />
                Register Labor user
              </button>
            </div>
          )}

          {/* ADD INSTALLER FORM */}
          {showInstallerForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-6">
                <h4 className="font-bold text-primary text-sm font-display flex items-center gap-2">
                  <HardHat className="w-4.5 h-4.5 text-[#F9B233]" />
                  {editingInstaller
                    ? `Edit Roster account: ${editingInstaller.installerName}`
                    : "Onboard Crew user"}
                </h4>
                <button
                  onClick={() => setShowInstallerForm(false)}
                  className="p-1.5 hover:bg-gray-50 rounded-full"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleInstallerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Installer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={instForm.installerName}
                      onChange={(e) =>
                        setInstForm({
                          ...instForm,
                          installerName: e.target.value,
                        })
                      }
                      placeholder="e.g. Subhasish Roy"
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Employer EPC Partner *
                    </label>
                    <select
                      value={instForm.epcPartnerId}
                      onChange={(e) =>
                        setInstForm({
                          ...instForm,
                          epcPartnerId: e.target.value,
                        })
                      }
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    >
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.partnerName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Mobile Telephone *
                    </label>
                    <input
                      type="text"
                      required
                      value={instForm.mobile}
                      onChange={(e) =>
                        setInstForm({ ...instForm, mobile: e.target.value })
                      }
                      placeholder="+91 90000 00000"
                      className="w-full text-xs bg-gray-50 border border-gray-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Deploy State Headquarters *
                    </label>
                    <input
                      type="text"
                      required
                      value={instForm.location}
                      onChange={(e) =>
                        setInstForm({ ...instForm, location: e.target.value })
                      }
                      placeholder="Kolkata"
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Solar Installation Experience (Years) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={instForm.experienceYears}
                      onChange={(e) =>
                        setInstForm({
                          ...instForm,
                          experienceYears: (e.target.value === '' ? '' : parseInt(e.target.value)) || 1,
                        })
                      }
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">
                      Roster Availability Status *
                    </label>
                    <select
                      value={instForm.availabilityStatus || "Available"}
                      onChange={(e) =>
                        setInstForm({
                          ...instForm,
                          availabilityStatus: e.target.value,
                        })
                      }
                      className="w-full text-xs bg-gray-50 border border-gray-100"
                    >
                      <option value="Available">Available for dispatch</option>
                      <option value="On Field">On Field Active project</option>
                      <option value="On Leave">Sick / On Leave</option>
                    </select>
                  </div>
                </div>

                {/* Skills Multi selection tags */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-xs font-semibold text-primary mb-2 mb-2">
                    Technician Skills certification checklists
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Rooftop Layout Design",
                      "DC Cabling",
                      "TIG Welding",
                      "HT Grid Sync",
                      "Inverter Interconnection",
                      "Civil Foundation Concrete",
                    ].map((sk) => {
                      const selected = (instForm.skills || []).includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => handleSkillToggle(sk)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-sm border transition-all cursor-pointer ${
                            selected
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-gray-200 text-gray-500 hover:border-gray-350"
                          }`}
                        >
                          {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3.5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowInstallerForm(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#22A06B] text-white rounded-xl text-xs font-semibold"
                  >
                    Generate Technician Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* INSTALLER TABLE RENDER */}
          {!showInstallerForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <table className="min-w-full divide-y text-xs text-left">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="px-5 py-3.5 font-bold font-display uppercase">
                      Crew member Name
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase">
                      Affiliated EPC Coordinator
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase">
                      Contact & Telephone
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase">
                      Base District
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase">
                      Experience (Yrs)
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase text-center">
                      Safety Lic documents
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase text-center">
                      Roster Availability
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase text-center">
                      Current Dispatch toggle
                    </th>
                    <th className="px-5 py-3.5 font-bold uppercase text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {installers
                    .filter(
                      (i) =>
                        installerStatusFilter === "All" ||
                        i.availabilityStatus === installerStatusFilter,
                    )
                    .map((i) => (
                      <tr
                        key={i.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-primary font-display">
                              {i.installerName}
                            </span>
                            <div className="flex gap-1 flex-wrap mt-1 max-w-[200px]">
                              {i.skills.slice(0, 2).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] bg-sky-50 text-sky-800 font-semibold px-1 rounded-sm"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-semibold text-primary">
                          {i.epcPartnerName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-mono text-gray-600">
                          {i.mobile}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                          {i.location}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center font-mono font-bold text-gray-700">
                          {i.experienceYears} Years
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase font-bold border border-emerald-100">
                            {i.documents.length} Certs upload
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <StatusBadge status={i.availabilityStatus} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary">
                            <button
                              onClick={() =>
                                handleToggleInstAvailability(
                                  i,
                                  i.availabilityStatus === "Available"
                                    ? "On Field"
                                    : "Available",
                                )
                              }
                              className="text-[10px] font-semibold text-accent border border-accent/20 hover:bg-accent/5 px-2 py-1 rounded-md cursor-pointer"
                            >
                              Toggle Status
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleOpenEditInstaller(i)}
                            className="p-1 rounded-sm text-blue-500 hover:bg-blue-50 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
