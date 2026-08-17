"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  FileClock,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  X,
} from "lucide-react";

import {
  isAdministratorRole,
  isPhysicianRole,
  useStaffSession,
} from "@/components/StaffSessionProvider";

import {
  useLanguage,
} from "@/components/i18n/LanguageProvider";

import {
  diagnosisCodeSystemLabel,
  diagnosisLocale,
  diagnosisStatusLabel,
  diagnosisText,
  diagnosisTypeLabel,
  type DiagnosisCodeSystem,
  type DiagnosisLanguage,
  type DiagnosisStatus,
  type DiagnosisType,
} from "@/lib/i18n/diagnoses";

import {
  supabase,
} from "@/lib/supabase/client";


type DiagnosisRecord = {
  id: number;
  resident_id: number;
  resident_name: string;
  diagnosis_name: string;
  code_system: DiagnosisCodeSystem;
  diagnosis_code: string | null;
  diagnosis_type: DiagnosisType;
  status: DiagnosisStatus;
  onset_date: string | null;
  resolution_date: string | null;
  diagnosed_by: string | null;
  source: string | null;
  clinical_notes: string | null;
  revision_number: number;
  created_by: string;
  created_by_role: string | null;
  created_at: string;
  updated_by: string | null;
  updated_by_role: string | null;
  updated_at: string;
};


type DiagnosisHistoryRecord = {
  id: number;
  diagnosis_id: number;
  resident_id: number;
  action: string;
  previous_snapshot: Record<string, unknown> | null;
  new_snapshot: Record<string, unknown> | null;
  changed_by: string;
  changed_by_role: string | null;
  change_note: string | null;
  changed_at: string;
};


type Props = {
  residentId: number;
  residentName: string;
};


type DiagnosisForm = {
  diagnosisName: string;
  codeSystem: DiagnosisCodeSystem;
  diagnosisCode: string;
  diagnosisType: DiagnosisType;
  status: DiagnosisStatus;
  onsetDate: string;
  resolutionDate: string;
  diagnosedBy: string;
  source: string;
  clinicalNotes: string;
};


function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function formatDate(
  value: string | null | undefined,
  language: DiagnosisLanguage
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    diagnosisLocale(language),
    {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }
  ).format(date);
}


function formatDateTime(
  value: string | null | undefined,
  language: DiagnosisLanguage
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    diagnosisLocale(language),
    {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}


function errorMessage(
  value: unknown,
  language: DiagnosisLanguage
) {
  if (value instanceof Error) {
    return value.message;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    return (
      cleanText(record.message) ||
      cleanText(record.details) ||
      diagnosisText(
        language,
        "The diagnosis record could not be saved."
      )
    );
  }

  return diagnosisText(
    language,
    "The diagnosis record could not be saved."
  );
}


function emptyForm(
  diagnosedBy = ""
): DiagnosisForm {
  return {
    diagnosisName: "",
    codeSystem: "ICD-10",
    diagnosisCode: "",
    diagnosisType: "Secondary",
    status: "Active",
    onsetDate: "",
    resolutionDate: "",
    diagnosedBy,
    source: "",
    clinicalNotes: "",
  };
}


function formFromRecord(
  record: DiagnosisRecord
): DiagnosisForm {
  return {
    diagnosisName: record.diagnosis_name,
    codeSystem: record.code_system,
    diagnosisCode: record.diagnosis_code ?? "",
    diagnosisType: record.diagnosis_type,
    status: record.status,
    onsetDate: record.onset_date ?? "",
    resolutionDate: record.resolution_date ?? "",
    diagnosedBy: record.diagnosed_by ?? "",
    source: record.source ?? "",
    clinicalNotes: record.clinical_notes ?? "",
  };
}


function statusClass(status: DiagnosisStatus) {
  return status === "Resolved"
    ? "font-bold text-[#617169]"
    : "font-bold text-[#1D6550]";
}


export default function ResidentDiagnosesTab({
  residentId,
  residentName,
}: Props) {
  const { language } = useLanguage();
  const { staff, status: staffStatus } = useStaffSession();

  const canManage =
    isAdministratorRole(staff?.role) ||
    isPhysicianRole(staff?.role);

  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [editing, setEditing] = useState<DiagnosisRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<DiagnosisRecord | null>(null);
  const [historyRecord, setHistoryRecord] = useState<DiagnosisRecord | null>(null);
  const [history, setHistory] = useState<DiagnosisHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statusRecord, setStatusRecord] = useState<DiagnosisRecord | null>(null);
  const [statusAction, setStatusAction] = useState<"resolve" | "reactivate" | null>(null);

  const loadRecords = useCallback(
    async (quiet = false) => {
      quiet ? setRefreshing(true) : setLoading(true);
      setError("");

      try {
        const { data, error: loadError } = await supabase
          .from("resident_diagnoses")
          .select("*")
          .eq("resident_id", residentId)
          .order("status", { ascending: true })
          .order("diagnosis_type", { ascending: true })
          .order("updated_at", { ascending: false });

        if (loadError) {
          throw loadError;
        }

        setRecords((data ?? []) as DiagnosisRecord[]);
      } catch (caughtError) {
        setError(errorMessage(caughtError, language));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [residentId, language]
  );

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        record.diagnosis_type === typeFilter;

      const matchesSearch =
        !query ||
        [
          record.diagnosis_name,
          record.diagnosis_code,
          record.code_system,
          record.diagnosed_by,
          record.source,
          record.clinical_notes,
        ].some((value) =>
          cleanText(value).toLowerCase().includes(query)
        );

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [records, search, statusFilter, typeFilter]);

  const activeCount = records.filter(
    (record) => record.status === "Active"
  ).length;

  const primaryCount = records.filter(
    (record) =>
      record.status === "Active" &&
      record.diagnosis_type === "Primary"
  ).length;

  const resolvedCount = records.filter(
    (record) => record.status === "Resolved"
  ).length;

  function openNew() {
    if (!canManage) {
      return;
    }

    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(record: DiagnosisRecord) {
    if (!canManage) {
      return;
    }

    setEditing(record);
    setFormOpen(true);
  }

  async function openHistory(record: DiagnosisRecord) {
    setHistoryRecord(record);
    setHistory([]);
    setHistoryLoading(true);

    const { data, error: historyError } = await supabase
      .from("resident_diagnosis_history")
      .select("*")
      .eq("diagnosis_id", record.id)
      .order("changed_at", { ascending: false });

    if (!historyError) {
      setHistory((data ?? []) as DiagnosisHistoryRecord[]);
    }

    setHistoryLoading(false);
  }

  function action(record: DiagnosisRecord, value: string) {
    if (value === "view") {
      setViewing(record);
    }

    if (value === "edit") {
      openEdit(record);
    }

    if (value === "resolve" && canManage) {
      setStatusRecord(record);
      setStatusAction("resolve");
    }

    if (value === "reactivate" && canManage) {
      setStatusRecord(record);
      setStatusAction("reactivate");
    }

    if (value === "history") {
      void openHistory(record);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-white">
        <LoaderCircle
          size={20}
          className="animate-spin text-[#073B2F]"
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white">
        <div className="border-b border-[#71845E] bg-[#8FA47A] px-2 py-1 text-[11px] font-bold text-white">
          {diagnosisText(language, "Medical Diagnoses")}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#BCC8C1] bg-[#F1F2ED] px-2 py-1.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {canManage && (
              <button
                type="button"
                onClick={openNew}
                className="inline-flex h-7 items-center gap-1 border border-[#687B5B] bg-white px-2.5 text-[10px] font-bold text-[#283D33]"
              >
                <Plus size={11} />
                {diagnosisText(language, "New Diagnosis")}
              </button>
            )}

            <div className="relative min-w-[220px] flex-1 sm:max-w-[420px]">
              <Search
                size={11}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[#65766E]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={diagnosisText(language, "Search diagnoses...")}
                className="h-7 w-full border border-[#B7C2BC] bg-white pl-7 pr-2 text-[10px] outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-7 border border-[#B7C2BC] bg-white px-2 text-[10px]"
            >
              <option value="All">
                {diagnosisText(language, "All Statuses")}
              </option>
              <option value="Active">
                {diagnosisStatusLabel(language, "Active")}
              </option>
              <option value="Resolved">
                {diagnosisStatusLabel(language, "Resolved")}
              </option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-7 border border-[#B7C2BC] bg-white px-2 text-[10px]"
            >
              <option value="All">
                {diagnosisText(language, "All Types")}
              </option>
              <option value="Primary">
                {diagnosisTypeLabel(language, "Primary")}
              </option>
              <option value="Secondary">
                {diagnosisTypeLabel(language, "Secondary")}
              </option>
            </select>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => void loadRecords(true)}
            className="inline-flex h-7 items-center gap-1 border border-[#687B5B] bg-white px-2.5 text-[10px] font-bold text-[#283D33] disabled:opacity-50"
          >
            <RefreshCw
              size={10}
              className={refreshing ? "animate-spin" : ""}
            />
            {diagnosisText(language, "Refresh")}
          </button>
        </div>

        <div className="grid border-b border-[#D4DDD8] bg-[#FAFAF7] sm:grid-cols-3">
          <Summary
            label={diagnosisText(language, "Active Diagnoses")}
            value={activeCount}
          />
          <Summary
            label={diagnosisText(language, "Primary Diagnosis")}
            value={primaryCount}
          />
          <Summary
            label={diagnosisText(language, "Resolved Diagnoses")}
            value={resolvedCount}
          />
        </div>

        {staffStatus === "authenticated" && !canManage && (
          <div className="flex items-start gap-2 border-b border-[#D6DED9] bg-[#F6F7F3] px-3 py-2 text-[10px] text-[#55675F]">
            <AlertTriangle
              size={12}
              className="mt-0.5 shrink-0 text-amber-600"
            />
            <span>
              {diagnosisText(
                language,
                "Nurses have read-only access to the diagnosis record."
              )}
            </span>
          </div>
        )}

        {staffStatus === "error" && (
          <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {diagnosisText(
              language,
              "Current staff access could not be verified."
            )}
          </div>
        )}

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="bg-[#E5EEF4] text-[9px] font-bold text-[#263A31]">
                  <Head>{diagnosisText(language, "Actions")}</Head>
                  <Head>{diagnosisText(language, "Diagnosis")}</Head>
                  <Head>{diagnosisText(language, "Code")}</Head>
                  <Head>{diagnosisText(language, "Type")}</Head>
                  <Head>{diagnosisText(language, "Status")}</Head>
                  <Head>{diagnosisText(language, "Onset Date")}</Head>
                  <Head>{diagnosisText(language, "Diagnosed By")}</Head>
                  <Head>{diagnosisText(language, "Updated")}</Head>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`border-b border-[#D7DEDA] text-[10px] ${
                      index % 2 === 0 ? "bg-white" : "bg-[#FAFAF7]"
                    }`}
                  >
                    <td className="w-[115px] border-r border-[#D7DEDA] px-1 py-1">
                      <select
                        defaultValue=""
                        onChange={(event) => {
                          action(record, event.target.value);
                          event.target.value = "";
                        }}
                        className="h-6 w-[103px] border border-[#AEB8B3] bg-white px-1 text-[9px] font-semibold text-[#175D86]"
                      >
                        <option value="">
                          {diagnosisText(language, "Actions")}
                        </option>
                        <option value="view">
                          {diagnosisText(language, "View")}
                        </option>
                        {canManage && (
                          <option value="edit">
                            {diagnosisText(language, "Edit / Revise")}
                          </option>
                        )}
                        {canManage && record.status === "Active" && (
                          <option value="resolve">
                            {diagnosisText(language, "Mark Resolved")}
                          </option>
                        )}
                        {canManage && record.status === "Resolved" && (
                          <option value="reactivate">
                            {diagnosisText(language, "Reactivate")}
                          </option>
                        )}
                        <option value="history">
                          {diagnosisText(language, "History")}
                        </option>
                      </select>
                    </td>

                    <td className="max-w-[420px] border-r border-[#D7DEDA] px-2 py-1">
                      <div className="flex items-start gap-1.5">
                        <Stethoscope
                          size={11}
                          className="mt-0.5 shrink-0 text-[#49665A]"
                        />
                        <div>
                          <p className="font-bold text-[#263A31]">
                            {record.diagnosis_name}
                          </p>
                          {record.source && (
                            <p className="mt-0.5 text-[8px] text-[#75827B]">
                              {record.source}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <Cell>
                      {record.diagnosis_code
                        ? `${record.code_system} ${record.diagnosis_code}`
                        : "—"}
                    </Cell>
                    <Cell strong={record.diagnosis_type === "Primary"}>
                      {diagnosisTypeLabel(language, record.diagnosis_type)}
                    </Cell>
                    <td
                      className={`border-r border-[#D7DEDA] px-2 py-1 ${statusClass(
                        record.status
                      )}`}
                    >
                      {diagnosisStatusLabel(language, record.status)}
                    </td>
                    <Cell>{formatDate(record.onset_date, language)}</Cell>
                    <Cell>{record.diagnosed_by || "—"}</Cell>
                    <Cell>{formatDateTime(record.updated_at, language)}</Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Stethoscope
              size={20}
              className="mx-auto text-[#7F8E86]"
            />
            <p className="mt-2 text-[11px] font-semibold text-[#465A50]">
              {diagnosisText(
                language,
                "No diagnosis records match the selected filters."
              )}
            </p>
          </div>
        )}
      </div>

      <DiagnosisModal
        open={formOpen}
        residentId={residentId}
        residentName={residentName}
        initialRecord={editing}
        currentStaffName={cleanText(staff?.full_name) || cleanText(staff?.name)}
        language={language}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => void loadRecords(true)}
      />

      {viewing && (
        <InfoModal
          title={diagnosisText(language, "Diagnosis Details")}
          onClose={() => setViewing(null)}
          language={language}
        >
          <div className="grid gap-px bg-[#D8DFDB] sm:grid-cols-3">
            <Detail
              label={diagnosisText(language, "Diagnosis")}
              value={viewing.diagnosis_name}
            />
            <Detail
              label={diagnosisText(language, "Code System")}
              value={diagnosisCodeSystemLabel(language, viewing.code_system)}
            />
            <Detail
              label={diagnosisText(language, "Diagnosis Code")}
              value={viewing.diagnosis_code}
            />
            <Detail
              label={diagnosisText(language, "Type")}
              value={diagnosisTypeLabel(language, viewing.diagnosis_type)}
            />
            <Detail
              label={diagnosisText(language, "Status")}
              value={diagnosisStatusLabel(language, viewing.status)}
            />
            <Detail
              label={diagnosisText(language, "Onset Date")}
              value={formatDate(viewing.onset_date, language)}
            />
            <Detail
              label={diagnosisText(language, "Resolution Date")}
              value={formatDate(viewing.resolution_date, language)}
            />
            <Detail
              label={diagnosisText(language, "Diagnosed By")}
              value={viewing.diagnosed_by}
            />
            <Detail
              label={diagnosisText(language, "Source")}
              value={viewing.source}
            />
            <Detail
              label={diagnosisText(language, "Created By")}
              value={viewing.created_by}
            />
            <Detail
              label={diagnosisText(language, "Updated")}
              value={formatDateTime(viewing.updated_at, language)}
            />
            <Detail
              label={diagnosisText(language, "Revision")}
              value={String(viewing.revision_number)}
            />
          </div>

          {viewing.clinical_notes && (
            <div className="border-t border-[#D8DFDB] p-3">
              <p className="text-[9px] font-bold uppercase text-[#718078]">
                {diagnosisText(language, "Clinical Notes")}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[10px] leading-5 text-[#33483F]">
                {viewing.clinical_notes}
              </p>
            </div>
          )}
        </InfoModal>
      )}

      {historyRecord && (
        <InfoModal
          title={`${diagnosisText(language, "Diagnosis History")} — ${historyRecord.diagnosis_name}`}
          onClose={() => {
            setHistoryRecord(null);
            setHistory([]);
          }}
          language={language}
        >
          {historyLoading ? (
            <div className="flex h-32 items-center justify-center">
              <LoaderCircle
                size={18}
                className="animate-spin text-[#073B2F]"
              />
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="bg-[#E7EDE9] text-[9px] font-bold uppercase text-[#40544B]">
                    <Head>{diagnosisText(language, "Date / Time")}</Head>
                    <Head>{diagnosisText(language, "Action")}</Head>
                    <Head>{diagnosisText(language, "Previous")}</Head>
                    <Head>{diagnosisText(language, "New")}</Head>
                    <Head>{diagnosisText(language, "Staff")}</Head>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#DCE3DF] text-[10px]"
                    >
                      <td className="px-2 py-1.5">
                        {formatDateTime(item.changed_at, language)}
                      </td>
                      <td className="px-2 py-1.5 font-semibold">
                        {diagnosisText(language, item.action)}
                      </td>
                      <td className="px-2 py-1.5">
                        {snapshotSummary(item.previous_snapshot, language)}
                      </td>
                      <td className="px-2 py-1.5">
                        {snapshotSummary(item.new_snapshot, language)}
                      </td>
                      <td className="px-2 py-1.5">
                        <div>{item.changed_by}</div>
                        {item.change_note && (
                          <div className="mt-0.5 text-[8px] text-[#718078]">
                            {item.change_note}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-[11px] text-[#687970]">
              {diagnosisText(
                language,
                "No revision history is available."
              )}
            </div>
          )}
        </InfoModal>
      )}

      {statusRecord && statusAction && (
        <StatusModal
          record={statusRecord}
          action={statusAction}
          language={language}
          onClose={() => {
            setStatusRecord(null);
            setStatusAction(null);
          }}
          onSaved={() => void loadRecords(true)}
        />
      )}
    </>
  );
}


function snapshotSummary(
  snapshot: Record<string, unknown> | null,
  language: DiagnosisLanguage
) {
  if (!snapshot) {
    return "—";
  }

  const diagnosis = cleanText(snapshot.diagnosis_name);
  const type = cleanText(snapshot.diagnosis_type);
  const status = cleanText(snapshot.status);
  const codeSystem = cleanText(snapshot.code_system);
  const code = cleanText(snapshot.diagnosis_code);

  return [
    diagnosis,
    code ? `${codeSystem} ${code}` : "",
    type ? diagnosisTypeLabel(language, type) : "",
    status ? diagnosisStatusLabel(language, status) : "",
  ]
    .filter(Boolean)
    .join(" • ") || "—";
}


function DiagnosisModal({
  open,
  residentId,
  residentName,
  initialRecord,
  currentStaffName,
  language,
  onClose,
  onSaved,
}: {
  open: boolean;
  residentId: number;
  residentName: string;
  initialRecord: DiagnosisRecord | null;
  currentStaffName: string;
  language: DiagnosisLanguage;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<DiagnosisForm>(
    emptyForm(currentStaffName)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      initialRecord
        ? formFromRecord(initialRecord)
        : emptyForm(currentStaffName)
    );
    setError("");
  }, [open, initialRecord, currentStaffName]);

  if (!open) {
    return null;
  }

  function update<K extends keyof DiagnosisForm>(
    field: K,
    value: DiagnosisForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "status" && value === "Active"
        ? { resolutionDate: "" }
        : {}),
    }));
    setError("");
  }

  async function save() {
    if (!form.diagnosisName.trim()) {
      setError(diagnosisText(language, "Diagnosis is required."));
      return;
    }

    if (form.status === "Resolved" && !form.resolutionDate) {
      setError(
        diagnosisText(
          language,
          "Resolution date is required for a resolved diagnosis."
        )
      );
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      resident_id: residentId,
      diagnosis_name: form.diagnosisName.trim(),
      code_system: form.codeSystem,
      diagnosis_code: form.diagnosisCode.trim(),
      diagnosis_type: form.diagnosisType,
      status: form.status,
      onset_date: form.onsetDate,
      resolution_date:
        form.status === "Resolved" ? form.resolutionDate : "",
      diagnosed_by: form.diagnosedBy.trim(),
      source: form.source.trim(),
      clinical_notes: form.clinicalNotes.trim(),
    };

    try {
      if (initialRecord) {
        const { error: updateError } = await supabase.rpc(
          "la_cura_update_diagnosis",
          {
            p_diagnosis_id: initialRecord.id,
            p_payload: payload,
          }
        );

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: createError } = await supabase.rpc(
          "la_cura_create_diagnosis",
          {
            p_payload: payload,
          }
        );

        if (createError) {
          throw createError;
        }
      }

      onSaved();
      onClose();
    } catch (caughtError) {
      setError(errorMessage(caughtError, language));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/45 p-2 sm:p-4"
      onMouseDown={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden border border-[#A4B1AA] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between bg-[#073B2F] px-3 py-2 text-white">
          <div>
            <p className="text-[9px] font-semibold uppercase text-[#CAD8D1]">
              {diagnosisText(language, "Resident")}: {residentName}
            </p>
            <h2 className="text-[14px] font-bold">
              {diagnosisText(
                language,
                initialRecord ? "Revise Diagnosis" : "New Diagnosis"
              )}
            </h2>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center border border-white/25"
          >
            <X size={13} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <SectionBar>
            {diagnosisText(language, "Diagnosis Information")}
          </SectionBar>

          <div className="grid gap-3 p-3 md:grid-cols-2">
            <Field
              label={diagnosisText(language, "Diagnosis / Problem")}
              required
              value={form.diagnosisName}
              onChange={(value) => update("diagnosisName", value)}
            />

            <SelectField
              label={diagnosisText(language, "Type")}
              value={form.diagnosisType}
              options={[
                { value: "Primary", label: diagnosisTypeLabel(language, "Primary") },
                { value: "Secondary", label: diagnosisTypeLabel(language, "Secondary") },
              ]}
              onChange={(value) => update("diagnosisType", value as DiagnosisType)}
            />

            <SelectField
              label={diagnosisText(language, "Code System")}
              value={form.codeSystem}
              options={[
                { value: "ICD-10", label: "ICD-10" },
                { value: "ICD-11", label: "ICD-11" },
                { value: "Other", label: diagnosisText(language, "Other") },
              ]}
              onChange={(value) => update("codeSystem", value as DiagnosisCodeSystem)}
            />

            <Field
              label={diagnosisText(language, "Diagnosis Code")}
              value={form.diagnosisCode}
              onChange={(value) => update("diagnosisCode", value)}
              help={diagnosisText(
                language,
                "Optional. Use the classification documented by the clinician."
              )}
            />

            <SelectField
              label={diagnosisText(language, "Status")}
              value={form.status}
              options={[
                { value: "Active", label: diagnosisStatusLabel(language, "Active") },
                { value: "Resolved", label: diagnosisStatusLabel(language, "Resolved") },
              ]}
              onChange={(value) => update("status", value as DiagnosisStatus)}
            />

            <Field
              type="date"
              label={diagnosisText(language, "Onset Date")}
              value={form.onsetDate}
              onChange={(value) => update("onsetDate", value)}
              help={diagnosisText(language, "Date diagnosed or first recognized")}
            />

            {form.status === "Resolved" && (
              <Field
                type="date"
                required
                label={diagnosisText(language, "Resolution Date")}
                value={form.resolutionDate}
                onChange={(value) => update("resolutionDate", value)}
              />
            )}
          </div>

          <SectionBar>
            {diagnosisText(language, "Clinical Context")}
          </SectionBar>

          <div className="grid gap-3 p-3 md:grid-cols-2">
            <Field
              label={diagnosisText(language, "Diagnosed By")}
              value={form.diagnosedBy}
              onChange={(value) => update("diagnosedBy", value)}
              placeholder={diagnosisText(language, "Physician or clinician")}
            />

            <Field
              label={diagnosisText(language, "Source")}
              value={form.source}
              onChange={(value) => update("source", value)}
              placeholder={diagnosisText(
                language,
                "Facility, hospital record, referral, etc."
              )}
            />

            <label className="md:col-span-2">
              <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
                {diagnosisText(language, "Clinical Notes")}
              </span>
              <textarea
                rows={4}
                value={form.clinicalNotes}
                onChange={(event) =>
                  update("clinicalNotes", event.target.value)
                }
                className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none focus:border-[#667F73]"
              />
            </label>

            {error && (
              <div className="md:col-span-2 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        <footer className="flex justify-center gap-1.5 border-t border-[#BEC8C2] bg-[#F3F2ED] px-3 py-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="h-8 border border-[#073B2F] bg-[#073B2F] px-4 text-[10px] font-bold text-white disabled:opacity-50"
          >
            {saving
              ? diagnosisText(language, "Saving...")
              : diagnosisText(
                  language,
                  initialRecord ? "Save Revision" : "Save Diagnosis"
                )}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-8 border border-[#8E9D95] bg-white px-4 text-[10px] font-bold text-[#33483F]"
          >
            {diagnosisText(language, "Cancel")}
          </button>
        </footer>
      </div>
    </div>
  );
}


function StatusModal({
  record,
  action,
  language,
  onClose,
  onSaved,
}: {
  record: DiagnosisRecord;
  action: "resolve" | "reactivate";
  language: DiagnosisLanguage;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [resolutionDate, setResolutionDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (action === "resolve" && !resolutionDate) {
      setError(
        diagnosisText(
          language,
          "Resolution date is required for a resolved diagnosis."
        )
      );
      return;
    }

    setSaving(true);
    setError("");

    const { error: statusError } = await supabase.rpc(
      "la_cura_set_diagnosis_status",
      {
        p_diagnosis_id: record.id,
        p_status: action === "resolve" ? "Resolved" : "Active",
        p_resolution_date: action === "resolve" ? resolutionDate : null,
        p_note: note.trim() || null,
      }
    );

    if (statusError) {
      setError(errorMessage(statusError, language));
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <InfoModal
      title={diagnosisText(
        language,
        action === "resolve" ? "Resolve Diagnosis" : "Reopen Diagnosis"
      )}
      onClose={onClose}
      language={language}
      locked={saving}
    >
      <div className="p-4">
        <p className="text-[11px] font-bold text-[#2D4339]">
          {record.diagnosis_name}
        </p>

        {action === "resolve" ? (
          <div className="mt-3 max-w-sm">
            <Field
              type="date"
              required
              label={diagnosisText(language, "Resolution date")}
              value={resolutionDate}
              onChange={setResolutionDate}
            />
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-[#617169]">
            {diagnosisText(
              language,
              "This diagnosis will return to Active status."
            )}
          </p>
        )}

        <label className="mt-3 block">
          <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
            {diagnosisText(language, "Optional note")}
          </span>
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full border border-[#B8C3BD] px-2 py-2 text-[10px] outline-none"
          />
        </label>

        {error && (
          <div className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="h-8 border border-[#073B2F] bg-[#073B2F] px-4 text-[10px] font-bold text-white disabled:opacity-50"
          >
            {saving
              ? diagnosisText(language, "Saving...")
              : diagnosisText(
                  language,
                  action === "resolve" ? "Resolve" : "Reopen"
                )}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-8 border border-[#8E9D95] bg-white px-4 text-[10px] font-bold text-[#33483F]"
          >
            {diagnosisText(language, "Cancel")}
          </button>
        </div>
      </div>
    </InfoModal>
  );
}


function InfoModal({
  title,
  children,
  onClose,
  language,
  locked = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  language: DiagnosisLanguage;
  locked?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={() => {
        if (!locked) {
          onClose();
        }
      }}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-[#AAB8B1] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between bg-[#073B2F] px-3 py-2 text-white">
          <div className="flex items-center gap-2">
            <FileClock size={13} />
            <h2 className="text-[12px] font-bold">{title}</h2>
          </div>
          <button
            type="button"
            disabled={locked}
            onClick={onClose}
            className="h-7 border border-white/25 px-2 text-[10px] font-bold disabled:opacity-50"
          >
            {diagnosisText(language, "Close")}
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}


function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#D7DFDA] px-3 py-2 last:border-b-0 sm:border-b-0 sm:border-r">
      <p className="text-[9px] font-bold uppercase text-[#64736C]">
        {label}
      </p>
      <strong className="text-[13px] text-[#263D33]">{value}</strong>
    </div>
  );
}


function SectionBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-y border-[#819371] bg-[#91A47E] px-2 py-1 text-[11px] font-bold text-white">
      {children}
    </div>
  );
}


function Head({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="border-r border-[#BFCAD0] px-2 py-1 text-left last:border-r-0">
      {children}
    </th>
  );
}


function Cell({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <td
      className={`border-r border-[#D7DEDA] px-2 py-1 ${
        strong ? "font-bold text-[#263A31]" : ""
      }`}
    >
      {children}
    </td>
  );
}


function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="bg-white p-3">
      <p className="text-[9px] font-bold uppercase text-[#718078]">
        {label}
      </p>
      <p className="mt-1 text-[10px] font-semibold text-[#33483F]">
        {cleanText(value) || "—"}
      </p>
    </div>
  );
}


function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  help = "",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  help?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 w-full border border-[#B8C3BD] bg-white px-2 text-[10px] outline-none focus:border-[#667F73]"
      />
      {help && (
        <span className="mt-1 block text-[8px] leading-4 text-[#718078]">
          {help}
        </span>
      )}
    </label>
  );
}


function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-[#33483F]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full border border-[#B8C3BD] bg-white px-2 text-[10px] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
