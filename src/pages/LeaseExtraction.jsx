import { useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  CloudUpload,
  Download,
  FileText,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import SectionHeader from "../components/shared/SectionHeader";
import {
  approveLeaseApi,
  generateGlWorkbookApi,
  uploadFileApi,
} from "../api/api";

const emptyLease = {
  premises: "",
  landlord: "",
  tenant: "",
  commencement_date: "",
  effective_date: "",
  term_months: 0,
  discount_rate: 0,
  payment_schedule: [],
  review_reason: "",
};

const emptyPaymentPeriod = {
  start_month: 0,
  end_month: 0,
  monthly_payment: 0,
  notes: "",
};

const defaultGlConfiguration = {
  rou_asset_account: "1705 - Right of Use Asset",
  lease_expense_account: "6400 - Lease Expense",
  lt_lease_liability_account: "2320 - Long Term Lease Liability",
  st_lease_liability_account: "2310 - Short Term Lease Liability",
  description:
    "Monthly lease amortization adjustment for approved clinic lease schedules.",
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";

  const units = ["bytes", "KB", "MB", "GB"];
  const sizeIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const size = bytes / 1024 ** sizeIndex;

  return `${size.toFixed(sizeIndex === 0 ? 0 : 1)} ${units[sizeIndex]}`;
};

const findLeaseId = (response) =>
  response?.lease_id ||
  response?.id ||
  response?.lease?.id ||
  response?.draft?.lease_id ||
  response?.data?.lease_id ||
  response?.data?.id ||
  "";

const normalizeLease = (source) => {
  const lease =
    source?.lease ||
    source?.draft?.lease ||
    source?.data?.lease ||
    source?.data ||
    source;

  return {
    premises: lease?.premises || "",
    landlord: lease?.landlord || "",
    tenant: lease?.tenant || "",
    commencement_date: lease?.commencement_date || "",
    effective_date: lease?.effective_date || "",
    term_months: Number(lease?.term_months || 0),
    discount_rate: Number(lease?.discount_rate || 0),
    payment_schedule: Array.isArray(lease?.payment_schedule)
      ? lease.payment_schedule.map(normalizePaymentPeriod)
      : [],
    review_reason: lease?.review_reason || "",
  };
};

const normalizePaymentPeriod = (period = {}) => ({
  start_month: Number(period?.start_month || 0),
  end_month: Number(period?.end_month || 0),
  monthly_payment: Number(period?.monthly_payment || 0),
  notes: period?.notes || "",
});

const normalizeApprovalLease = (source) => {
  const lease = normalizeLease(source);

  return {
    premises: lease.premises,
    landlord: lease.landlord,
    tenant: lease.tenant,
    commencement_date: lease.commencement_date,
    effective_date: lease.effective_date,
    term_months: lease.term_months,
    discount_rate: lease.discount_rate,
    payment_schedule: lease.payment_schedule,
  };
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function LeaseExtraction() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [leaseId, setLeaseId] = useState("");
  const [lease, setLease] = useState(emptyLease);
  const [glConfiguration, setGlConfiguration] = useState(
    defaultGlConfiguration,
  );
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [draftStatus, setDraftStatus] = useState("idle");
  const [approvalStatus, setApprovalStatus] = useState("idle");
  const [glStatus, setGlStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [approvalResponse, setApprovalResponse] = useState(null);
  const [glResponse, setGlResponse] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");

  const canApprove =
    Boolean(leaseId) &&
    draftStatus === "complete" &&
    approvalStatus !== "loading";
  const canGenerateGl =
    Boolean(leaseId) && approvalResponse && glStatus !== "loading";

  const activeStage = useMemo(() => {
    if (approvalResponse) return "download";
    if (draftStatus === "complete") return "review";
    return "upload";
  }, [approvalResponse, draftStatus]);

  const workflowSummary = useMemo(
    () => [
      { label: "Upload Lease", status: uploadStatus },
      { label: "Draft Review", status: draftStatus },
      { label: "Approve Lease", status: approvalStatus },
      { label: "Download", status: glStatus },
    ],
    [approvalStatus, draftStatus, glStatus, uploadStatus],
  );

  const handleFileSelect = async (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage("Please select a PDF lease contract.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    setUploadStatus("loading");
    setDraftStatus("idle");
    setApprovalStatus("idle");
    setGlStatus("idle");
    setApprovalResponse(null);
    setGlResponse(null);
    setLease(emptyLease);

    try {
      const response = await uploadFileApi(file);
      const extractedLeaseId = findLeaseId(response);

      if (response?.status?.toLowerCase() === "approved") {
        setPopupMessage("This contract is already approved.");
      }

      setLeaseId(extractedLeaseId);
      setLease(normalizeLease(response));
      setGlConfiguration({
        ...defaultGlConfiguration,
        ...(response?.gl_configuration ||
          response?.lease?.gl_configuration ||
          response?.data?.gl_configuration ||
          {}),
      });
      setUploadStatus("complete");

      if (extractedLeaseId) {
        setDraftStatus("complete");
      } else {
        setDraftStatus("failed");
        setErrorMessage("Lease extracted, but Lease ID was not returned.");
      }
    } catch (error) {
      setUploadStatus("failed");
      setErrorMessage(
        error?.response?.data?.detail || "Upload failed. Please try again.",
      );
    }
  };

  const handleLeaseChange = (field, value) => {
    setLease((current) => ({
      ...current,
      [field]:
        field === "term_months"
          ? Number(value)
          : field === "discount_rate"
            ? Number(value)
            : value,
    }));
  };

  const handlePaymentPeriodChange = (index, field, value) => {
    const numericFields = new Set(["start_month", "end_month", "monthly_payment"]);

    setLease((current) => ({
      ...current,
      payment_schedule: current.payment_schedule.map((period, periodIndex) =>
        periodIndex === index
          ? {
              ...period,
              [field]: numericFields.has(field) ? Number(value) : value,
            }
          : period,
      ),
    }));
  };

  const handleAddPaymentPeriod = () => {
    setLease((current) => ({
      ...current,
      payment_schedule: [...current.payment_schedule, emptyPaymentPeriod],
    }));
  };

  const handleRemovePaymentPeriod = (index) => {
    setLease((current) => ({
      ...current,
      payment_schedule: current.payment_schedule.filter(
        (_, periodIndex) => periodIndex !== index,
      ),
    }));
  };

  const handleGlChange = (field, value) => {
    setGlConfiguration((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleApproveLease = async () => {
    if (!leaseId) {
      setErrorMessage("Lease ID is required before approval.");
      return;
    }

    setErrorMessage("");
    setApprovalStatus("loading");

    try {
      const response = await approveLeaseApi(leaseId, {
        lease: normalizeApprovalLease(lease),
        gl_configuration: glConfiguration,
      });

      setApprovalResponse(response);
      setApprovalStatus("complete");
    } catch (error) {
      setApprovalStatus("failed");
      setErrorMessage(
        error?.response?.data?.detail ||
          "Lease approval failed. Please try again.",
      );
    }
  };

  const handleGenerateGl = async () => {
    if (!leaseId) {
      setErrorMessage("Lease ID is required to generate GL workbook.");
      return;
    }

    setErrorMessage("");
    setGlStatus("loading");

    try {
      const response = await generateGlWorkbookApi(leaseId);

      downloadBlob(response.blob, response.fileName);
      setGlResponse(response);
      setGlStatus("complete");
    } catch (error) {
      setGlStatus("failed");
      setErrorMessage(
        error?.response?.data?.detail || "GL workbook generation failed.",
      );
    }
  };

  return (
    <div className="page-stack">
      <section className="workflow-strip api-stepper">
        {workflowSummary.map((step, index) => (
          <div
            className={`workflow-step ${stepState(step.status)}`}
            key={step.label}
          >
            <span>{index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              <small>{statusLabel(step.status)}</small>
            </div>
          </div>
        ))}
      </section>

      <section className="surface upload-surface">
        <SectionHeader
          title={stageTitle(activeStage)}
          detail={stageDetail(activeStage)}
          icon={stageIcon(activeStage)}
        />

        {activeStage === "upload" && (
          <UploadPanel
            errorMessage={errorMessage}
            fileInputRef={fileInputRef}
            selectedFile={selectedFile}
            uploadStatus={uploadStatus}
            onFileSelect={handleFileSelect}
          />
        )}

        {activeStage === "review" && (
          <DraftReviewPanel
            canApprove={canApprove}
            errorMessage={errorMessage}
            glConfiguration={glConfiguration}
            lease={lease}
            approvalStatus={approvalStatus}
            onApprove={handleApproveLease}
            onGlChange={handleGlChange}
            onLeaseChange={handleLeaseChange}
            onPaymentPeriodChange={handlePaymentPeriodChange}
            onAddPaymentPeriod={handleAddPaymentPeriod}
            onRemovePaymentPeriod={handleRemovePaymentPeriod}
          />
        )}

        {activeStage === "download" && (
          <DownloadPanel
            canGenerateGl={canGenerateGl}
            errorMessage={errorMessage}
            glResponse={glResponse}
            glStatus={glStatus}
            onGenerateGl={handleGenerateGl}
          />
        )}
      </section>

      {popupMessage && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approved-contract-title"
          >
            <div className="dropzone-icon">
              <BadgeCheck size={32} />
            </div>
            <h2 id="approved-contract-title">Contract Already Approved</h2>
            <p>{popupMessage}</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => setPopupMessage("")}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadPanel({
  errorMessage,
  fileInputRef,
  selectedFile,
  uploadStatus,
  onFileSelect,
}) {
  return (
    <div
      className="dropzone"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFileSelect(event.dataTransfer.files?.[0]);
      }}
    >
      <div className="dropzone-icon">
        <CloudUpload size={34} />
      </div>
      <h2>Drop lease agreement here</h2>
      <p>PDF lease contracts from SharePoint lease folders.</p>
      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => onFileSelect(event.target.files?.[0])}
      />
      <button
        className="primary-button"
        type="button"
        disabled={uploadStatus === "loading"}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadStatus === "loading" ? "Uploading..." : "Choose File"}
        <FileText size={18} />
      </button>
      {selectedFile && (
        <div className="selected-file">
          <FileText size={18} />
          <div>
            <strong>{selectedFile.name}</strong>
            <span>{formatFileSize(selectedFile.size)}</span>
          </div>
        </div>
      )}
      {errorMessage && <p className="upload-error">{errorMessage}</p>}
    </div>
  );
}

function DraftReviewPanel({
  canApprove,
  errorMessage,
  glConfiguration,
  lease,
  approvalStatus,
  onApprove,
  onGlChange,
  onLeaseChange,
  onPaymentPeriodChange,
  onAddPaymentPeriod,
  onRemovePaymentPeriod,
}) {
  return (
    <div className="review-workspace">
      <div className="form-grid">
        <EditableField
          label="Premises"
          value={lease.premises}
          onChange={(value) => onLeaseChange("premises", value)}
        />
        <EditableField
          label="Landlord"
          value={lease.landlord || ""}
          onChange={(value) => onLeaseChange("landlord", value)}
        />
        <EditableField
          label="Tenant"
          value={lease.tenant || ""}
          onChange={(value) => onLeaseChange("tenant", value)}
        />
        <EditableField
          label="Commencement Date"
          type="date"
          value={lease.commencement_date}
          onChange={(value) => onLeaseChange("commencement_date", value)}
        />
        <EditableField
          label="Effective Date"
          type="date"
          value={lease.effective_date || ""}
          onChange={(value) => onLeaseChange("effective_date", value)}
        />
        <EditableField
          label="Term Months"
          type="number"
          value={lease.term_months}
          onChange={(value) => onLeaseChange("term_months", value)}
        />
        <EditableField
          label="Discount Rate"
          type="number"
          value={lease.discount_rate}
          onChange={(value) => onLeaseChange("discount_rate", value)}
        />
        <EditableField
          as="textarea"
          className="full-width"
          label="Review Reason"
          value={lease.review_reason || ""}
          readOnly
        />
      </div>

      <div className="payment-schedule-panel">
        <div className="panel-title-row">
          <h2>Payment Schedule</h2>
          <button
            className="secondary-button compact-button"
            type="button"
            onClick={onAddPaymentPeriod}
          >
            Add Period
            <Plus size={16} />
          </button>
        </div>
        {lease.payment_schedule.length ? (
          <div className="payment-period-list">
            {lease.payment_schedule.map((period, index) => (
              <section
                className="payment-period-card"
                key={`${period.start_month}-${period.end_month}-${index}`}
              >
                <div className="payment-period-header">
                  <div>
                    <strong>Period {index + 1}</strong>
                    <span>
                      Months {period.start_month ?? 0} -{" "}
                      {period.end_month ?? 0}
                    </span>
                  </div>
                  <button
                    className="icon-button danger-button"
                    type="button"
                    aria-label="Remove payment period"
                    onClick={() => onRemovePaymentPeriod(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="payment-period-grid">
                  <EditableField
                    label="Start Month"
                    type="number"
                    value={period.start_month ?? 0}
                    onChange={(value) =>
                      onPaymentPeriodChange(index, "start_month", value)
                    }
                  />
                  <EditableField
                    label="End Month"
                    type="number"
                    value={period.end_month ?? 0}
                    onChange={(value) =>
                      onPaymentPeriodChange(index, "end_month", value)
                    }
                  />
                  <EditableField
                    label="Monthly Payment"
                    type="number"
                    value={period.monthly_payment ?? 0}
                    onChange={(value) =>
                      onPaymentPeriodChange(index, "monthly_payment", value)
                    }
                  />
                  <EditableField
                    as="textarea"
                    className="full-width"
                    label="Notes"
                    value={period.notes || ""}
                    onChange={(value) =>
                      onPaymentPeriodChange(index, "notes", value)
                    }
                  />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="empty-payment-state">No payment schedule found.</div>
        )}
      </div>

      <div className="account-grid">
        <EditableField
          label="ROU Asset Account"
          value={glConfiguration.rou_asset_account}
          onChange={(value) => onGlChange("rou_asset_account", value)}
          placeholder="19-1740-01"
        />
        <EditableField
          label="Lease Expense Account"
          value={glConfiguration.lease_expense_account}
          onChange={(value) => onGlChange("lease_expense_account", value)}
          placeholder="19-6450-11-412"
        />
        <EditableField
          label="LT Lease Liability Account"
          value={glConfiguration.lt_lease_liability_account}
          onChange={(value) => onGlChange("lt_lease_liability_account", value)}
          placeholder="19-2812-01"
        />
        <EditableField
          label="ST Lease Liability Account"
          value={glConfiguration.st_lease_liability_account}
          onChange={(value) => onGlChange("st_lease_liability_account", value)}
          placeholder="19-2675-02"
        />
        <EditableField
          as="textarea"
          className="full-width"
          label="Description"
          value={glConfiguration.description}
          onChange={(value) => onGlChange("description", value)}
          placeholder="Lease Adjustments APC"
        />
      </div>

      {errorMessage && <p className="upload-error">{errorMessage}</p>}

      <div className="action-row">
        <button
          className="primary-button"
          type="button"
          disabled={!canApprove}
          onClick={onApprove}
        >
          {approvalStatus === "loading" ? "Approving..." : "Approve Lease"}
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function DownloadPanel({
  canGenerateGl,
  errorMessage,
  glResponse,
  glStatus,
  onGenerateGl,
}) {
  const isGenerating = glStatus === "loading";

  return (
    <div className="download-workspace">
      <div className="download-card">
        {isGenerating ? (
          <div className="loader-ring" aria-label="Generating GL workbook" />
        ) : (
          <div className="dropzone-icon">
            <BadgeCheck size={34} />
          </div>
        )}
        <h2>{isGenerating ? "Generating GL workbook" : "Lease approved"}</h2>
        <p>
          {isGenerating
            ? "Please wait while the workbook is prepared."
            : `Generate the GL workbook.`}
        </p>
        <button
          className="primary-button"
          type="button"
          disabled={!canGenerateGl}
          onClick={onGenerateGl}
        >
          {isGenerating ? "Generating..." : "Generate and Download"}
          <Download size={18} />
        </button>
      </div>
      {glStatus === "complete" && (
        <div className="selected-file">
          <FileText size={18} />
          <div>
            <strong>GL workbook generated</strong>
            <span>{glResponse?.fileName || "master_gl_workbook.xlsx"}</span>
          </div>
        </div>
      )}
      {errorMessage && <p className="upload-error">{errorMessage}</p>}
    </div>
  );
}

function EditableField({
  as = "input",
  className = "",
  label,
  onChange,
  readOnly = false,
  type = "text",
  value,
  placeholder = "",
}) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      {as === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}
    </label>
  );
}

function stageTitle(stage) {
  if (stage === "review") return "Draft Review";
  if (stage === "download") return "Generate GL Workbook";
  return "Upload Lease Contract";
}

function stageDetail(stage) {
  if (stage === "review")
    return "Review extracted lease data, adjust fields, and approve the lease.";
  if (stage === "download")
    return "Generate the final GL workbook after approval.";
  return "Upload a PDF lease contract to start the automation workflow.";
}

function stageIcon(stage) {
  if (stage === "review") return RefreshCw;
  if (stage === "download") return Download;
  return Upload;
}

function statusLabel(status) {
  if (status === "loading") return "Running";
  if (status === "complete") return "Complete";
  if (status === "failed") return "Failed";
  return "Waiting";
}

function stepState(status) {
  if (status === "loading") return "active";
  if (status === "complete") return "complete";
  if (status === "failed") return "failed";
  return "waiting";
}

export default LeaseExtraction;
