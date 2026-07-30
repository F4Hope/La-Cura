"use client";

import {
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Database,
  Download,
  FileJson,
  Globe2,
  Loader2,
  LockKeyhole,
  MonitorCog,
  Pill,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  Upload,
  UserRoundCog,
  Wifi,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { supabase } from "@/lib/supabase/client";

type SettingsTab =
  | "facility"
  | "clinical"
  | "notifications"
  | "security"
  | "system";

type DatabaseStatus =
  | "checking"
  | "connected"
  | "disconnected";

type AppSettings = {
  facility: {
    facilityName: string;
    legalName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    timezone: string;
    dateFormat: string;
  };

  clinical: {
    defaultShift: string;
    medicationEarlyWindow: number;
    medicationLateWindow: number;
    requireHoldReason: boolean;
    requireRefusalReason: boolean;
    requireClinicalNotes: boolean;
    requireWitnessForControlledMedication: boolean;
    displayResidentAllergies: boolean;
    enableMedicationWarnings: boolean;
  };

  notifications: {
    overdueMedicationAlerts: boolean;
    appointmentReminders: boolean;
    incidentAlerts: boolean;
    abnormalVitalsAlerts: boolean;
    incompleteDocumentationAlerts: boolean;
    dailyClinicalDigest: boolean;
    soundEnabled: boolean;
    reminderMinutes: number;
  };

  security: {
    sessionTimeoutMinutes: number;
    automaticScreenLock: boolean;
    requirePasswordForAdministration: boolean;
    requireMfaForAdministrators: boolean;
    auditLogEnabled: boolean;
    restrictReportDownloads: boolean;
  };

  system: {
    automaticSync: boolean;
    offlineMode: boolean;
    syncIntervalMinutes: number;
    retainActivityDays: number;
  };
};

const STORAGE_KEY = "la-cura-system-settings-v1";

const defaultSettings: AppSettings = {
  facility: {
    facilityName: "La-Cura",
    legalName: "La-Cura Clinical Care",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    timezone: "America/Chicago",
    dateFormat: "MM/DD/YYYY",
  },

  clinical: {
    defaultShift: "Day Shift",
    medicationEarlyWindow: 60,
    medicationLateWindow: 60,
    requireHoldReason: true,
    requireRefusalReason: true,
    requireClinicalNotes: true,
    requireWitnessForControlledMedication: true,
    displayResidentAllergies: true,
    enableMedicationWarnings: true,
  },

  notifications: {
    overdueMedicationAlerts: true,
    appointmentReminders: true,
    incidentAlerts: true,
    abnormalVitalsAlerts: true,
    incompleteDocumentationAlerts: true,
    dailyClinicalDigest: false,
    soundEnabled: true,
    reminderMinutes: 30,
  },

  security: {
    sessionTimeoutMinutes: 30,
    automaticScreenLock: true,
    requirePasswordForAdministration: false,
    requireMfaForAdministrators: false,
    auditLogEnabled: true,
    restrictReportDownloads: false,
  },

  system: {
    automaticSync: true,
    offlineMode: true,
    syncIntervalMinutes: 5,
    retainActivityDays: 365,
  },
};

const tabs: Array<{
  id: SettingsTab;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "facility",
    label: "Facility",
    description: "Facility identity and regional preferences",
    icon: Building2,
  },
  {
    id: "clinical",
    label: "Clinical",
    description: "Medication and documentation rules",
    icon: Stethoscope,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and reminder preferences",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    description: "Access and session controls",
    icon: ShieldCheck,
  },
  {
    id: "system",
    label: "System",
    description: "Database, synchronization, and data tools",
    icon: MonitorCog,
  },
];

function mergeSettings(
  storedSettings: Partial<AppSettings>
): AppSettings {
  return {
    facility: {
      ...defaultSettings.facility,
      ...(storedSettings.facility ?? {}),
    },
    clinical: {
      ...defaultSettings.clinical,
      ...(storedSettings.clinical ?? {}),
    },
    notifications: {
      ...defaultSettings.notifications,
      ...(storedSettings.notifications ?? {}),
    },
    security: {
      ...defaultSettings.security,
      ...(storedSettings.security ?? {}),
    },
    system: {
      ...defaultSettings.system,
      ...(storedSettings.system ?? {}),
    },
  };
}

function formatDateTime(date: Date | null): string {
  if (!date) {
    return "Not checked";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function SettingsPage() {
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("facility");

  const [settings, setSettings] =
    useState<AppSettings>(defaultSettings);

  const [savedSnapshot, setSavedSnapshot] = useState(
    JSON.stringify(defaultSettings)
  );

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [databaseStatus, setDatabaseStatus] =
    useState<DatabaseStatus>("checking");

  const [residentCount, setResidentCount] =
    useState<number | null>(null);

  const [lastDatabaseCheck, setLastDatabaseCheck] =
    useState<Date | null>(null);

  const [online, setOnline] = useState(true);
  const [resetModalOpen, setResetModalOpen] =
    useState(false);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== savedSnapshot,
    [settings, savedSnapshot]
  );

  useEffect(() => {
    setMounted(true);

    const storedValue = window.localStorage.getItem(
      STORAGE_KEY
    );

    if (storedValue) {
      try {
        const parsedSettings = JSON.parse(
          storedValue
        ) as Partial<AppSettings>;

        const mergedSettings =
          mergeSettings(parsedSettings);

        setSettings(mergedSettings);
        setSavedSnapshot(
          JSON.stringify(mergedSettings)
        );
      } catch (error) {
        console.error(
          "Unable to read saved settings:",
          error
        );
      }
    }

    setOnline(window.navigator.onLine);

    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    void checkDatabaseConnection();
  }, [mounted]);

  useEffect(() => {
    function handleBeforeUnload(
      event: BeforeUnloadEvent
    ) {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [hasUnsavedChanges]);

  function updateFacility<
    Key extends keyof AppSettings["facility"],
  >(
    key: Key,
    value: AppSettings["facility"][Key]
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      facility: {
        ...currentSettings.facility,
        [key]: value,
      },
    }));
  }

  function updateClinical<
    Key extends keyof AppSettings["clinical"],
  >(
    key: Key,
    value: AppSettings["clinical"][Key]
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      clinical: {
        ...currentSettings.clinical,
        [key]: value,
      },
    }));
  }

  function updateNotifications<
    Key extends keyof AppSettings["notifications"],
  >(
    key: Key,
    value: AppSettings["notifications"][Key]
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      notifications: {
        ...currentSettings.notifications,
        [key]: value,
      },
    }));
  }

  function updateSecurity<
    Key extends keyof AppSettings["security"],
  >(
    key: Key,
    value: AppSettings["security"][Key]
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      security: {
        ...currentSettings.security,
        [key]: value,
      },
    }));
  }

  function updateSystem<
    Key extends keyof AppSettings["system"],
  >(
    key: Key,
    value: AppSettings["system"][Key]
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      system: {
        ...currentSettings.system,
        [key]: value,
      },
    }));
  }

  async function handleSaveSettings() {
    if (!hasUnsavedChanges || saving) {
      return;
    }

    setSaving(true);
    setSaveMessage("");
    setErrorMessage("");

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      setSavedSnapshot(JSON.stringify(settings));
      setSaveMessage(
        "Settings saved successfully on this device."
      );

      window.setTimeout(() => {
        setSaveMessage("");
      }, 3500);
    } catch (error) {
      console.error("Unable to save settings:", error);

      setErrorMessage(
        "Settings could not be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDiscardChanges() {
    try {
      const parsedSnapshot = JSON.parse(
        savedSnapshot
      ) as AppSettings;

      setSettings(parsedSnapshot);
      setSaveMessage("");
      setErrorMessage("");
    } catch {
      setSettings(defaultSettings);
    }
  }

  async function checkDatabaseConnection() {
    setDatabaseStatus("checking");
    setErrorMessage("");

    try {
      const { count, error } = await supabase
        .from("residents")
        .select("id", {
          count: "exact",
          head: true,
        });

      if (error) {
        throw error;
      }

      setDatabaseStatus("connected");
      setResidentCount(count ?? 0);
      setLastDatabaseCheck(new Date());
    } catch (error) {
      console.error(
        "Database connection check failed:",
        error
      );

      setDatabaseStatus("disconnected");
      setResidentCount(null);
      setLastDatabaseCheck(new Date());
    }
  }

  function exportSettings() {
    const exportPayload = {
      application: "La-Cura",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      settings,
    };

    const blob = new Blob(
      [JSON.stringify(exportPayload, null, 2)],
      {
        type: "application/json;charset=utf-8",
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `la-cura-settings-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function openImportPicker() {
    importInputRef.current?.click();
  }

  async function handleImportSettings(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setSaveMessage("");
    setErrorMessage("");

    try {
      const fileText = await file.text();
      const parsedFile = JSON.parse(fileText) as {
        settings?: Partial<AppSettings>;
      };

      if (!parsedFile.settings) {
        throw new Error(
          "The imported file does not contain La-Cura settings."
        );
      }

      const importedSettings = mergeSettings(
        parsedFile.settings
      );

      setSettings(importedSettings);
      setSaveMessage(
        "Settings imported. Select Save Changes to keep them."
      );
    } catch (error) {
      console.error(
        "Unable to import settings:",
        error
      );

      setErrorMessage(
        "The selected settings file is invalid."
      );
    }
  }

  function resetSettings() {
    setSettings(defaultSettings);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultSettings)
    );

    setSavedSnapshot(
      JSON.stringify(defaultSettings)
    );

    setResetModalOpen(false);
    setSaveMessage(
      "Settings were restored to their defaults."
    );
    setErrorMessage("");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-green-800 bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white shadow-lg">
        <div className="px-6 py-7 lg:px-10">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                <Settings size={30} />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  Settings
                </h1>

                <p className="mt-1 text-green-100">
                  Configure facility, clinical, security,
                  and system preferences
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  disabled={saving}
                  className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                >
                  Discard Changes
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={
                  !hasUnsavedChanges || saving
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-green-800 shadow-sm transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-5 md:p-8 lg:p-10">
        {(saveMessage || errorMessage) && (
          <div
            className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border px-5 py-4 ${
              errorMessage
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            <div className="flex items-center gap-3">
              {errorMessage ? (
                <TriangleAlert
                  size={20}
                  className="shrink-0"
                />
              ) : (
                <CheckCircle2
                  size={20}
                  className="shrink-0"
                />
              )}

              <p className="font-semibold">
                {errorMessage || saveMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSaveMessage("");
                setErrorMessage("");
              }}
              aria-label="Dismiss message"
              className="rounded-lg p-1 transition hover:bg-black/5"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="grid gap-7 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6">
            <div className="border-b border-slate-200 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Configuration
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Settings are currently stored in this
                browser.
              </p>
            </div>

            <nav className="space-y-1.5 p-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition ${
                      isActive
                        ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`rounded-xl p-2 ${
                        isActive
                          ? "bg-green-100"
                          : "bg-slate-100"
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold">
                        {tab.label}
                      </p>

                      <p
                        className={`mt-0.5 truncate text-xs ${
                          isActive
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      >
                        {tab.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className={
                        isActive
                          ? "text-green-600"
                          : "text-slate-300"
                      }
                    />
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl p-2 ${
                    online
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {online ? (
                    <Wifi size={18} />
                  ) : (
                    <WifiOff size={18} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {online
                      ? "System Online"
                      : "System Offline"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Browser network status
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {activeTab === "facility" && (
              <FacilitySettings
                settings={settings.facility}
                onChange={updateFacility}
              />
            )}

            {activeTab === "clinical" && (
              <ClinicalSettings
                settings={settings.clinical}
                onChange={updateClinical}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationSettings
                settings={settings.notifications}
                onChange={updateNotifications}
              />
            )}

            {activeTab === "security" && (
              <SecuritySettings
                settings={settings.security}
                onChange={updateSecurity}
              />
            )}

            {activeTab === "system" && (
              <SystemSettings
                settings={settings.system}
                databaseStatus={databaseStatus}
                residentCount={residentCount}
                lastDatabaseCheck={lastDatabaseCheck}
                online={online}
                onChange={updateSystem}
                onCheckDatabase={
                  checkDatabaseConnection
                }
                onExport={exportSettings}
                onImport={openImportPicker}
                onReset={() =>
                  setResetModalOpen(true)
                }
              />
            )}
          </div>
        </div>
      </main>

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportSettings}
        className="hidden"
      />

      <ResetSettingsModal
        open={resetModalOpen}
        onClose={() =>
          setResetModalOpen(false)
        }
        onConfirm={resetSettings}
      />
    </div>
  );
}

type FacilitySettingsProps = {
  settings: AppSettings["facility"];
  onChange: <
    Key extends keyof AppSettings["facility"],
  >(
    key: Key,
    value: AppSettings["facility"][Key]
  ) => void;
};

function FacilitySettings({
  settings,
  onChange,
}: FacilitySettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        icon={Building2}
        title="Facility Settings"
        description="Manage the facility identity, contact information, and regional preferences used throughout La-Cura."
      />

      <SettingsSection
        title="Facility Identity"
        description="This information can be used in reports and clinical documents."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Facility Name"
            value={settings.facilityName}
            onChange={(value) =>
              onChange("facilityName", value)
            }
            placeholder="La-Cura"
          />

          <TextField
            label="Legal Organization Name"
            value={settings.legalName}
            onChange={(value) =>
              onChange("legalName", value)
            }
            placeholder="La-Cura Clinical Care"
          />

          <TextField
            label="Facility Phone"
            type="tel"
            value={settings.phone}
            onChange={(value) =>
              onChange("phone", value)
            }
            placeholder="(000) 000-0000"
          />

          <TextField
            label="Facility Email"
            type="email"
            value={settings.email}
            onChange={(value) =>
              onChange("email", value)
            }
            placeholder="facility@example.com"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Facility Address"
        description="The address may appear on exported documents and reports."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <TextField
              label="Street Address"
              value={settings.address}
              onChange={(value) =>
                onChange("address", value)
              }
              placeholder="Facility street address"
            />
          </div>

          <TextField
            label="City"
            value={settings.city}
            onChange={(value) =>
              onChange("city", value)
            }
            placeholder="City"
          />

          <TextField
            label="State"
            value={settings.state}
            onChange={(value) =>
              onChange("state", value)
            }
            placeholder="State"
          />

          <TextField
            label="Postal Code"
            value={settings.postalCode}
            onChange={(value) =>
              onChange("postalCode", value)
            }
            placeholder="Postal code"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Regional Preferences"
        description="Set how dates and local time should be displayed."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Facility Time Zone"
            value={settings.timezone}
            onChange={(value) =>
              onChange("timezone", value)
            }
            options={[
              {
                value: "America/New_York",
                label: "Eastern Time",
              },
              {
                value: "America/Chicago",
                label: "Central Time",
              },
              {
                value: "America/Denver",
                label: "Mountain Time",
              },
              {
                value: "America/Los_Angeles",
                label: "Pacific Time",
              },
              {
                value: "America/Anchorage",
                label: "Alaska Time",
              },
              {
                value: "Pacific/Honolulu",
                label: "Hawaii Time",
              },
            ]}
          />

          <SelectField
            label="Date Format"
            value={settings.dateFormat}
            onChange={(value) =>
              onChange("dateFormat", value)
            }
            options={[
              {
                value: "MM/DD/YYYY",
                label: "MM/DD/YYYY",
              },
              {
                value: "DD/MM/YYYY",
                label: "DD/MM/YYYY",
              },
              {
                value: "YYYY-MM-DD",
                label: "YYYY-MM-DD",
              },
            ]}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

type ClinicalSettingsProps = {
  settings: AppSettings["clinical"];
  onChange: <
    Key extends keyof AppSettings["clinical"],
  >(
    key: Key,
    value: AppSettings["clinical"][Key]
  ) => void;
};

function ClinicalSettings({
  settings,
  onChange,
}: ClinicalSettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        icon={Stethoscope}
        title="Clinical Settings"
        description="Configure medication administration windows and required clinical documentation."
      />

      <SettingsSection
        title="Medication Administration"
        description="Set default administration timing and medication safety controls."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <SelectField
            label="Default Shift"
            value={settings.defaultShift}
            onChange={(value) =>
              onChange("defaultShift", value)
            }
            options={[
              {
                value: "Day Shift",
                label: "Day Shift",
              },
              {
                value: "Evening Shift",
                label: "Evening Shift",
              },
              {
                value: "Night Shift",
                label: "Night Shift",
              },
            ]}
          />

          <NumberField
            label="Early Window"
            suffix="minutes"
            min={0}
            max={240}
            value={settings.medicationEarlyWindow}
            onChange={(value) =>
              onChange(
                "medicationEarlyWindow",
                value
              )
            }
          />

          <NumberField
            label="Late Window"
            suffix="minutes"
            min={0}
            max={240}
            value={settings.medicationLateWindow}
            onChange={(value) =>
              onChange(
                "medicationLateWindow",
                value
              )
            }
          />
        </div>

        <div className="mt-6 divide-y divide-slate-100">
          <ToggleRow
            icon={Pill}
            title="Medication safety warnings"
            description="Display clinical warnings before medication administration."
            checked={
              settings.enableMedicationWarnings
            }
            onChange={(checked) =>
              onChange(
                "enableMedicationWarnings",
                checked
              )
            }
          />

          <ToggleRow
            icon={TriangleAlert}
            title="Display resident allergies"
            description="Show documented allergies prominently during clinical workflows."
            checked={
              settings.displayResidentAllergies
            }
            onChange={(checked) =>
              onChange(
                "displayResidentAllergies",
                checked
              )
            }
          />

          <ToggleRow
            icon={LockKeyhole}
            title="Controlled medication witness"
            description="Require witness documentation for controlled medication administration."
            checked={
              settings.requireWitnessForControlledMedication
            }
            onChange={(checked) =>
              onChange(
                "requireWitnessForControlledMedication",
                checked
              )
            }
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Documentation Requirements"
        description="Control the information staff must provide before completing clinical actions."
      >
        <div className="divide-y divide-slate-100">
          <ToggleRow
            icon={ClipboardCheck}
            title="Require hold reason"
            description="Staff must document a reason when a medication is held."
            checked={settings.requireHoldReason}
            onChange={(checked) =>
              onChange(
                "requireHoldReason",
                checked
              )
            }
          />

          <ToggleRow
            icon={UserRoundCog}
            title="Require refusal reason"
            description="Staff must document the reason a resident refused medication."
            checked={
              settings.requireRefusalReason
            }
            onChange={(checked) =>
              onChange(
                "requireRefusalReason",
                checked
              )
            }
          />

          <ToggleRow
            icon={FileJson}
            title="Require clinical notes"
            description="Require supporting notes for medication exceptions and other clinical actions."
            checked={
              settings.requireClinicalNotes
            }
            onChange={(checked) =>
              onChange(
                "requireClinicalNotes",
                checked
              )
            }
          />
        </div>
      </SettingsSection>
    </div>
  );
}

type NotificationSettingsProps = {
  settings: AppSettings["notifications"];
  onChange: <
    Key extends keyof AppSettings["notifications"],
  >(
    key: Key,
    value: AppSettings["notifications"][Key]
  ) => void;
};

function NotificationSettings({
  settings,
  onChange,
}: NotificationSettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        icon={Bell}
        title="Notification Settings"
        description="Choose which clinical events generate alerts and reminders."
      />

      <SettingsSection
        title="Clinical Alerts"
        description="Configure alerts that require staff awareness or follow-up."
      >
        <div className="divide-y divide-slate-100">
          <ToggleRow
            icon={Pill}
            title="Overdue medication alerts"
            description="Notify staff when a scheduled medication becomes overdue."
            checked={
              settings.overdueMedicationAlerts
            }
            onChange={(checked) =>
              onChange(
                "overdueMedicationAlerts",
                checked
              )
            }
          />

          <ToggleRow
            icon={Clock3}
            title="Appointment reminders"
            description="Notify staff before scheduled resident appointments."
            checked={
              settings.appointmentReminders
            }
            onChange={(checked) =>
              onChange(
                "appointmentReminders",
                checked
              )
            }
          />

          <ToggleRow
            icon={TriangleAlert}
            title="Incident alerts"
            description="Notify supervisors when a new incident report is submitted."
            checked={settings.incidentAlerts}
            onChange={(checked) =>
              onChange(
                "incidentAlerts",
                checked
              )
            }
          />

          <ToggleRow
            icon={Stethoscope}
            title="Abnormal vital sign alerts"
            description="Generate alerts when documented vital signs fall outside configured parameters."
            checked={
              settings.abnormalVitalsAlerts
            }
            onChange={(checked) =>
              onChange(
                "abnormalVitalsAlerts",
                checked
              )
            }
          />

          <ToggleRow
            icon={ClipboardCheck}
            title="Incomplete documentation alerts"
            description="Notify staff about incomplete clinical records and unsigned entries."
            checked={
              settings.incompleteDocumentationAlerts
            }
            onChange={(checked) =>
              onChange(
                "incompleteDocumentationAlerts",
                checked
              )
            }
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Reminder Preferences"
        description="Control alert timing and optional notification behavior."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <NumberField
            label="Appointment Reminder"
            suffix="minutes before"
            min={5}
            max={1440}
            value={settings.reminderMinutes}
            onChange={(value) =>
              onChange(
                "reminderMinutes",
                value
              )
            }
          />
        </div>

        <div className="mt-6 divide-y divide-slate-100">
          <ToggleRow
            icon={Bell}
            title="Notification sounds"
            description="Play a sound when a high-priority alert is created."
            checked={settings.soundEnabled}
            onChange={(checked) =>
              onChange(
                "soundEnabled",
                checked
              )
            }
          />

          <ToggleRow
            icon={FileJson}
            title="Daily clinical digest"
            description="Prepare a daily summary of medication, appointment, and documentation activity."
            checked={
              settings.dailyClinicalDigest
            }
            onChange={(checked) =>
              onChange(
                "dailyClinicalDigest",
                checked
              )
            }
          />
        </div>
      </SettingsSection>
    </div>
  );
}

type SecuritySettingsProps = {
  settings: AppSettings["security"];
  onChange: <
    Key extends keyof AppSettings["security"],
  >(
    key: Key,
    value: AppSettings["security"][Key]
  ) => void;
};

function SecuritySettings({
  settings,
  onChange,
}: SecuritySettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        icon={ShieldCheck}
        title="Security Settings"
        description="Configure session, authentication, audit, and report-download controls."
      />

      <SettingsSection
        title="Session Security"
        description="Control automatic lock behavior for inactive sessions."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Session Timeout"
            value={String(
              settings.sessionTimeoutMinutes
            )}
            onChange={(value) =>
              onChange(
                "sessionTimeoutMinutes",
                Number(value)
              )
            }
            options={[
              {
                value: "15",
                label: "15 minutes",
              },
              {
                value: "30",
                label: "30 minutes",
              },
              {
                value: "45",
                label: "45 minutes",
              },
              {
                value: "60",
                label: "1 hour",
              },
              {
                value: "120",
                label: "2 hours",
              },
            ]}
          />
        </div>

        <div className="mt-6 divide-y divide-slate-100">
          <ToggleRow
            icon={LockKeyhole}
            title="Automatic screen lock"
            description="Lock the application when the session timeout is reached."
            checked={
              settings.automaticScreenLock
            }
            onChange={(checked) =>
              onChange(
                "automaticScreenLock",
                checked
              )
            }
          />

          <ToggleRow
            icon={Pill}
            title="Password confirmation for administration"
            description="Require staff password confirmation before documenting medication administration."
            checked={
              settings.requirePasswordForAdministration
            }
            onChange={(checked) =>
              onChange(
                "requirePasswordForAdministration",
                checked
              )
            }
          />

          <ToggleRow
            icon={ShieldCheck}
            title="Multi-factor authentication for administrators"
            description="Require an additional authentication step for administrator accounts."
            checked={
              settings.requireMfaForAdministrators
            }
            onChange={(checked) =>
              onChange(
                "requireMfaForAdministrators",
                checked
              )
            }
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Audit and Data Controls"
        description="Manage clinical activity tracking and report access."
      >
        <div className="divide-y divide-slate-100">
          <ToggleRow
            icon={FileJson}
            title="Clinical audit log"
            description="Record user activity for medication, documentation, resident, and report actions."
            checked={settings.auditLogEnabled}
            onChange={(checked) =>
              onChange(
                "auditLogEnabled",
                checked
              )
            }
          />

          <ToggleRow
            icon={Download}
            title="Restrict clinical report downloads"
            description="Limit patient report downloads to authorized roles."
            checked={
              settings.restrictReportDownloads
            }
            onChange={(checked) =>
              onChange(
                "restrictReportDownloads",
                checked
              )
            }
          />
        </div>
      </SettingsSection>

      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <TriangleAlert size={22} />
          </div>

          <div>
            <h3 className="font-black text-amber-900">
              Authentication integration
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              These preferences are saved in the browser.
              Actual MFA and role enforcement must also be
              implemented in Supabase authentication and
              application authorization rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type SystemSettingsProps = {
  settings: AppSettings["system"];
  databaseStatus: DatabaseStatus;
  residentCount: number | null;
  lastDatabaseCheck: Date | null;
  online: boolean;
  onChange: <
    Key extends keyof AppSettings["system"],
  >(
    key: Key,
    value: AppSettings["system"][Key]
  ) => void;
  onCheckDatabase: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
};

function SystemSettings({
  settings,
  databaseStatus,
  residentCount,
  lastDatabaseCheck,
  online,
  onChange,
  onCheckDatabase,
  onExport,
  onImport,
  onReset,
}: SystemSettingsProps) {
  return (
    <div className="space-y-6">
      <SettingsPageHeader
        icon={MonitorCog}
        title="System Settings"
        description="Review connection status, synchronization settings, and configuration tools."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <SystemStatusCard
          label="Database"
          value={
            databaseStatus === "checking"
              ? "Checking"
              : databaseStatus === "connected"
                ? "Connected"
                : "Disconnected"
          }
          detail={
            databaseStatus === "connected" &&
            residentCount !== null
              ? `${residentCount} resident records available`
              : formatDateTime(lastDatabaseCheck)
          }
          status={
            databaseStatus === "checking"
              ? "checking"
              : databaseStatus === "connected"
                ? "good"
                : "error"
          }
          icon={Database}
        />

        <SystemStatusCard
          label="Network"
          value={online ? "Online" : "Offline"}
          detail="Browser connection status"
          status={online ? "good" : "error"}
          icon={online ? Wifi : WifiOff}
        />

        <SystemStatusCard
          label="Application"
          value="Version 1.0.0"
          detail="La-Cura clinical system"
          status="good"
          icon={MonitorCog}
        />
      </div>

      <SettingsSection
        title="Database Connection"
        description="Test the Supabase connection using the residents table."
      >
        <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div
              className={`rounded-2xl p-3 ${
                databaseStatus === "connected"
                  ? "bg-green-100 text-green-700"
                  : databaseStatus === "checking"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {databaseStatus === "checking" ? (
                <Loader2
                  size={23}
                  className="animate-spin"
                />
              ) : (
                <Database size={23} />
              )}
            </div>

            <div>
              <p className="font-black text-slate-900">
                Supabase Database
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Last checked:{" "}
                {formatDateTime(lastDatabaseCheck)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckDatabase}
            disabled={
              databaseStatus === "checking"
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={
                databaseStatus === "checking"
                  ? "animate-spin"
                  : ""
              }
            />
            Test Connection
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Synchronization"
        description="Control automatic synchronization and offline support."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            label="Synchronization Interval"
            value={String(
              settings.syncIntervalMinutes
            )}
            onChange={(value) =>
              onChange(
                "syncIntervalMinutes",
                Number(value)
              )
            }
            options={[
              {
                value: "1",
                label: "Every minute",
              },
              {
                value: "5",
                label: "Every 5 minutes",
              },
              {
                value: "15",
                label: "Every 15 minutes",
              },
              {
                value: "30",
                label: "Every 30 minutes",
              },
            ]}
          />

          <SelectField
            label="Activity Retention"
            value={String(
              settings.retainActivityDays
            )}
            onChange={(value) =>
              onChange(
                "retainActivityDays",
                Number(value)
              )
            }
            options={[
              {
                value: "90",
                label: "90 days",
              },
              {
                value: "180",
                label: "180 days",
              },
              {
                value: "365",
                label: "1 year",
              },
              {
                value: "730",
                label: "2 years",
              },
            ]}
          />
        </div>

        <div className="mt-6 divide-y divide-slate-100">
          <ToggleRow
            icon={RefreshCw}
            title="Automatic synchronization"
            description="Automatically synchronize pending application data."
            checked={settings.automaticSync}
            onChange={(checked) =>
              onChange(
                "automaticSync",
                checked
              )
            }
          />

          <ToggleRow
            icon={WifiOff}
            title="Offline mode"
            description="Allow supported workflows to continue when the network is unavailable."
            checked={settings.offlineMode}
            onChange={(checked) =>
              onChange(
                "offlineMode",
                checked
              )
            }
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Configuration Tools"
        description="Export, import, or reset the application preferences stored on this device."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard
            icon={Download}
            title="Export Settings"
            description="Download a JSON backup of the current configuration."
            buttonText="Export JSON"
            onClick={onExport}
          />

          <ActionCard
            icon={Upload}
            title="Import Settings"
            description="Load settings from a previous La-Cura JSON backup."
            buttonText="Select File"
            onClick={onImport}
          />

          <ActionCard
            icon={RotateCcw}
            title="Reset Settings"
            description="Restore all application preferences to their defaults."
            buttonText="Reset Defaults"
            danger
            onClick={onReset}
          />
        </div>
      </SettingsSection>
    </div>
  );
}

type SettingsPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

function SettingsPageHeader({
  icon: Icon,
  title,
  description,
}: SettingsPageHeaderProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-green-100 p-3 text-green-700">
          <Icon size={26} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">
            {title}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5 md:px-8">
        <h3 className="text-lg font-black text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="p-6 md:p-8">{children}</div>
    </section>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  onChange: (value: string) => void;
};

function TextField({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  onChange: (value: string) => void;
};

function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => {
            const parsedValue = Number(
              event.target.value
            );

            if (!Number.isNaN(parsedValue)) {
              onChange(parsedValue);
            }
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-28 text-slate-900 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

type ToggleRowProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-5 py-5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div
          className={`rounded-xl p-2.5 ${
            checked
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon size={20} />
        </div>

        <div>
          <p className="font-bold text-slate-900">
            {title}
          </p>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-green-100 ${
          checked
            ? "bg-green-700"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

type SystemStatusCardProps = {
  label: string;
  value: string;
  detail: string;
  status: "good" | "error" | "checking";
  icon: LucideIcon;
};

function SystemStatusCard({
  label,
  value,
  detail,
  status,
  icon: Icon,
}: SystemStatusCardProps) {
  const styles = {
    good: {
      background: "bg-green-100",
      text: "text-green-700",
      badge: "bg-green-50 text-green-700",
    },
    error: {
      background: "bg-red-100",
      text: "text-red-700",
      badge: "bg-red-50 text-red-700",
    },
    checking: {
      background: "bg-blue-100",
      text: "text-blue-700",
      badge: "bg-blue-50 text-blue-700",
    },
  };

  const style = styles[status];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`rounded-2xl p-3 ${style.background} ${style.text}`}
        >
          <Icon
            size={23}
            className={
              status === "checking"
                ? "animate-pulse"
                : ""
            }
          />
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
        >
          {label}
        </span>
      </div>

      <p className="mt-5 text-xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {detail}
      </p>
    </article>
  );
}

type ActionCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  danger?: boolean;
  onClick: () => void;
};

function ActionCard({
  icon: Icon,
  title,
  description,
  buttonText,
  danger = false,
  onClick,
}: ActionCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div
        className={`w-fit rounded-xl p-2.5 ${
          danger
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        <Icon size={21} />
      </div>

      <h4 className="mt-4 font-black text-slate-900">
        {title}
      </h4>

      <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className={`mt-5 rounded-xl px-4 py-3 font-bold transition ${
          danger
            ? "border border-red-200 bg-white text-red-700 hover:bg-red-50"
            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        {buttonText}
      </button>
    </article>
  );
}

type ResetSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function ResetSettingsModal({
  open,
  onClose,
  onConfirm,
}: ResetSettingsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-settings-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3">
                <RotateCcw size={25} />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-100">
                  System Configuration
                </p>

                <h2
                  id="reset-settings-title"
                  className="mt-1 text-2xl font-black"
                >
                  Reset Settings
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close reset settings modal"
              className="rounded-xl bg-white/15 p-2 transition hover:bg-white/25"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="p-6">
          <p className="leading-7 text-slate-600">
            This will restore every La-Cura setting
            stored in this browser to its default value.
            This action cannot be undone.
          </p>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800"
          >
            <RotateCcw size={18} />
            Reset All Settings
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}