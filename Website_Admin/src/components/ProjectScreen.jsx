/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Plus,
  Eye,
  SlidersHorizontal,
  Layers,
  Wrench,
  CheckCircle,
  Clock,
  Briefcase,
  ClipboardList,
  X,
  PlusCircle,
} from "lucide-react";
import { StatusBadge, DetailDrawer, EmptyState } from "./CommonUI";

export const ProjectScreen = ({
  projects,
  partners,
  installers,
  onAddProject,
  onUpdateProject,
  isFormOpenExternal,
  onCloseFormExternal,
  searchQuery,
}) => {
  // Page states
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Assignment Modal states
  const [assignPartnerModalOpen, setAssignPartnerModalOpen] = useState(false);
  const [assignInstallerModalOpen, setAssignInstallerModalOpen] =
    useState(false);
  const [projectToAssign, setProjectToAssign] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form Field state
  const [formData, setFormData] = useState({
    projectName: "",
    customerName: "",
    projectType: "Residential",
    kwSize: 5,
    location: "",
    state: "",
    district: "",
    cluster: "",
    installationAddress: "",
    assignedEPCPartnerId: "",
    assignedEPCPartnerName: "Unassigned",
    assignedInstallerId: "",
    assignedInstallerName: "Unassigned",
    startDate: "",
    expectedCompletionDate: "",
    notes: "",
    status: "New",
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      projectName: "",
      customerName: "",
      projectType: "Residential",
      kwSize: 5,
      location: "",
      state: "",
      district: "",
      cluster: "",
      installationAddress: "",
      assignedEPCPartnerId: "",
      assignedEPCPartnerName: "Unassigned",
      assignedInstallerId: "",
      assignedInstallerName: "Unassigned",
      startDate: new Date().toISOString().split("T")[0],
      expectedCompletionDate: "",
      notes: "",
      status: "New",
    });
    setShowForm(true);
  };

  const handleOpenEdit = (p, e) => {
    e.stopPropagation();
    setEditingProject(p);
    setFormData(p);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auto populate partner/installer name if selected by ID matching
    const partner = partners.find(
      (pa) => pa.id === formData.assignedEPCPartnerId,
    );
    const installer = installers.find(
      (i) => i.id === formData.assignedInstallerId,
    );

    const completeProject = {
      id: editingProject ? editingProject.id : `proj-${projects.length + 11}`,
      projectName: formData.projectName || "",
      customerName: formData.customerName || "",
      projectType: formData.projectType || "Residential",
      kwSize: Number(formData.kwSize) || 5,
      location: formData.location || "",
      state: formData.state || "",
      district: formData.district || "",
      cluster: formData.cluster || "",
      installationAddress: formData.installationAddress || "",
      assignedEPCPartnerId: partner?.id || "",
      assignedEPCPartnerName: partner?.partnerName || "Unassigned",
      assignedInstallerId: installer?.id || "",
      assignedInstallerName: installer?.installerName || "Unassigned",
      startDate: formData.startDate || "",
      expectedCompletionDate: formData.expectedCompletionDate || "",
      status: formData.status || "New",
      notes: formData.notes || "",
      documents: editingProject?.documents || [],
      timeline: editingProject?.timeline || [
        {
          status: "New",
          title: "Booking Raised & Initial Survey",
          date: formData.startDate || "",
          done: true,
        },
        {
          status: "Assigned",
          title: `Assigned to ${partner?.partnerName || "Unassigned"}`,
          date: "",
          done: !!partner,
        },
        {
          status: "In Progress",
          title: "On-site installation logistics",
          date: "",
          done: false,
        },
        {
          status: "Completed",
          title: "Power Grid Commissioned NOC",
          date: formData.expectedCompletionDate || "",
          done: false,
        },
      ],
    };

    if (editingProject) {
      onUpdateProject(completeProject);
    } else {
      onAddProject(completeProject);
    }
    setShowForm(false);
    onCloseFormExternal();
  };

  // Helper selectors
  const activeEPCPartners = partners.filter((p) => p.status === "Active");
  // Installers for selected EPC or all if unassigned
  const eligibleInstallersForProject = (proj) => {
    if (!proj || !proj.assignedEPCPartnerId) return installers;
    return installers.filter(
      (i) => i.epcPartnerId === proj.assignedEPCPartnerId,
    );
  };

  // Triggers for assignment modals
  const triggerAssignPartner = (proj, e) => {
    e.stopPropagation();
    setProjectToAssign(proj);
    setAssignPartnerModalOpen(true);
  };

  const triggerAssignInstaller = (proj, e) => {
    e.stopPropagation();
    setProjectToAssign(proj);
    setAssignInstallerModalOpen(true);
  };

  const handleConfirmPartnerAssignment = (partnerId) => {
    if (projectToAssign) {
      const partner = partners.find((pa) => pa.id === partnerId);
      const updated = {
        ...projectToAssign,
        assignedEPCPartnerId: partner?.id || "",
        assignedEPCPartnerName: partner?.partnerName || "Unassigned",
        status: "Assigned",
      };
      // Advance step timeline done
      const newTimeline = [...updated.timeline];
      const assignedStep = newTimeline.find(
        (step) => step.status === "Assigned",
      );
      if (assignedStep) {
        assignedStep.done = true;
        assignedStep.date = new Date().toISOString().split("T")[0];
      }
      updated.timeline = newTimeline;
      onUpdateProject(updated);
      setAssignPartnerModalOpen(false);
      setProjectToAssign(null);
    }
  };

  const handleConfirmInstallerAssignment = (installerId) => {
    if (projectToAssign) {
      const installer = installers.find((i) => i.id === installerId);
      const updated = {
        ...projectToAssign,
        assignedInstallerId: installer?.id || "",
        assignedInstallerName: installer?.installerName || "Unassigned",
        status: "In Progress",
      };
      // Advance step timeline done
      const newTimeline = [...updated.timeline];
      const progStep = newTimeline.find(
        (step) => step.status === "In Progress",
      );
      if (progStep) {
        progStep.done = true;
        progStep.date = new Date().toISOString().split("T")[0];
      }
      updated.timeline = newTimeline;
      onUpdateProject(updated);
      setAssignInstallerModalOpen(false);
      setProjectToAssign(null);
    }
  };

  const toggleTimelineStep = (proj, stepIdx) => {
    const updatedTimeline = [...proj.timeline];
    updatedTimeline[stepIdx].done = !updatedTimeline[stepIdx].done;
    updatedTimeline[stepIdx].date = updatedTimeline[stepIdx].done
      ? new Date().toISOString().split("T")[0]
      : "";
    // Automatically match overall status to last checked step
    let nextStatus = proj.status;
    if (updatedTimeline[stepIdx].done) {
      nextStatus = updatedTimeline[stepIdx].status;
    } else {
      // regress index
      const previousDoneIndex = updatedTimeline
        .map((s) => s.done)
        .lastIndexOf(true);
      if (previousDoneIndex !== -1) {
        nextStatus = updatedTimeline[previousDoneIndex].status;
      } else {
        nextStatus = "New";
      }
    }

    const updated = {
      ...proj,
      status: nextStatus,
      timeline: updatedTimeline,
    };
    onUpdateProject(updated);
    if (selectedProject?.id === proj.id) {
      setSelectedProject(updated);
    }
  };

  // Filter projects list
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.assignedEPCPartnerName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesType = filterType === "All" || p.projectType === filterType;
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const viewProjectDetails = (p) => {
    setSelectedProject(p);
    setDrawerOpen(true);
  };

  const currentFormOpen = showForm || isFormOpenExternal;

  return (
    <div className="space-y-6">
      {/* ACTION & FILTERS BANNER */}
      {!currentFormOpen && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded-xl text-primary font-medium text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Sieve Projects:
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs font-semibold bg-white border border-gray-100 rounded-xl px-3 py-2 text-primary focus:outline-hidden"
            >
              <option value="All">All Types (Scale Ranges)</option>
              <option value="Residential">Residential Solar</option>
              <option value="Commercial">Commercial Grid</option>
              <option value="Industrial">Industrial Grid</option>
              <option value="Utility Scale">Utility Scale</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold bg-white border border-gray-100 rounded-xl px-3 py-2 text-primary focus:outline-hidden"
            >
              <option value="All">All Progression Statuses</option>
              <option value="New">New Unassigned Bookings</option>
              <option value="Assigned">Assigned to Partner</option>
              <option value="In Progress">Installation Active</option>
              <option value="Completed">Commissioned Online</option>
              <option value="Cancelled">Cancelled Projects</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-[#0B3A53] hover:bg-[#124b69] text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-xs"
          >
            <Plus className="w-4.5 h-4.5 text-secondary animate-pulse" />
            Create Project Booking
          </button>
        </div>
      )}

      {/* --- FORM BOARD: CREATE OR EDIT PROJECT Solar --- */}
      {currentFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-6Shared flex">
            <h4 className="text-md font-bold text-primary font-display">
              {editingProject
                ? `Adjust Booking Specs: ${editingProject.projectName}`
                : "Launch High-Contrast Solar Project Booking"}
            </h4>
            <button
              onClick={() => {
                setShowForm(false);
                onCloseFormExternal();
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  placeholder="e.g. Goel Resident Sol-Rooftop"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Customer / Developer Corporate *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="e.g. Rajesh Goel"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Solar Project Type Class *
                </label>
                <select
                  value={formData.projectType || "Residential"}
                  onChange={(e) =>
                    setFormData({ ...formData, projectType: e.target.value })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                >
                  <option value="Residential">Residential Solar</option>
                  <option value="Commercial">Commercial Grid</option>
                  <option value="Industrial">Industrial high-load</option>
                  <option value="Utility Scale">Utility Scale solar</option>
                </select>
              </div>

              {/* kW Size */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Desired size of solar plant (kW) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.kwSize || 5}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kwSize: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  HQ / Local Cluster Zone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Salt Lake, Kolkata"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              {/* Administrative Region state */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Region state location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="e.g. West Bengal"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
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
                  className="w-full text-xs bg-gray-50 border border-gray-100 tracking-wide rounded-xl py-2.5"
                />
              </div>

              {/* Cluster */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  SaaS dispatching Cluster *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cluster || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cluster: e.target.value })
                  }
                  placeholder="e.g. East Cluster-A"
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              {/* Delivery dates expected */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Commissioning target date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expectedCompletionDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedCompletionDate: e.target.value,
                    })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                />
              </div>

              {/* Assigned EPC */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Assigned EPC Partner *
                </label>
                <select
                  value={formData.assignedEPCPartnerId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedEPCPartnerId: e.target.value,
                    })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                >
                  <option value="">
                    -- Choose Unassigned / Auto qualify --
                  </option>
                  {activeEPCPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.partnerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project progress status */}
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Overall Progression Status *
                </label>
                <select
                  value={formData.status || "New"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl py-2.5"
                >
                  <option value="New">New Unassigned Booking</option>
                  <option value="Assigned">Assigned to Partner</option>
                  <option value="In Progress">
                    Civil Foundations / In Progress
                  </option>
                  <option value="Installation Scheduled">
                    Panel Mounting Schedule
                  </option>
                  <option value="Completed">Grid Commission Finished</option>
                  <option value="Cancelled">Cancelled Booking</option>
                </select>
              </div>
            </div>

            {/* Address Details */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">
                Physical Installation Site Address *
              </label>
              <textarea
                required
                value={formData.installationAddress || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    installationAddress: e.target.value,
                  })
                }
                placeholder="Give exact rooftop / site coordinates for installer delivery dispatch..."
                className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl p-3 focus:bg-white min-h-[60px]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">
                Operational dispatch notes / remarks
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="List specific panels brand, string sizing layout, CEIG requirements or other logistics factors..."
                className="w-full text-xs bg-gray-50 border border-gray-100 rounded-xl p-3 focus:bg-white min-h-[60px]"
              />
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  onCloseFormExternal();
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-650 hover:bg-gray-100 border border-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-[#22A06B] text-white rounded-xl hover:bg-[#188053]"
              >
                {editingProject
                  ? "Save Booking updates"
                  : "Initiate Project Booking"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- PROJECTS LOGS LIST TABLE --- */}
      {!currentFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full divide-y divide-gray-105 text-left text-xs">
              <thead className="bg-[#0B3A53] text-white">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider font-display">
                    Project Name / Client
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider font-display">
                    Type & Size
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">
                    State / Local coordinates
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">
                    Assigned EPC Partner
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-center">
                    Assigned Installer
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-center">
                    Roster dates
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => viewProjectDetails(p)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Name & client */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary group-hover:text-amber-500 transition-colors font-display">
                            {p.projectName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            Customer: {p.customerName}
                          </span>
                        </div>
                      </td>

                      {/* Type & Size */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700">
                            {p.projectType} Solar
                          </span>
                          <span className="text-[10px] text-accent font-bold font-mono uppercase tracking-wider">
                            {p.kwSize} kW plant
                          </span>
                        </div>
                      </td>

                      {/* Coordinates */}
                      <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                        <div className="flex flex-col">
                          <span>
                            {p.location}, {p.state}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {p.cluster}
                          </span>
                        </div>
                      </td>

                      {/* Assigned EPC Partner */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {p.assignedEPCPartnerId ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-primary">
                              {p.assignedEPCPartnerName}
                            </span>
                            <span className="text-[9px] font-bold text-accent font-mono">
                              SLA COMPLETE
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => triggerAssignPartner(p, e)}
                            className="bg-sky-50 text-sky-700 hover:bg-sky-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Match EPC
                          </button>
                        )}
                      </td>

                      {/* Field Installer */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        {p.assignedInstallerId ? (
                          <span className="font-semibold text-gray-700 font-sans">
                            {p.assignedInstallerName}
                          </span>
                        ) : p.assignedEPCPartnerId ? (
                          <button
                            onClick={(e) => triggerAssignInstaller(p, e)}
                            className="bg-amber-50 text-[#F9B233] hover:bg-[#F9B233]/15 text-[10px] font-bold px-2 py-1 rounded-sm mx-auto flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <Wrench className="w-3 h-3" />
                            Assign Installer
                          </button>
                        ) : (
                          <span className="text-gray-400 font-light text-[10px] block">
                            Awaiting partner match
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4 whitespace-nowrap text-center text-gray-500 font-mono text-[11px]">
                        <div className="flex flex-col">
                          <span>Start: {p.startDate || "--"}</span>
                          <span>Due: {p.expectedCompletionDate || "--"}</span>
                        </div>
                      </td>

                      {/* Status Badging */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td
                        className="px-5 py-4 whitespace-nowrap text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => viewProjectDetails(p)}
                            className="p-1 text-primary hover:bg-sky-50 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(p, e)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12">
                      <EmptyState
                        title="No Solar Projects matching filter"
                        description="Try widening search terms or creating a new direct project booking."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- PROGESSIVE LINE TIMELINE SHOWN INSIDE DRAWER VIEW --- */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedProject?.projectName || "Project progress Logs"}
        subtitle={`Client: ${selectedProject?.customerName}`}
      >
        {selectedProject && (
          <div className="space-y-6 text-left">
            {/* Overview Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-bold">
                  Installation Site address
                </span>
                <span className="text-primary mt-1 block font-sans">
                  {selectedProject.installationAddress ||
                    "Rooftop site coordinates pending."}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-bold">
                  Assigned Crew Coordinator
                </span>
                <span className="text-primary mt-1 block font-display">
                  {selectedProject.assignedEPCPartnerName}
                </span>
                <span className="text-[10px] text-[#22A06B] block mt-0.5">
                  Crew In-charge: {selectedProject.assignedInstallerName}
                </span>
              </div>
            </div>

            {/* TECHNICAL SPECS BAR */}
            <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl">
              <span className="text-[10px] text-sky-800 font-bold block uppercase tracking-wide">
                Plant Sizing specifications
              </span>
              <p className="text-xs text-sky-900 mt-1">
                Proposed{" "}
                <strong className="text-sky-950">
                  {selectedProject.kwSize} KW mono-crystalline Solar grid system
                </strong>{" "}
                styled using structural ballast layout designs.
              </p>
            </div>

            {/* STEP TIMELINE VERIFICATION COMPONENT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-150">
                <h5 className="text-xs font-bold text-primary font-display flex items-center gap-1">
                  <ClipboardList className="w-4 h-4" />
                  Grid Commission Steps Timeline check
                </h5>
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">
                  Operations Tracker
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs">
                {selectedProject.timeline.map((step, idx) => {
                  return (
                    <div key={idx} className="flex gap-4 items-start relative">
                      {/* Connection lines */}
                      {idx < selectedProject.timeline.length - 1 && (
                        <div
                          className={`absolute top-6 left-3 w-0.5 h-10 ${step.done ? "bg-accent" : "bg-gray-200"}`}
                        />
                      )}

                      {/* Step Circle Bubble */}
                      <button
                        onClick={() => toggleTimelineStep(selectedProject, idx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 z-10 transition-colors cursor-pointer ${
                          step.done
                            ? "bg-accent border-accent text-white"
                            : "bg-white border-gray-200 text-gray-400"
                        }`}
                        title="Toggle Execution check"
                      >
                        {step.done ? (
                          <CheckCircle className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <strong
                            className={`text-xs ${step.done ? "text-primary font-bold" : "text-gray-400"}`}
                          >
                            {step.title}
                          </strong>
                          <span className="text-[10px] text-gray-400 font-mono font-medium">
                            {step.date || "Awaiting Step"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Status triggered: {step.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes Section inside drawer */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 text-[10px] font-bold block uppercase mb-1">
                Administrative notes
              </span>
              <p className="text-slate-600 leading-relaxed font-sans mt-1">
                {selectedProject.notes ||
                  "No custom notes loaded yet by dispatch operations manager."}
              </p>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* --- INLINE MODAL 1: ASSIGN EPC PARTNER --- */}
      {assignPartnerModalOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 text-center">
            <div
              className="fixed inset-0 bg-primary/40 backdrop-blur-3xs"
              onClick={() => setAssignPartnerModalOpen(false)}
            />

            <div className="bg-white rounded-2xl border p-6 text-left shadow-xl inline-block transform align-middle w-full max-w-lg z-10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-150">
                <h5 className="font-bold text-primary text-sm font-display tracking-tight flex items-center gap-1.5">
                  <Briefcase className="w-4.5 h-4.5 text-accent" />
                  Assign Qualified EPC Coordinator
                </h5>
                <button
                  onClick={() => setAssignPartnerModalOpen(false)}
                  className="rounded-full hover:bg-gray-50 p-1 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs text-gray-400 font-medium">
                  Select an active accredited partner. All listed below carry
                  valid KYC details and are matched to local regions.
                </p>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {activeEPCPartners.length > 0 ? (
                    activeEPCPartners.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleConfirmPartnerAssignment(p.id)}
                        className="p-3 bg-gray-50 hover:bg-[#22A06B]/5 hover:border-[#22A06B]/30 rounded-xl cursor-pointer border border-gray-100 transition-colors flex justify-between items-center text-xs text-left"
                      >
                        <div>
                          <strong className="text-primary block font-bold font-display">
                            {p.partnerName}
                          </strong>
                          <span className="text-[10px] text-gray-500">
                            {p.experience} Years exp · {p.hqLocation}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-accent uppercase font-mono">
                          {p.subscriptionPlan}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 p-4">
                      No active qualified Partners registered.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- INLINE MODAL 2: ASSIGN INSTALLER CREW --- */}
      {assignInstallerModalOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 text-center">
            <div
              className="fixed inset-0 bg-primary/40 backdrop-blur-3xs"
              onClick={() => setAssignInstallerModalOpen(false)}
            />

            <div className="bg-white rounded-2xl border p-6 text-left shadow-xl inline-block transform align-middle w-full max-w-lg z-10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-150">
                <h5 className="font-bold text-primary text-sm font-display flex items-center gap-1.5">
                  <Wrench className="w-4.5 h-4.5 text-accent" />
                  Assign Installer Crew User
                </h5>
                <button
                  onClick={() => setAssignInstallerModalOpen(false)}
                  className="rounded-full hover:bg-gray-50 p-1 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-left">
                <p className="text-gray-400 font-medium">
                  Select available labor crews representing{" "}
                  <strong className="text-primary">
                    {projectToAssign?.assignedEPCPartnerName}
                  </strong>
                  :
                </p>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {eligibleInstallersForProject(projectToAssign).length > 0 ? (
                    eligibleInstallersForProject(projectToAssign).map((ins) => (
                      <div
                        key={ins.id}
                        onClick={() => handleConfirmInstallerAssignment(ins.id)}
                        className="p-3 bg-gray-50 hover:bg-amber-50/70 hover:border-amber-400 rounded-xl cursor-pointer border border-gray-100 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-primary block font-semibold">
                            {ins.installerName}
                          </strong>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Mobile: {ins.mobile} · {ins.experienceYears} Years
                            exp
                          </span>
                        </div>
                        <StatusBadge status={ins.availabilityStatus} />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 p-4 text-center">
                      This assigned partner hasn't loaded any crew users yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
