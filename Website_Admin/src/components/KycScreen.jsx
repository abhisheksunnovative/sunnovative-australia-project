/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  FileCheck,
  AlertTriangle,
  Building,
  CreditCard,
  User,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  StatusBadge,
  Stepper,
  UploadDocumentBox,
  ConfirmationModal,
  EmptyState,
} from "./CommonUI";

export const KycScreen = ({ partners, onUpdatePartner, searchQuery }) => {
  const pendingKycList = partners.filter((p) => {
    const isPending = p.kycStatus === "Pending" || p.kycStatus === "Rejected";
    const matchesSearch =
      searchQuery === "" ||
      p.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return isPending && matchesSearch;
  });
  // Active review partner state
  const [activeReviewId, setActiveReviewId] = useState(
    pendingKycList.length > 0 ? pendingKycList[0].id : null,
  );

  // Active review partner data
  const reviewingPartner =
    partners.find((p) => p.id === activeReviewId) || pendingKycList[0];

  // Steps for on-board flow
  const onboardingSteps = [
    "Company Details",
    "Bank details",
    "Authorized Person",
    "Agreement & Undertaking",
    "Admin Review",
  ];

  // Active form/onboarding step state
  const [currentStepperIdx, setCurrentStepperIdx] = useState(0);

  // Simulated state keeping values for reviews
  const [formFields, setFormFields] = useState({
    companyRegNo:
      reviewingPartner?.kycDetails?.companyRegNo || "U40106WB2008PTC123456",
    gstNumber: reviewingPartner?.kycDetails?.gstNumber || "19AAACV4829N1Z5",
    panNumber: reviewingPartner?.kycDetails?.panNumber || "AAACV4829N",
    addressProofUrl:
      reviewingPartner?.kycDetails?.addressProofUrl ||
      "incorporation_certificate.pdf",
    bankName: reviewingPartner?.kycDetails?.bankName || "State Bank of India",
    accountNo: reviewingPartner?.kycDetails?.accountNo || "30291039871",
    ifscCode: reviewingPartner?.kycDetails?.ifscCode || "SBIN0000001",
    cancelledChequeUrl:
      reviewingPartner?.kycDetails?.cancelledChequeUrl ||
      "cancelled_cheque.pdf",
    authPersonName:
      reviewingPartner?.kycDetails?.authPersonName ||
      reviewingPartner?.partnerName ||
      "Managing Coordinator",
    authPersonEmail:
      reviewingPartner?.kycDetails?.authPersonEmail ||
      reviewingPartner?.email ||
      "",
    authPersonMobile:
      reviewingPartner?.kycDetails?.authPersonMobile ||
      reviewingPartner?.mobile ||
      "",
    authPersonDesignation:
      reviewingPartner?.kycDetails?.authPersonDesignation ||
      "Managing Director",
    authPersonIdUrl:
      reviewingPartner?.kycDetails?.authPersonIdUrl || "auth_identity.pdf",
    digitalAgreementUrl:
      reviewingPartner?.kycDetails?.digitalAgreementUrl ||
      "digital_escrow_agreement.pdf",
    undertakingChecked:
      reviewingPartner?.kycDetails?.undertakingChecked || true,
    agreementAcceptedDate:
      reviewingPartner?.kycDetails?.agreementAcceptedDate || "2026-06-10",
    adminRemarks: reviewingPartner?.kycDetails?.adminRemarks || "",
  });

  // Modal actions states
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState("Approve");
  const [remarks, setRemarks] = useState("");

  // Handle partner selection
  const handleSelectPartner = (p) => {
    setActiveReviewId(p.id);
    setCurrentStepperIdx(0);
    setFormFields({
      companyRegNo: p.kycDetails?.companyRegNo || "U40106WB2008`PTC123456",
      gstNumber: p.kycDetails?.gstNumber || "19AAACV4829N1Z5",
      panNumber: p.kycDetails?.panNumber || "AAACV4829N",
      addressProofUrl:
        p.kycDetails?.addressProofUrl || "incorporation_certificate.pdf",
      bankName: p.kycDetails?.bankName || "State Bank of India",
      accountNo: p.kycDetails?.accountNo || "30291039871",
      ifscCode: p.kycDetails?.ifscCode || "SBIN0000001",
      cancelledChequeUrl:
        p.kycDetails?.cancelledChequeUrl || "cancelled_cheque.pdf",
      authPersonName: p.kycDetails?.authPersonName || p.partnerName,
      authPersonEmail: p.kycDetails?.authPersonEmail || p.email,
      authPersonMobile: p.kycDetails?.authPersonMobile || p.mobile,
      authPersonDesignation: p.kycDetails?.authPersonDesignation || "Director",
      authPersonIdUrl: p.kycDetails?.authPersonIdUrl || "identity_pan.pdf",
      digitalAgreementUrl:
        p.kycDetails?.digitalAgreementUrl || "escrow_solar_agreement.pdf",
      undertakingChecked: p.kycDetails?.undertakingChecked || true,
      agreementAcceptedDate:
        p.kycDetails?.agreementAcceptedDate || "2026-06-10",
      adminRemarks: p.kycDetails?.adminRemarks || "",
    });
  };

  const handleSimulatedFileUpload = (fieldKey, fileName) => {
    setFormFields((prev) => ({
      ...prev,
      [fieldKey]: fileName,
    }));
  };

  const triggerReviewConfirmation = (action) => {
    setReviewAction(action);
    setRemarks(formFields.adminRemarks || "");
    setModalOpen(true);
  };

  const handleConfirmReview = () => {
    if (reviewingPartner) {
      const status = reviewAction === "Approve" ? "Approved" : "Rejected";
      const updated = {
        ...reviewingPartner,
        kycStatus: status,
        status: status === "Approved" ? "Active" : "Pending",
        agreementStatus: status === "Approved" ? "Signed" : "Pending",
        kycDetails: {
          ...(reviewingPartner.kycDetails || {
            companyRegNo: "",
            gstNumber: "",
            panNumber: "",
            addressProofUrl: "",
            bankName: "",
            accountNo: "",
            ifscCode: "",
            cancelledChequeUrl: "",
            authPersonName: "",
            authPersonEmail: "",
            authPersonMobile: "",
            authPersonDesignation: "",
            authPersonIdUrl: "",
            undertakingChecked: true,
          }),
          adminRemarks: remarks,
        },
      };
      onUpdatePartner(updated);
      setActiveReviewId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2 COLUMN GRID FOR REVIEW SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PENDING KYC LOGS LIST */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-primary font-display flex items-center gap-1.5">
              <FileCheck className="w-4.5 h-4.5 text-accent" />
              Incoming KYC Queue
            </h4>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-sm animate-pulse">
              {pendingKycList.length} Awaiting
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {pendingKycList.length > 0 ? (
              pendingKycList.map((p) => {
                const isSelected = p.id === reviewingPartner?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPartner(p)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "border-accent bg-[#22A06B]/5 shadow-xs"
                        : "border-gray-100 hover:border-gray-250"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-primary font-display block">
                        {p.partnerName}
                      </strong>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 rounded px-1.5 py-0.5 border border-gray-100">
                        {p.subscriptionPlan}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      {p.companyName}
                    </span>

                    <div className="flex items-center justify-between mt-3 text-[10px] font-medium font-mono text-gray-500 border-t border-gray-50/50 pt-2">
                      <span>Exp: {p.experience} Yrs</span>
                      <span>
                        Grid: {p.minKW} - {p.maxKW}kW
                      </span>
                      <span
                        className={`font-semibold uppercase ${p.kycStatus === "Rejected" ? "text-rose-600" : "text-amber-600"}`}
                      >
                        {p.kycStatus}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400 text-xs">
                All platform KYC registrations are fully verified! No pending
                applications.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED STEP-BASED ONBOARDING PANEL */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          {reviewingPartner ? (
            <div className="space-y-6">
              {/* Review Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-50">
                <div>
                  <h4 className="font-bold text-primary text-base font-display">
                    Review Onboarding: {reviewingPartner.partnerName}
                  </h4>
                  <span className="text-xs text-gray-400 font-semibold uppercase">
                    {reviewingPartner.companyName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-bold">
                    Class:
                  </span>
                  <StatusBadge status={reviewingPartner.status} />
                </div>
              </div>

              {/* STEPPER COMPONENT */}
              <Stepper
                steps={onboardingSteps}
                currentStep={currentStepperIdx}
              />

              {/* STAGE BOARD */}
              <div className="bg-slate-50/40 p-5 rounded-xl border border-gray-100 min-h-[280px]">
                {/* --- COMPANY DETAILS PANEL --- */}
                {currentStepperIdx === 0 && (
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wider text-accent">
                      <Building className="w-4 h-4" />
                      1. Company Registration & Taxation Credentials
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                      <div>
                        <label className="text-gray-400 block text-[10px]">
                          Company Reg Certificate *
                        </label>
                        <input
                          type="text"
                          value={formFields.companyRegNo}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              companyRegNo: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 font-mono mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 block text-[10px]">
                          GST Number *
                        </label>
                        <input
                          type="text"
                          value={formFields.gstNumber}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              gstNumber: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 font-mono mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 block text-[10px]">
                          PAN Number *
                        </label>
                        <input
                          type="text"
                          value={formFields.panNumber}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              panNumber: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 font-mono mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <UploadDocumentBox
                        label="Upload Company Reg Certificate"
                        category="Incorporation Certificate"
                        fileName={formFields.addressProofUrl}
                        onUploadSimulated={(name) =>
                          handleSimulatedFileUpload("addressProofUrl", name)
                        }
                      />

                      <div className="text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-100/50 flex flex-col justify-center">
                        <p className="font-bold text-primary mb-1 text-[11px]">
                          Acceptable address proof documents:
                        </p>
                        <p>· LLIN Certificate of Incorporation</p>
                        <p>
                          · Electricity/Utility Bill matching GST company
                          billing credentials
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- BANK DETAILS PANEL --- */}
                {currentStepperIdx === 1 && (
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wider text-accent">
                      <CreditCard className="w-4 h-4" />
                      2. Commercial Escrow Disbursement details
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                      <div>
                        <label className="text-gray-400 block text-[10px]">
                          Receiving Bank Name *
                        </label>
                        <input
                          type="text"
                          value={formFields.bankName}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              bankName: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 mt-1 whitespace-nowrap"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 block text-[10px]">
                          IFSC Code *
                        </label>
                        <input
                          type="text"
                          value={formFields.ifscCode}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              ifscCode: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 font-mono mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 block text-[10px]">
                          Disbursement Account Number *
                        </label>
                        <input
                          type="text"
                          value={formFields.accountNo}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              accountNo: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 font-mono mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <UploadDocumentBox
                        label="Upload Cancelled Cheque / Account Passbook"
                        category="Cancelled Cheque Copy"
                        fileName={formFields.cancelledChequeUrl}
                        onUploadSimulated={(name) =>
                          handleSimulatedFileUpload("cancelledChequeUrl", name)
                        }
                      />

                      <div className="text-xs text-rose-700 bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-start gap-2 max-w-md">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="font-bold">Strict Audit Requirement</p>
                          <p className="text-[11px] leading-relaxed mt-0.5">
                            Disbursement accounts must match registered
                            corporate billing name exactly. Payments will fail
                            in compliance stages if there is a mismatch.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- AUTHORIZED SIGNATORY --- */}
                {currentStepperIdx === 2 && (
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wider text-accent">
                      <User className="w-4 h-4" />
                      3. Authorized Project Coordinator Details
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-medium">
                      <div className="md:col-span-2">
                        <label className="text-gray-400 block text-[10px]">
                          Full Legal Name *
                        </label>
                        <input
                          type="text"
                          value={formFields.authPersonName}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              authPersonName: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 block text-[10px]">
                          Designation *
                        </label>
                        <input
                          type="text"
                          value={formFields.authPersonDesignation}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              authPersonDesignation: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 block text-[10px]">
                          Mobile *
                        </label>
                        <input
                          type="text"
                          value={formFields.authPersonMobile}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              authPersonMobile: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 mt-1 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <UploadDocumentBox
                        label="Upload Signed Power of Attorney Authorization Proof"
                        category="Identity Proof"
                        fileName={formFields.authPersonIdUrl}
                        onUploadSimulated={(name) =>
                          handleSimulatedFileUpload("authPersonIdUrl", name)
                        }
                      />

                      <div className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col justify-center text-xs text-gray-500">
                        <span className="font-bold text-primary block text-[11px]">
                          Required Verification Steps:
                        </span>
                        <p className="mt-1">
                          · Validate Identity proof details against PAN of
                          corporate director.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- AGREEMENT AND UNDERTAKING --- */}
                {currentStepperIdx === 3 && (
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wider text-accent">
                      <FileCheck className="w-4 h-4" />
                      4. Master execution agreement & legal liabilities
                    </h5>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-2">
                        <span className="text-[11px] font-bold text-primary block">
                          Platform E-Sign Agreement Draft
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          Acknowledge completion terms and statutory warranty on
                          workmanship.
                        </span>
                      </div>
                      <UploadDocumentBox
                        label="Upload Signed Master Agreement"
                        category="Digital Agreement E-Sign"
                        fileName={formFields.digitalAgreementUrl}
                        onUploadSimulated={(name) =>
                          handleSimulatedFileUpload("digitalAgreementUrl", name)
                        }
                      />
                    </div>

                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-slate-700/90">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formFields.undertakingChecked}
                          onChange={(e) =>
                            setFormFields({
                              ...formFields,
                              undertakingChecked: e.target.checked,
                            })
                          }
                          className="rounded text-[#F9B233] focus:ring-[#F9B233] mt-0.5 cursor-pointer"
                        />

                        <div>
                          <p className="text-[11px] text-primary font-bold">
                            Standard Platform Undertaking Compliance Checkbox *
                          </p>
                          <p className="leading-relaxed text-gray-500 mt-1">
                            We acknowledge that our field engineers must
                            strictly verify the earthing resistances and
                            lightning arrestor systems on residential bookings
                            prior to Net-meter commission requests.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* --- CHRONOLOGICAL ADMIN FINAL AUDIT --- */}
                {currentStepperIdx === 4 && (
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2 uppercase tracking-wider text-accent">
                      <ShieldCheck className="w-4 h-4" />
                      5. Final Operations verification & validation remarks
                    </h5>

                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                        <UserCheck className="w-6 h-6 text-accent" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-primary">
                          Verification Checklist Complete
                        </p>
                        <p className="text-gray-500 mt-0.5">
                          Documents uploaded: Incorporation Certificate,
                          Canceled Cheque, PAN Signatory copy, Executed SLA
                          agreement.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-primary font-display">
                        Optional Admin Remarks / Review Observations
                      </label>
                      <textarea
                        value={formFields.adminRemarks}
                        onChange={(e) =>
                          setFormFields({
                            ...formFields,
                            adminRemarks: e.target.value,
                          })
                        }
                        placeholder="Specify terms, required corrections, or compliance approvals here..."
                        className="w-full text-xs bg-white border border-gray-100 rounded-xl p-3.5 focus:outline-hidden focus:border-primary/20 min-h-[90px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                <button
                  type="button"
                  disabled={currentStepperIdx === 0}
                  onClick={() =>
                    setCurrentStepperIdx((prev) => Math.max(0, prev - 1))
                  }
                  className="px-4 py-2 text-xs font-semibold text-primary border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  &larr; Back
                </button>

                <div className="flex gap-2">
                  {currentStepperIdx < onboardingSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStepperIdx((prev) => prev + 1)}
                      className="px-5 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-[#113143] cursor-pointer"
                    >
                      Next Step &rarr;
                    </button>
                  ) : (
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => triggerReviewConfirmation("Reject")}
                        className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 cursor-pointer shadow-xs"
                      >
                        Reject KYC
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerReviewConfirmation("Approve")}
                        className="px-5 py-2 text-xs font-bold bg-[#22A06B] text-white rounded-xl hover:bg-[#198154] cursor-pointer shadow-xs"
                      >
                        Approve EPC Partner
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Incoming Verification Completed"
              description="Pick active pending partners from the queue list panel to inspect corporate documents."
            />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmReview}
        title={
          reviewAction === "Approve"
            ? "Approve EPC Partner Access"
            : "Reject Partner KYC"
        }
        message={
          reviewAction === "Approve"
            ? `Are you sure you want to approve ${reviewingPartner?.partnerName}? This will instantly dispatch their activation emails, grant billing rights, enable priority bid pools, and register their available crews.`
            : `Are you sure you want to reject this KYC? The coordinator will be notified to re-upload files or verify registration metrics.`
        }
        confirmText={
          reviewAction === "Approve" ? "Approve Register" : "Confirm Reject"
        }
        type={reviewAction === "Approve" ? "success" : "danger"}
      />
    </div>
  );
};
