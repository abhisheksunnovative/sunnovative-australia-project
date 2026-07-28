/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Star,
  StarHalf,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
  FileText,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const StatCard = ({
  id,
  title,
  value,
  icon,
  trend,
  subtitle,
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 ${onClick ? "cursor-pointer hover:border-primary/20" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-500 font-medium text-sm tracking-tight">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-gray-50 text-primary">{icon}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-primary font-display">
          {value}
        </h3>
        {(trend || subtitle) && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
              >
                {trend.value}
              </span>
            )}
            <span className="text-xs text-gray-400 font-light truncate">
              {subtitle || (trend?.isPositive ? "vs last month" : "decrease")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const StatusBadge = ({ id, status }) => {
  let bgClass = "bg-gray-100 text-gray-700";
  const normalized = status.toLowerCase();

  if (
    [
      "active",
      "approved",
      "completed",
      "signed",
      "available",
      "in stock",
    ].includes(normalized)
  ) {
    bgClass = "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
  } else if (
    [
      "pending",
      "in progress",
      "assigned",
      "installation scheduled",
      "low stock",
    ].includes(normalized)
  ) {
    bgClass = "bg-amber-50 text-amber-700 border border-amber-200/50";
  } else if (
    [
      "suspended",
      "rejected",
      "expired",
      "cancelled",
      "inactive",
      "on leave",
      "out of stock",
    ].includes(normalized)
  ) {
    bgClass = "bg-rose-50 text-rose-700 border border-rose-200/50";
  } else if (
    ["not submitted", "not sent", "new", "on field"].includes(normalized)
  ) {
    bgClass = "bg-blue-50 text-blue-700 border border-blue-200/50";
  }

  return (
    <span
      id={id}
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${bgClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block animate-pulse"></span>
      {status}
    </span>
  );
};

export const RatingStars = ({ rating, id }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div id={id} className="flex items-center gap-0.5 text-secondary">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-current text-amber-400"
        />
      ))}
      {hasHalf && <StarHalf className="w-4 h-4 fill-current text-amber-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-200" />
      ))}
      <span className="text-xs text-gray-500 font-medium ml-1">({rating})</span>
    </div>
  );
};

export const ToggleSwitch = ({ checked, onChange, id, disabled }) => {
  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${checked ? "bg-accent" : "bg-gray-200"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
};

export const Stepper = ({ steps, currentStep, id }) => {
  return (
    <div id={id} className="w-full py-2">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            {/* Step bubble */}
            <div className="flex flex-col items-center flex-1 relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-colors duration-300 border-2 ${
                  idx < currentStep
                    ? "bg-accent border-accent text-white"
                    : idx === currentStep
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center hidden md:block max-w-[120px] ${
                  idx === currentStep
                    ? "text-primary font-bold"
                    : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>

            {/* Step line connector */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 relative -translate-y-4 md:-translate-y-2 select-none">
                <div
                  className="absolute left-0 top-0 h-full bg-accent transition-all duration-500"
                  style={{ width: idx < currentStep ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const EmptyState = ({ title, description, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="p-4 bg-gray-50 text-gray-400 rounded-full mb-4">
        <HelpCircle className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-primary font-display">
        {title}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionButton}
    </div>
  );
};

export const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  id,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  if (totalPages <= 1) return null;

  return (
    <div
      id={id}
      className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white"
    >
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-primary">
              {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-primary">
              {Math.min(totalItems, currentPage * itemsPerPage)}
            </span>{" "}
            of <span className="font-semibold text-primary">{totalItems}</span>{" "}
            results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-xs"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 disabled:opacity-40 cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              &larr;
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNumber = idx + 1;
              const isCurrent = pageNumber === currentPage;
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-3.5 py-2 text-xs font-semibold ring-1 ring-inset ring-gray-250 cursor-pointer ${
                    isCurrent
                      ? "z-10 bg-primary text-white focus-visible:outline-2"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 disabled:opacity-40 cursor-pointer"
            >
              <span className="sr-only">Next</span>
              &rarr;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  type = "warning",
}) => {
  if (!isOpen) return null;

  let ThemeColor = "bg-amber-600 hover:bg-amber-700";
  let Icon = <AlertTriangle className="w-6 h-6 text-amber-600" />;
  let IconBg = "bg-amber-50";

  if (type === "danger") {
    ThemeColor = "bg-rose-600 hover:bg-rose-700";
    Icon = <AlertTriangle className="w-6 h-6 text-rose-600" />;
    IconBg = "bg-rose-50";
  } else if (type === "success") {
    ThemeColor = "bg-emerald-600 hover:bg-emerald-700";
    Icon = <Check className="w-6 h-6 text-emerald-600" />;
    IconBg = "bg-emerald-50";
  } else if (type === "info") {
    ThemeColor = "bg-blue-600 hover:bg-blue-700";
    Icon = <FileText className="w-6 h-6 text-blue-600" />;
    IconBg = "bg-blue-50";
  }

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500/75 transition-opacity"
          onClick={onClose}
        />
        {/* trick mock alignment */}
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${IconBg} sm:mx-0 sm:h-10 sm:w-10`}
              >
                {Icon}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-bold font-display text-primary leading-6">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto cursor-pointer ${ThemeColor}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DetailDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />

          <div className="pointer-events-none absolute inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="pointer-events-auto w-screen max-w-3xl transform shadow-2xl"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                {/* Drawer Header */}
                <div className="bg-primary px-6 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h2 className="text-xl font-bold text-white font-display">
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="mt-1 text-sm text-sky-100">{subtitle}</p>
                      )}
                    </div>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="rounded-md text-sky-200 hover:text-white focus:outline-hidden cursor-pointer"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close drawer</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Drawer Body */}
                <div className="relative flex-1 py-6 px-6 sm:px-8">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const UploadDocumentBox = ({
  label,
  category,
  fileName,
  onUploadSimulated,
  id,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const triggerUpload = () => {
    const randomNames = [
      `${category.toLowerCase().replace(/\s+/g, "_")}_verified.pdf`,
      `approved_registration_${Math.floor(Math.random() * 900 + 100)}.pdf`,
      "audit_compliance_cert.pdf",
      "esign_agreement_final.pdf",
    ];
    const chosenName =
      randomNames[Math.floor(Math.random() * randomNames.length)];
    onUploadSimulated(chosenName);
  };

  const fileInputRef = React.useRef(null);

  return (
    <div
      id={id}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        triggerUpload();
      }}
      className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
        fileName
          ? "border-emerald-300 bg-emerald-50/20"
          : isDragOver
            ? "border-accent bg-accent/5"
            : "border-gray-200 hover:border-accent hover:bg-gray-50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onUploadSimulated(e.target.files[0].name);
          }
        }}
      />

      {fileName ? (
        <div className="flex flex-col items-center">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full mb-2">
            <Check className="w-5 h-5 animate-bounce" />
          </div>
          <span
            className="text-xs font-semibold text-primary block truncate max-w-[200px]"
            title={fileName}
          >
            {fileName}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium tracking-wide mt-0.5">
            CATEGORY: {category}
          </span>
          <button
            type="button"
            onClick={triggerUpload}
            className="text-[11px] font-semibold text-accent hover:underline mt-2 cursor-pointer"
          >
            Re-upload File
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-2 bg-gray-50 text-gray-500 rounded-full mb-2">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary">{label}</span>
          <span className="text-[10px] text-gray-400 mt-0.5">
            Drag & drop or click to browse
          </span>
        </div>
      )}
    </div>
  );
};
