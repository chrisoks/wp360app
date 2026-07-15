import {
  Bell,
  BriefcaseBusiness,
  Camera,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  Download,
  FolderKanban,
  Home,
  IdCard,
  ListChecks,
  Pause,
  Play,
  Power,
  RefreshCcw,
  Search,
  Send,
  Square,
  Users,
} from "lucide-react";
import { Fragment, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type AppSection = "home" | "time" | "tasks" | "projects" | "appointments" | "planning" | "personal" | "contacts" | "team";

type LoadState = "idle" | "loading" | "ready" | "error";

type Task = {
  id: string;
  titel: string;
  beschreibung?: string;
  status: string;
  prioritaet: string;
  zustaendig?: string;
  zustaendigId?: string;
  faelligkeit?: string;
  kunde?: string;
  projectId?: string;
  projectLabel?: string;
  gewerkId?: string;
  gewerk?: string;
  rolle?: string;
  kundenklasse?: string;
  createdAt?: string;
  createdByName?: string;
  createdById?: string;
  acceptanceStatus?: string;
  rejectionReason?: string;
  autoFeedbackEnabled?: boolean;
  autoFeedbackRecipientId?: string;
  recurrenceEnabled?: boolean;
  recurrenceInterval?: string;
  planningAllocations?: Array<{ date: string; minutes: number }>;
  kommentare?: TaskComment[];
  history?: TaskHistoryEntry[];
  participants?: TaskParticipant[];
  vorgabeMinuten?: number | null;
  gesamtzeitMinuten?: number;
};

type TaskComment = {
  id: string;
  text: string;
  authorName?: string;
  autor?: string;
  recipientUserId?: string;
  recipientName?: string;
  createdAt?: string;
  erstelltAm?: string;
};

type TaskHistoryEntry = {
  id: string;
  event: string;
  actorName?: string;
  note?: string;
  at?: string;
  createdAt?: string;
};

type TaskParticipant = {
  id: string;
  userId?: string;
  name: string;
  userName?: string;
  roleLabel?: string;
  role?: string;
  acceptanceStatus?: string;
  rejectionReason?: string;
};

type TaskFilter = "open" | "mine" | "progress" | "waiting" | "done" | "all";
type TaskDetailTab = "comments" | "participants" | "details" | "history";

type Contact = {
  id: string;
  customerNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  city?: string;
  category?: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  personalNumber?: string;
  roleLabel?: string;
  isActive?: boolean;
  dailyWorkHours?: number;
  profileImageDataUrl?: string;
  salutation?: string;
  birthDate?: string;
  language?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  planningBoard?: string;
  planningGroup?: string;
  weeklyCapacity?: Record<string, number>;
  planningStartTime?: string;
  planningEndTime?: string;
  planningResponsibleFor?: string[];
};

type LoginUser = Pick<User, "id" | "name" | "email" | "profileImageDataUrl" | "personalNumber"> & {
  role?: string;
  roleLabel?: string;
  teamId?: string | null;
  teamIds?: string[];
  dailyWorkHours?: number;
};

type AuthSessionResponse = {
  authenticated?: boolean;
  user?: LoginUser;
};

type Project = {
  id: string;
  projectNumber?: string;
  title: string;
  customer?: string;
  status?: string;
  description?: string;
  trade?: string;
  projectType?: string;
  branch?: string;
  billingInterval?: string;
  projectKind?: string;
  responsibleName?: string;
  projectRuntimeUntil?: string;
  volume?: string;
  timeBudgetHours?: string;
};

type PlanningEntry = {
  id: string;
  source?: string;
  board: string;
  groupName: string;
  userId?: string;
  employeeName?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  title: string;
  description?: string;
  customer?: string;
  projectId?: string;
  projectLabel?: string;
  planningTrade?: string;
  billingCatalogItemId?: string;
  billingCatalogItemLabel?: string;
  billingGroupId?: string;
  offerId?: string;
  offerLineId?: string;
  offerLabel?: string;
  offerTotalMinutes?: number;
  offerPlannedMinutes?: number;
  marketingContentItemId?: string;
  marketingContentScheduleId?: string;
  recurrenceId?: string;
  recurrenceRule?: string;
  approvalStatus?: string;
  requestedByUserId?: string;
  requestedByName?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  deletedAt?: string;
};

type Absence = {
  id: string;
  requestGroupId?: string;
  userId?: string;
  userName: string;
  representativeUserId?: string | null;
  representativeName?: string;
  type: "urlaub" | "krank" | string;
  dayPart?: "full" | "first-half" | "second-half" | string;
  status: string;
  date: string;
  note?: string;
  handoverTaskIds?: string[];
  rejectionReason?: string;
};

type ProjectTimeEntry = {
  id: string;
  mode: "project" | "unproductive";
  projectId: string;
  projectLabel: string;
  userId: string;
  employee: string;
  entrySource: "manual" | "stamped";
  date: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  pauseMs: number;
  comment: string;
  completionStatus?: "" | "finished" | "interrupted";
  overtimeApprovalStatus?: string;
  createdAt?: string;
};

type LogbookAttachment = {
  name: string;
  type: "Bild" | "Dokument";
  mimeType?: string;
  size?: number;
  dataUrl?: string;
};

type ProjectLogbookEntry = {
  id: string;
  projectId: string;
  date?: string;
  title: string;
  text: string;
  author?: string;
  attachments: LogbookAttachment[];
  projectMonth?: string;
};

type StampSession = {
  id: string;
  mode: "project" | "unproductive";
  projectId: string;
  projectLabel: string;
  userId: string;
  employee: string;
  comment?: string;
  startedAt: string;
  accumulatedMs: number;
  pauseStartedAt: string | null;
  pauseMs: number;
  createdAt?: string;
  updatedAt?: string;
};

type SelectedPlanningDay = {
  dateKey: string;
  board: string;
  groupName: string;
};

type StampCompletionAction = "stop" | "switch";
type WorkCompletionStatus = "" | "finished" | "interrupted";
type UpsellAnswer = "no" | "yes";
type PlanningEntryStatus = "active" | "done" | "interrupted" | "open" | "past";
type ProjectPhotoCategory = "Vorherbilder" | "Nachherbilder";
type TimeViewMode = "me" | "team" | "company";
type TimePeriod = "today" | "week" | "month" | "all";
type TimeIssueFilter = "" | "interrupted" | "photos" | "final";
type PlanningDayView = "board" | "workers";

type PendingProjectPhoto = {
  category: ProjectPhotoCategory;
  file: File;
  previewUrl: string;
  projectId: string;
};

type Notification = {
  id: string;
  subject: string;
  body: string;
  channel?: string;
  createdAt: string;
  readAt: string | null;
  taskId?: string | null;
  linkTarget?: string;
  linkTargetId?: string;
  linkLabel?: string;
};

type NotificationHistoryResponse = {
  items: Notification[];
  hasMore: boolean;
  nextOffset: number;
};

type PushPublicKeyResponse = {
  publicKey: string;
};

type PushUiStatus = "idle" | "enabled" | "blocked" | "unsupported";

type ApiData = {
  tasks: Task[];
  contacts: Contact[];
  users: User[];
  projects: Project[];
  planning: PlanningEntry[];
  absences: Absence[];
  timeEntries: ProjectTimeEntry[];
  projectLogbookEntries: ProjectLogbookEntry[];
  notifications: Notification[];
};

const apiBase = import.meta.env.VITE_WORKPILOT_API_BASE?.replace(/\/$/, "") ?? "";
const loginStorageKey = "workpilot360-pwa-login-user";
const loginSessionStorageKey = "workpilot360-pwa-session-login-user";
const finalInspectionItems = [
  "Auftrag vollständig erledigt",
  "Ergebnis sauber und ordentlich",
  "Keine sichtbaren Mängel",
  "Arbeitsbereich sicher und sauber hinterlassen",
  "Material / Geräte mitgenommen",
  "Besonderheiten oder Schäden gemeldet",
];

const sections: Array<{
  id: AppSection;
  label: string;
  icon: typeof Home;
}> = [
  { id: "home", label: "Start", icon: Home },
  { id: "time", label: "Zeit", icon: Clock3 },
  { id: "tasks", label: "Aufgaben", icon: ListChecks },
  { id: "projects", label: "Projekte", icon: FolderKanban },
  { id: "appointments", label: "Meine Termine", icon: CalendarCheck },
  { id: "planning", label: "Planung", icon: CalendarDays },
  { id: "personal", label: "Persönlich", icon: IdCard },
  { id: "team", label: "Team", icon: Users },
  { id: "contacts", label: "Kontakte", icon: BriefcaseBusiness },
];
const mobileSectionIds: AppSection[] = ["home", "time", "tasks", "appointments", "planning", "personal"];

const emptyData: ApiData = {
  tasks: [],
  contacts: [],
  users: [],
  projects: [],
  planning: [],
  absences: [],
  timeEntries: [],
  projectLogbookEntries: [],
  notifications: [],
};

function endpoint(path: string) {
  return `${apiBase}${path}`;
}

class ApiError extends Error {
  status: number;
  path: string;

  constructor(path: string, status: number, message?: string) {
    super(message || `${path}: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

function isApiStatus(error: unknown, status: number) {
  return error instanceof ApiError && error.status === status;
}

async function apiFetch(path: string, init?: RequestInit) {
  return fetch(endpoint(path), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(path, response.status, body?.error || `${path}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(date);
}

function formatFullDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function minutesToHours(minutes?: number | null) {
  if (!minutes) return "0,0 h";
  return `${(minutes / 60).toLocaleString("de-DE", { maximumFractionDigits: 1 })} h`;
}

function millisecondsToHours(milliseconds: number) {
  if (milliseconds > 0 && milliseconds < 60_000) return "unter 1 min";
  if (milliseconds > 0 && milliseconds < 6 * 60_000) {
    return `${Math.max(1, Math.round(milliseconds / 60_000))} min`;
  }
  return `${(milliseconds / 3_600_000).toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} h`;
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function parseServerTimestampMs(value: string | null | undefined, now = Date.now()) {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  if (!Number.isFinite(parsed)) return null;

  if (parsed > now + 60_000) {
    const localOffsetMs = new Date().getTimezoneOffset() * 60_000;
    const timezoneShifted = parsed + localOffsetMs;
    if (timezoneShifted <= now + 60_000) return timezoneShifted;
  }

  return parsed;
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDateKeyValue(value?: string | null) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const german = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (german) {
    return `${german[3]}-${german[2].padStart(2, "0")}-${german[1].padStart(2, "0")}`;
  }

  const germanShort = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (germanShort) {
    return `20${germanShort[3]}-${germanShort[2].padStart(2, "0")}-${germanShort[1].padStart(2, "0")}`;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? text : dateKey(parsed);
}

function timeKey(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function stampTargetProgress(elapsedMs: number, plannedMs: number) {
  if (plannedMs <= 0) return { percent: 0, width: 0, overrun: false };
  const percent = Math.max(0, (elapsedMs / plannedMs) * 100);
  return {
    percent,
    width: Math.min(100, percent),
    overrun: percent > 100,
  };
}

function monthKey(date = new Date()) {
  return dateKey(date).slice(0, 7);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateFromKey(key: string) {
  const normalized = normalizeDateKeyValue(key);
  const parsed = new Date(`${normalized || key}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function shiftDateKey(key: string, days: number) {
  return dateKey(addDays(dateFromKey(key), days));
}

function startOfWeekKey(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  return dateKey(start);
}

function endOfWeekKey(date = new Date()) {
  return shiftDateKey(startOfWeekKey(date), 6);
}

function getDayKey(date: Date) {
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
    date.getDay()
  ];
}

function weekdayLabel(date: Date) {
  return new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(date).replace(".", "");
}

function longDateLabel(value: string) {
  const normalized = normalizeDateKeyValue(value);
  const date = new Date(`${normalized || value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function minutesFromTime(value: string) {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

function dateTimeMs(dayKey: string, time: string) {
  const normalized = normalizeDateKeyValue(dayKey);
  const parsed = new Date(`${normalized || dayKey}T${time}:00`).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function timeRangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  const startAMinutes = minutesFromTime(startA);
  const endAMinutes = minutesFromTime(endA);
  const startBMinutes = minutesFromTime(startB);
  const endBMinutes = minutesFromTime(endB);
  return startAMinutes < endBMinutes && startBMinutes < endAMinutes;
}

function planningKey(board?: string, group?: string) {
  return `${board || "OK solutions"}:${group || "Marketing"}`;
}

function normalizedText(value?: string) {
  return String(value ?? "").trim().toLowerCase();
}

function absenceTypeLabel(type?: string) {
  return normalizedText(type) === "krank" ? "Krank" : "Urlaub";
}

function absenceStatusLabel(status?: string) {
  const value = normalizedText(status);
  if (value === "wartet_vertreter") return "Wartet auf Vertretung";
  if (value === "wartet_geschaeftsfuehrung") return "Wartet auf Freigabe";
  if (value === "genehmigt") return "Genehmigt";
  if (value === "abgelehnt") return "Abgelehnt";
  return status || "-";
}

function absenceDayPartLabel(dayPart?: string) {
  if (dayPart === "first-half") return "1. Halbtag";
  if (dayPart === "second-half") return "2. Halbtag";
  return "Ganztägig";
}

function splitPlanningKey(key: string) {
  const [board = "OK solutions", ...groupParts] = key.split(":");
  return { board, groupName: groupParts.join(":") || "Marketing" };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

async function compressImageForUpload(file: File) {
  const fallback = {
    dataUrl: await readFileAsDataUrl(file),
    mimeType: file.type || "image/jpeg",
    size: file.size,
  };
  if (!file.type.startsWith("image/")) return fallback;

  const image = new Image();
  image.decoding = "async";
  image.src = fallback.dataUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Bild konnte nicht verarbeitet werden."));
  });

  const maxEdge = 1600;
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return fallback;
  context.drawImage(image, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.74);
  if (!dataUrl || dataUrl.length >= fallback.dataUrl.length) return fallback;

  return {
    dataUrl,
    mimeType: "image/jpeg",
    size: Math.ceil((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75),
  };
}

async function readImageAttachment(file: File, name: string): Promise<LogbookAttachment> {
  const image = await compressImageForUpload(file);
  return {
    name: name.toLowerCase().endsWith(".jpg") ? name : `${name}.jpg`,
    type: "Bild",
    mimeType: image.mimeType,
    size: image.size,
    dataUrl: image.dataUrl,
  };
}

function contactName(contact: Contact) {
  return (
    contact.companyName ||
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    contact.email ||
    "Kontakt"
  );
}

function isOpenTask(task: Task) {
  const status = normalizedText(task.status);
  return !["erledigt", "archiviert", "abgelehnt"].includes(status);
}

function isToday(value: string) {
  return normalizeDateKeyValue(value) === dateKey();
}

function isTaskOverdue(task: Task) {
  if (!isOpenTask(task) || !task.faelligkeit) return false;
  const deadline = new Date(task.faelligkeit);
  return !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now();
}

function isTaskDueToday(task: Task) {
  return Boolean(task.faelligkeit && isToday(task.faelligkeit));
}

function taskStatusLabel(task: Task) {
  return task.status || "offen";
}

const TASK_STATUS_ACTIONS = [
  { status: "offen", label: "Offen" },
  { status: "in Bearbeitung", label: "In Bearbeitung" },
  { status: "wartet auf Rückmeldung", label: "Wartet auf Rückmeldung" },
  { status: "erledigt", label: "Erledigt" },
  { status: "abgelehnt", label: "Abgelehnt" },
  { status: "überfällig", label: "Überfällig" },
  { status: "archiviert", label: "Archiviert" },
];

const TASK_QUICK_STATUS_ACTIONS = TASK_STATUS_ACTIONS.filter((action) =>
  ["in bearbeitung", "wartet auf rückmeldung", "erledigt"].includes(normalizedText(action.status))
);

function availableTaskStatusActions(task: Task) {
  const currentStatus = normalizedText(task.status);
  return TASK_QUICK_STATUS_ACTIONS.filter((action) => normalizedText(action.status) !== currentStatus);
}

function toLocalDateTimeInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function defaultTaskDeadline() {
  const deadline = new Date();
  deadline.setHours(17, 0, 0, 0);
  return toLocalDateTimeInputValue(deadline);
}

function buildTaskApiPayload(task: Task, actor: User, nextStatus = task.status) {
  return {
    id: task.id,
    actorId: actor.id,
    title: task.titel,
    description: task.beschreibung ?? "",
    status: nextStatus || "offen",
    priority: task.prioritaet || "normal",
    tradeId: task.gewerkId || null,
    ownerId: task.zustaendigId || actor.id,
    deadline: task.faelligkeit || defaultTaskDeadline(),
    customer: task.kunde || "",
    customerClass: task.kundenklasse || null,
    projectId: task.projectId || null,
    autoFeedbackEnabled: Boolean(task.autoFeedbackEnabled),
    autoFeedbackRecipientId: task.autoFeedbackRecipientId || null,
    recurrenceEnabled: Boolean(task.recurrenceEnabled),
    recurrenceInterval: task.recurrenceInterval || null,
    estimateMinutes: task.vorgabeMinuten ?? null,
    planningAllocations: task.planningAllocations ?? [],
    absenceHandoverTask: false,
  };
}

function taskPriorityLabel(task: Task) {
  return task.prioritaet || "normal";
}

function taskPriorityClass(task: Task) {
  const priority = normalizedText(task.prioritaet);
  if (priority.includes("kritisch")) return "danger";
  if (priority.includes("hoch")) return "warning";
  if (priority.includes("niedrig")) return "positive";
  return "neutral";
}

function statusClass(status?: string) {
  const text = (status ?? "").toLowerCase();
  if (text.includes("erledigt") || text.includes("genehmigt") || text.includes("abgeschlossen")) {
    return "positive";
  }
  if (text.includes("abgelehnt") || text.includes("ueber") || text.includes("über") || text.includes("kritisch")) {
    return "danger";
  }
  if (text.includes("wartet") || text.includes("kunde") || text.includes("angebot")) {
    return "warning";
  }
  return "neutral";
}

function App() {
  const [loginUser, setLoginUser] = useState<LoginUser | null>(() => {
    try {
      const storedUser = localStorage.getItem(loginStorageKey) ?? sessionStorage.getItem(loginSessionStorageKey);
      return storedUser ? (JSON.parse(storedUser) as LoginUser) : null;
    } catch {
      return null;
    }
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>("home");
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<ApiData>(emptyData);
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("open");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [taskDetailTab, setTaskDetailTab] = useState<TaskDetailTab>("comments");
  const [taskCommentText, setTaskCommentText] = useState("");
  const [taskCommentRecipientId, setTaskCommentRecipientId] = useState("");
  const [taskParticipantUserId, setTaskParticipantUserId] = useState("");
  const [taskActionError, setTaskActionError] = useState("");
  const [isTaskSaving, setIsTaskSaving] = useState(false);
  const [session, setSession] = useState<StampSession | null>(null);
  const [timerNow, setTimerNow] = useState(Date.now());
  const [stampMode, setStampMode] = useState<"project" | "unproductive">("project");
  const [stampProjectId, setStampProjectId] = useState("");
  const [stampProjectSearch, setStampProjectSearch] = useState("");
  const [pendingUnproductiveStampComment, setPendingUnproductiveStampComment] = useState("");
  const [pendingUnproductiveStampLabel, setPendingUnproductiveStampLabel] = useState("");
  const [pendingStampStartComment, setPendingStampStartComment] = useState("");
  const [stampStartComment, setStampStartComment] = useState("");
  const [nextStampComment, setNextStampComment] = useState("");
  const [stampComment, setStampComment] = useState("");
  const [stampError, setStampError] = useState("");
  const [homePlanningDateKey, setHomePlanningDateKey] = useState(() => dateKey());
  const [planningWeekStartKey, setPlanningWeekStartKey] = useState(() => startOfWeekKey());
  const [selectedPlanningDay, setSelectedPlanningDay] = useState<SelectedPlanningDay | null>(null);
  const [planningDayView, setPlanningDayView] = useState<PlanningDayView>("board");
  const [reschedulePlanningEntryId, setReschedulePlanningEntryId] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [isReschedulingPlanning, setIsReschedulingPlanning] = useState(false);
  const [approvalPlanningEntryId, setApprovalPlanningEntryId] = useState("");
  const [approvalDate, setApprovalDate] = useState("");
  const [approvalStartTime, setApprovalStartTime] = useState("");
  const [approvalEndTime, setApprovalEndTime] = useState("");
  const [approvalError, setApprovalError] = useState("");
  const [isApprovingPlanning, setIsApprovingPlanning] = useState(false);
  const [selectedAppointmentDayKey, setSelectedAppointmentDayKey] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [notificationSearchTerm, setNotificationSearchTerm] = useState("");
  const [notificationActionError, setNotificationActionError] = useState("");
  const [pendingNotificationTarget, setPendingNotificationTarget] = useState<{ target: string; targetId: string } | null>(null);
  const [pushStatus, setPushStatus] = useState<PushUiStatus>("idle");
  const [pushMessage, setPushMessage] = useState("");
  const [pushDebugInfo, setPushDebugInfo] = useState("");
  const [isPushSaving, setIsPushSaving] = useState(false);
  const [timeViewMode, setTimeViewMode] = useState<TimeViewMode>("me");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [timeIssueFilter, setTimeIssueFilter] = useState<TimeIssueFilter>("");
  const [absenceType, setAbsenceType] = useState<"urlaub" | "krank">("urlaub");
  const [absenceDateFrom, setAbsenceDateFrom] = useState(() => dateKey());
  const [absenceDateTo, setAbsenceDateTo] = useState(() => dateKey());
  const [absenceDayPart, setAbsenceDayPart] = useState<"full" | "first-half" | "second-half">("full");
  const [absenceRepresentativeUserId, setAbsenceRepresentativeUserId] = useState("");
  const [absenceNote, setAbsenceNote] = useState("");
  const [absenceHandoverConfirmed, setAbsenceHandoverConfirmed] = useState(false);
  const [absenceActionError, setAbsenceActionError] = useState("");
  const [absenceActionMessage, setAbsenceActionMessage] = useState("");
  const [isAbsenceSaving, setIsAbsenceSaving] = useState(false);
  const [completionAction, setCompletionAction] = useState<StampCompletionAction | null>(null);
  const [workCompletionStatus, setWorkCompletionStatus] = useState<WorkCompletionStatus>("");
  const [finalInspectionByColleague, setFinalInspectionByColleague] = useState(false);
  const [finalChecklist, setFinalChecklist] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(finalInspectionItems.map((label) => [label, false]))
  );
  const [upsellAnswer, setUpsellAnswer] = useState<UpsellAnswer>("no");
  const [upsellNotes, setUpsellNotes] = useState("");
  const [isCompletingStamp, setIsCompletingStamp] = useState(false);
  const [postProcessEntryId, setPostProcessEntryId] = useState("");
  const [postProcessError, setPostProcessError] = useState("");
  const [isPostProcessing, setIsPostProcessing] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [uploadingPhotoCategory, setUploadingPhotoCategory] = useState<ProjectPhotoCategory | "">("");
  const [photoCaptureTarget, setPhotoCaptureTarget] = useState<{
    category: ProjectPhotoCategory;
    projectId: string;
  } | null>(null);
  const [photoGalleryProjectId, setPhotoGalleryProjectId] = useState("");
  const [pendingProjectPhoto, setPendingProjectPhoto] = useState<PendingProjectPhoto | null>(null);
  const beforePhotoInputRef = useRef<HTMLInputElement>(null);
  const afterPhotoInputRef = useRef<HTMLInputElement>(null);
  const isProjectLogbookLoadingRef = useRef(false);
  const hasProjectLogbookLoadedRef = useRef(false);
  const projectLogbookRequestsRef = useRef(new Map<string, Promise<ProjectLogbookEntry[]>>());
  const reconnectRequestRef = useRef<Promise<void> | null>(null);
  const sessionCheckRequestRef = useRef<Promise<boolean> | null>(null);
  const lastReconnectAttemptRef = useRef(0);
  const [projectLogbookLoadingKeys, setProjectLogbookLoadingKeys] = useState<string[]>([]);

  const activeUser = useMemo(() => {
    return data.users.find((user) => user.id === selectedUserId) ?? data.users[0];
  }, [data.users, selectedUserId]);
  const allowedPlanningKeys = useMemo(() => {
    if (!activeUser) return new Set<string>();
    return new Set(activeUser.planningResponsibleFor ?? []);
  }, [activeUser]);
  const visiblePlanning = useMemo(() => {
    if (!activeUser) return [];
    return data.planning.filter((entry) => allowedPlanningKeys.has(planningKey(entry.board, entry.groupName)));
  }, [activeUser, allowedPlanningKeys, data.planning]);
  const visiblePlanningGroups = useMemo(() => {
    return Array.from(allowedPlanningKeys)
      .map(splitPlanningKey)
      .filter(({ board, groupName }, index, groups) =>
        groups.findIndex((group) => group.board === board && group.groupName === groupName) === index
      );
  }, [allowedPlanningKeys]);

  function persistLoginUser(user: LoginUser) {
    const serializedUser = JSON.stringify(user);
    if (localStorage.getItem(loginStorageKey)) {
      localStorage.setItem(loginStorageKey, serializedUser);
      sessionStorage.removeItem(loginSessionStorageKey);
      return;
    }
    if (sessionStorage.getItem(loginSessionStorageKey)) {
      sessionStorage.setItem(loginSessionStorageKey, serializedUser);
      return;
    }
    localStorage.setItem(loginStorageKey, serializedUser);
  }

  async function clearPwaCaches() {
    if ("caches" in window) {
      const keys = await caches.keys().catch(() => []);
      await Promise.all(keys.filter((key) => key.startsWith("workpilot360-pwa")).map((key) => caches.delete(key))).catch(
        () => undefined
      );
    }
    navigator.serviceWorker?.controller?.postMessage({ type: "WORKPILOT_CLEAR_CACHES" });
  }

  function clearLocalSessionState(message = "") {
    localStorage.removeItem(loginStorageKey);
    sessionStorage.removeItem(loginSessionStorageKey);
    localStorage.removeItem("workpilot360-pwa-stamp-session");
    setIsLogoutDialogOpen(false);
    setLoginUser(null);
    setSelectedUserId("");
    setSession(null);
    setData(emptyData);
    setState("idle");
    setError("");
    setStampError("");
    setActiveSection("home");
    setPendingProjectPhoto(null);
    setPhotoGalleryProjectId("");
    setPhotoCaptureTarget(null);
    setUploadingPhotoCategory("");
    setPhotoUploadError("");
    if (message) setLoginError(message);
    void clearPwaCaches();
  }

  function handleAuthExpired() {
    clearLocalSessionState("Deine Anmeldung ist abgelaufen. Bitte melde dich erneut an.");
  }

  async function validateServerSession() {
    if (!loginUser) return false;
    if (sessionCheckRequestRef.current) return sessionCheckRequestRef.current;

    const request = (async () => {
      try {
        const sessionResponse = await fetchJson<AuthSessionResponse>("/api/auth/session", { cache: "no-store" });
        if (!sessionResponse.authenticated || !sessionResponse.user?.id) {
          handleAuthExpired();
          return false;
        }
        setLoginUser(sessionResponse.user);
        persistLoginUser(sessionResponse.user);
        setLoginError("");
        return true;
      } catch (sessionError) {
        if (isApiStatus(sessionError, 401)) {
          handleAuthExpired();
          return false;
        }
        if (!navigator.onLine) {
          setError("Das Gerät ist offline. Die Verbindung wird erneut geprüft, sobald du wieder online bist.");
          return false;
        }
        setError(
          sessionError instanceof Error
            ? `Verbindung zum Hauptprogramm konnte nicht geprüft werden: ${sessionError.message}`
            : "Verbindung zum Hauptprogramm konnte nicht geprüft werden."
        );
        return false;
      } finally {
        sessionCheckRequestRef.current = null;
      }
    })();

    sessionCheckRequestRef.current = request;
    return request;
  }

  async function loadStampSession(userId = selectedUserId) {
    if (!userId) {
      setSession(null);
      return null;
    }

    try {
      const activeSession = await fetchJson<StampSession | null>(
        `/api/stamp-session?userId=${encodeURIComponent(userId)}`
      );
      setSession(activeSession);
      setStampError("");
      return activeSession;
    } catch (loadError) {
      if (isApiStatus(loadError, 401)) {
        setStampError("Deine Anmeldung ist abgelaufen. Bitte melde dich erneut an.");
        handleAuthExpired();
        return null;
      }
      if (isApiStatus(loadError, 403)) {
        setStampError("Du bist angemeldet, hast aber keine Berechtigung für diesen Stempelstatus.");
        return null;
      }
      setStampError(
        loadError instanceof Error
          ? `Stempelstatus konnte nicht geladen werden: ${loadError.message}`
          : "Stempelstatus konnte nicht geladen werden."
      );
      return null;
    }
  }

  async function loadData(userId = selectedUserId) {
    setState("loading");
    setError("");
    const errors: string[] = [];
    let authExpired = false;
    const safeFetch = async <T,>(path: string, fallback: T): Promise<T> => {
      try {
        return await fetchJson<T>(path);
      } catch (loadError) {
        if (isApiStatus(loadError, 401)) {
          authExpired = true;
          return fallback;
        }
        if (isApiStatus(loadError, 403)) {
          errors.push(`${path}: keine Berechtigung`);
          return fallback;
        }
        errors.push(loadError instanceof Error ? loadError.message : path);
        return fallback;
      }
    };

      const [tasks, users, projects, planning, absences, timeEntries] = await Promise.all([
      safeFetch<Task[]>("/api/tasks", []),
      safeFetch<User[]>("/api/users", []),
      safeFetch<Project[]>("/api/hero/projects", []),
      safeFetch<PlanningEntry[]>("/api/planning-entries", []),
      safeFetch<Absence[]>("/api/absences", []),
      safeFetch<ProjectTimeEntry[]>("/api/project-time-entries", []),
    ]);

    const nextUserId = userId || users[0]?.id || "";
    const notifications = nextUserId
      ? await safeFetch<Notification[]>(
          `/api/notifications?userId=${encodeURIComponent(nextUserId)}`,
          []
        )
      : [];

    if (authExpired) {
      handleAuthExpired();
      return;
    }

    setData((current) => ({
      ...current,
      tasks,
      users,
      projects,
      planning,
      absences,
      timeEntries,
      notifications,
    }));
    setSelectedUserId(nextUserId);
    await loadStampSession(nextUserId);
    if (hasProjectLogbookLoadedRef.current) {
      await loadProjectLogbookEntries(true);
    }
    setError(errors.join(" | "));
    setState("ready");
  }

  async function reconnectMainProgram(force = false) {
    if (!loginUser) return;
    if (reconnectRequestRef.current) {
      await reconnectRequestRef.current;
      return;
    }

    const now = Date.now();
    if (!force && now - lastReconnectAttemptRef.current < 15000) return;

    lastReconnectAttemptRef.current = now;
    const request = (async () => {
      const sessionIsValid = await validateServerSession();
      if (!sessionIsValid) return;
      await loadData(loginUser.id);
    })().finally(() => {
      reconnectRequestRef.current = null;
    });
    reconnectRequestRef.current = request;
    await request;
  }

  async function loadContacts() {
    try {
      const contacts = await fetchJson<Contact[]>("/api/contacts");
      setData((current) => ({ ...current, contacts }));
      setError("");
    } catch (contactsError) {
      if (isApiStatus(contactsError, 401)) {
        handleAuthExpired();
        return;
      }
      setError(contactsError instanceof Error ? contactsError.message : "Kontakte konnten nicht geladen werden.");
    }
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = loginEmail.trim();
    if (!email || !loginPassword) {
      setLoginError("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: loginPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "E-Mail oder Passwort ist nicht korrekt.");
      }
      const user = (await response.json()) as LoginUser;
      const serializedUser = JSON.stringify(user);
      if (rememberLogin) {
        localStorage.setItem(loginStorageKey, serializedUser);
        sessionStorage.removeItem(loginSessionStorageKey);
      } else {
        sessionStorage.setItem(loginSessionStorageKey, serializedUser);
        localStorage.removeItem(loginStorageKey);
      }
      setLoginUser(user);
      setLoginPassword("");
      await loadData(user.id);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login ist fehlgeschlagen.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    clearLocalSessionState("");
  }

  async function refreshPlanningData() {
    try {
      const planning = await fetchJson<PlanningEntry[]>("/api/planning-entries");
      setData((current) => ({ ...current, planning }));
      setError("");
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Planung konnte nicht aktualisiert werden.");
    }
  }

  async function refreshHomePlanningData() {
    await Promise.all([refreshPlanningData(), loadProjectLogbookEntries(true)]);
  }

  async function loadNotifications(options: { history?: boolean; search?: string } = {}) {
    const userId = selectedUserId || loginUser?.id || "";
    if (!userId) return [];

    const params = new URLSearchParams({ userId });
    if (options.history) {
      params.set("history", "true");
      params.set("limit", "50");
    }
    if (options.search?.trim()) params.set("search", options.search.trim());

    try {
      const result = options.history
        ? await fetchJson<NotificationHistoryResponse>(`/api/notifications?${params.toString()}`)
        : await fetchJson<Notification[]>(`/api/notifications?${params.toString()}`);
      const notifications = Array.isArray(result) ? result : result.items;
      setData((current) => ({ ...current, notifications }));
      setNotificationActionError("");
      return notifications;
    } catch (notificationError) {
      setNotificationActionError(
        notificationError instanceof Error
          ? notificationError.message
          : "Benachrichtigungen konnten nicht geladen werden."
      );
      return [];
    }
  }

  async function markNotificationsRead() {
    const userId = selectedUserId || loginUser?.id || "";
    if (!userId) return;

    try {
      await fetchJson("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await loadNotifications({ history: showNotificationHistory, search: notificationSearchTerm });
    } catch (markError) {
      setNotificationActionError(
        markError instanceof Error ? markError.message : "Benachrichtigungen konnten nicht gelesen markiert werden."
      );
    }
  }

  function supportsPushNotifications() {
    return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  }

  async function refreshPushStatus() {
    if (!supportsPushNotifications()) {
      setPushStatus("unsupported");
      setPushMessage("Push wird auf diesem Gerät oder in diesem Browser nicht unterstützt.");
      return;
    }

    if (window.Notification.permission === "denied") {
      setPushStatus("blocked");
      setPushMessage("Push ist im Browser blockiert. Bitte in den Geräteeinstellungen erlauben.");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushStatus(subscription ? "enabled" : "idle");
      setPushMessage(subscription ? "Pushbenachrichtigungen sind für dieses Gerät aktiv." : "");
    } catch {
      setPushStatus("idle");
      setPushMessage("");
    }
  }

  async function enablePushNotifications() {
    const userId = selectedUserId || loginUser?.id || "";
    if (!userId) {
      setPushMessage("Bitte erst einloggen.");
      return;
    }

    if (!supportsPushNotifications()) {
      setPushStatus("unsupported");
      setPushMessage("Push wird auf diesem Gerät oder in diesem Browser nicht unterstützt.");
      return;
    }

    setIsPushSaving(true);
    setPushMessage("");
    setPushDebugInfo("");

    try {
      const permission =
        window.Notification.permission === "default"
          ? await window.Notification.requestPermission()
          : window.Notification.permission;

      if (permission !== "granted") {
        setPushStatus(permission === "denied" ? "blocked" : "idle");
        setPushMessage("Push wurde nicht erlaubt.");
        return;
      }

      const { publicKey } = await fetchJson<PushPublicKeyResponse>("/api/push/public-key");
      const normalizedPublicKey = publicKey.trim();
      if (!normalizedPublicKey) throw new Error("Push-Schlüssel fehlt.");
      const publicKeyBytes = urlBase64ToUint8Array(normalizedPublicKey);
      const debugPrefix = `Push-Diagnose v5: key=${normalizedPublicKey.length} Zeichen, bytes=${publicKeyBytes.byteLength}, first=${publicKeyBytes[0] ?? "?"}, last=${publicKeyBytes[publicKeyBytes.byteLength - 1] ?? "?"}`;
      setPushDebugInfo(`${debugPrefix}, weg=vor subscribe`);

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      let subscription = existingSubscription;
      if (!subscription) {
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKeyBytes.buffer.slice(
              publicKeyBytes.byteOffset,
              publicKeyBytes.byteOffset + publicKeyBytes.byteLength
            ),
          });
          setPushDebugInfo(`${debugPrefix}, weg=ArrayBuffer`);
        } catch (arrayBufferKeyError) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKeyBytes,
          } as PushSubscriptionOptionsInit);
          setPushDebugInfo(
            `${debugPrefix}, weg=Uint8Array, erster Fehler=${
              arrayBufferKeyError instanceof Error ? arrayBufferKeyError.message : "unbekannt"
            }`
          );
        }
      } else {
        setPushDebugInfo(`${debugPrefix}, weg=existing`);
      }

      await fetchJson("/api/push/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      setPushStatus("enabled");
      setPushMessage("Pushbenachrichtigungen sind für dieses Gerät aktiv.");
    } catch (pushError) {
      setPushStatus("idle");
      setPushMessage(
        pushError instanceof Error && pushError.message.includes("/api/push")
          ? "Push ist in der PWA vorbereitet. Das Hauptprogramm muss die Push-Endpunkte noch bereitstellen."
          : pushError instanceof Error
            ? pushError.message
            : "Push konnte nicht aktiviert werden."
      );
      setPushDebugInfo((current) => current || "Push-Diagnose v4: Aktivierung vor Diagnose abgebrochen.");
    } finally {
      setIsPushSaving(false);
    }
  }

  function mergeProjectLogbookEntry(existing: ProjectLogbookEntry | undefined, incoming: ProjectLogbookEntry) {
    if (!existing) return incoming;

    return {
      ...existing,
      ...incoming,
      attachments: incoming.attachments.map((attachment, index) => {
        if (attachment.dataUrl) return attachment;
        const existingAttachment =
          existing.attachments[index]?.name === attachment.name
            ? existing.attachments[index]
            : existing.attachments.find((item) => item.name === attachment.name);
        return existingAttachment?.dataUrl ? { ...attachment, dataUrl: existingAttachment.dataUrl } : attachment;
      }),
    };
  }

  function mergeProjectLogbookEntries(
    current: ProjectLogbookEntry[],
    incoming: ProjectLogbookEntry[],
    options: { replaceAll?: boolean; projectId?: string } = {}
  ) {
    const existingById = new Map(current.map((entry) => [entry.id, entry]));
    const mergedIncoming = incoming.map((entry) => mergeProjectLogbookEntry(existingById.get(entry.id), entry));
    if (options.replaceAll) return mergedIncoming;

    const incomingIds = new Set(incoming.map((entry) => entry.id));
    const remaining = current.filter((entry) => {
      if (incomingIds.has(entry.id)) return false;
      if (options.projectId && entry.projectId === options.projectId) return false;
      return true;
    });
    return [...mergedIncoming, ...remaining];
  }

  async function loadProjectLogbookEntries(force = false, projectId = "") {
    const requestKey = projectId ? `project:${projectId}` : "summary";
    if (!force && !projectId && hasProjectLogbookLoadedRef.current) return data.projectLogbookEntries;
    const existingRequest = projectLogbookRequestsRef.current.get(requestKey);
    if (existingRequest) return existingRequest;

    isProjectLogbookLoadingRef.current = true;
    setProjectLogbookLoadingKeys((current) => (current.includes(requestKey) ? current : [...current, requestKey]));

    const request = (async () => {
      const params = new URLSearchParams();
      const actorId = activeUser?.id || selectedUserId || loginUser?.id || "";
      if (actorId) params.set("actorId", actorId);
      if (projectId) {
        params.set("projectId", projectId);
      } else {
        params.set("summary", "1");
      }
      const entries = await fetchJson<ProjectLogbookEntry[]>(`/api/project-logbook-entries?${params.toString()}`);
      hasProjectLogbookLoadedRef.current = true;
      setData((current) => ({
        ...current,
        projectLogbookEntries: mergeProjectLogbookEntries(current.projectLogbookEntries, entries, {
          replaceAll: !projectId,
          projectId,
        }),
      }));
      setError("");
      return entries;
    })();

    projectLogbookRequestsRef.current.set(requestKey, request);
    try {
      return await request;
    } catch (loadError) {
      if (isApiStatus(loadError, 401)) handleAuthExpired();
      else setError(loadError instanceof Error ? loadError.message : "Projektlogbuch konnte nicht geladen werden.");
      return data.projectLogbookEntries;
    } finally {
      projectLogbookRequestsRef.current.delete(requestKey);
      isProjectLogbookLoadingRef.current = projectLogbookRequestsRef.current.size > 0;
      setProjectLogbookLoadingKeys((current) => current.filter((key) => key !== requestKey));
    }
  }

  useEffect(() => {
    if (!loginUser) return;
    void validateServerSession().then((sessionIsValid) => {
      if (sessionIsValid) void loadData(loginUser.id);
    });
  }, []);

  useEffect(() => {
    if (!loginUser) return;

    const reconnectWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void reconnectMainProgram();
      }
    };
    const reconnectWhenFocused = () => {
      void reconnectMainProgram();
    };
    const reconnectWhenOnline = () => {
      void reconnectMainProgram(true);
    };

    document.addEventListener("visibilitychange", reconnectWhenVisible);
    window.addEventListener("focus", reconnectWhenFocused);
    window.addEventListener("online", reconnectWhenOnline);

    return () => {
      document.removeEventListener("visibilitychange", reconnectWhenVisible);
      window.removeEventListener("focus", reconnectWhenFocused);
      window.removeEventListener("online", reconnectWhenOnline);
    };
  }, [loginUser?.id]);

  useEffect(() => {
    if (!selectedUserId || state === "idle") return;
    void loadNotifications();
    loadStampSession(selectedUserId);
    void refreshPushStatus();
  }, [selectedUserId, state]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type !== "WORKPILOT_NOTIFICATION_CLICK") return;
      const target = event.data.target || "";
      const targetId = event.data.targetId || "";
      if (!target || !targetId) return;
      setPendingNotificationTarget({ target, targetId });
      void reconnectMainProgram(true);
    };
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
  }, [loginUser?.id]);

  useEffect(() => {
    if (!pendingNotificationTarget || state !== "ready") return;
    const target = pendingNotificationTarget;
    void openNotificationTargetData(target.target, target.targetId).finally(() => {
      setPendingNotificationTarget((current) =>
        current?.target === target.target && current.targetId === target.targetId ? null : current
      );
    });
  }, [pendingNotificationTarget, state, data.tasks.length, data.planning.length, data.projects.length]);

  useEffect(() => {
    if (state !== "ready") return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get("target") || "";
    const targetId = params.get("targetId") || "";
    if (!target || !targetId) return;

    void openNotificationTargetData(target, targetId);
    params.delete("target");
    params.delete("targetId");
    const nextSearch = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`);
  }, [state, data.tasks.length, data.planning.length, data.projects.length]);

  useEffect(() => {
    if (!selectedUserId || state === "idle") return;
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [selectedUserId, state]);

  useEffect(() => {
    if (!activeUser) return;
    setAbsenceRepresentativeUserId((current) => {
      if (current && current !== activeUser.id) return current;
      return data.users.find((user) => user.id !== activeUser.id && user.isActive !== false)?.id ?? "";
    });
  }, [activeUser?.id, data.users]);

  useEffect(() => {
    localStorage.removeItem("workpilot360-pwa-stamp-session");
  }, []);

  useEffect(() => {
    if (!session) return;
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [session]);

  useEffect(() => {
    if (!selectedUserId) return;
    const intervalId = window.setInterval(() => {
      loadStampSession(selectedUserId);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId || activeSection !== "home") return;
    void loadProjectLogbookEntries(true);
    const intervalId = window.setInterval(() => {
      void refreshHomePlanningData();
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [activeSection, selectedUserId]);

  useEffect(() => {
    if (activeSection !== "home") return;
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), 15_000);
    return () => window.clearInterval(intervalId);
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "projects" || !selectedProjectId) return;
    void loadProjectLogbookEntries(true, selectedProjectId);
  }, [activeSection, selectedProjectId]);

  useEffect(() => {
    if (!session || session.mode !== "project" || !session.projectId) return;
    void loadProjectLogbookEntries(true);
  }, [session?.mode, session?.projectId]);

  useEffect(() => {
    if (!session || session.mode !== "project" || !session.projectId) return;
    const intervalId = window.setInterval(() => {
      void loadProjectLogbookEntries(true);
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [session?.mode, session?.projectId]);

  useEffect(() => {
    if (activeSection !== "time") return;
    void loadProjectLogbookEntries(true);
  }, [activeSection, selectedUserId]);

  useEffect(() => {
    if (activeSection !== "contacts" || data.contacts.length > 0) return;
    void loadContacts();
  }, [activeSection, data.contacts.length]);

  useEffect(() => {
    return () => {
      if (pendingProjectPhoto?.previewUrl) URL.revokeObjectURL(pendingProjectPhoto.previewUrl);
    };
  }, [pendingProjectPhoto?.previewUrl]);

  useEffect(() => {
    if (stampProjectId && !data.projects.some((project) => project.id === stampProjectId)) {
      setStampProjectId("");
    }
  }, [data.projects, stampProjectId]);

  useEffect(() => {
    if (session) setStampProjectId("");
  }, [session?.id]);

  useEffect(() => {
    if (session?.mode === "unproductive") setStampMode("project");
  }, [session?.mode]);

  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.tasks.filter((task) => {
      if (!normalized) return true;
      return [task.titel, task.kunde, task.projectLabel, task.gewerk, task.zustaendig, task.status, task.prioritaet]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [data.tasks, query]);
  const selectedTask = useMemo(() => {
    return data.tasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [data.tasks, selectedTaskId]);
  const selectedTaskParticipantIds = useMemo(() => {
    if (!selectedTask) return new Set<string>();
    return new Set([
      selectedTask.zustaendigId,
      ...(selectedTask.participants ?? []).map((participant) => participant.userId).filter(Boolean),
    ]);
  }, [selectedTask]);
  const selectedTaskAssignableUsers = useMemo(() => {
    if (!selectedTask) return [];
    return data.users.filter((user) => user.isActive !== false && !selectedTaskParticipantIds.has(user.id));
  }, [data.users, selectedTask, selectedTaskParticipantIds]);
  const selectedTaskCommentRecipients = useMemo(() => {
    if (!selectedTask) return [];
    const participants = selectedTask.participants ?? [];
    return participants
      .map((participant) => ({
        id: participant.userId ?? "",
        name: participant.name || participant.userName || "Beteiligte Person",
      }))
      .filter((participant) => participant.id);
  }, [selectedTask]);
  const getTaskUserAcceptanceStatus = (task: Task) => {
    if (!activeUser) return "accepted";
    if (task.zustaendigId === activeUser.id || normalizedText(task.zustaendig) === normalizedText(activeUser.name)) {
      return task.acceptanceStatus || "accepted";
    }
    const participant = (task.participants ?? []).find(
      (item) => item.userId === activeUser.id || normalizedText(item.name || item.userName) === normalizedText(activeUser.name)
    );
    return participant?.acceptanceStatus || "accepted";
  };
  const canRespondToTask = (task: Task) => getTaskUserAcceptanceStatus(task) === "pending";
  const openTaskDetail = (taskId: string) => {
    setTaskDetailTab("comments");
    setSelectedTaskId(taskId);
  };
  const taskFilterOptions = useMemo(() => {
    const activeUserName = normalizedText(activeUser?.name);
    const activeUserId = activeUser?.id ?? "";
    const isMine = (task: Task) =>
      Boolean(activeUserId && task.zustaendigId === activeUserId) ||
      Boolean(activeUserName && normalizedText(task.zustaendig) === activeUserName);

    return [
      { id: "open" as TaskFilter, label: "Offen", count: filteredTasks.filter(isOpenTask).length },
      { id: "mine" as TaskFilter, label: "Meine", count: filteredTasks.filter(isMine).length },
      {
        id: "progress" as TaskFilter,
        label: "Arbeit",
        count: filteredTasks.filter((task) => normalizedText(task.status) === "in bearbeitung").length,
      },
      {
        id: "waiting" as TaskFilter,
        label: "Wartet",
        count: filteredTasks.filter((task) => normalizedText(task.status).includes("wartet")).length,
      },
      {
        id: "done" as TaskFilter,
        label: "Erledigt",
        count: filteredTasks.filter((task) => normalizedText(task.status) === "erledigt").length,
      },
      { id: "all" as TaskFilter, label: "Alle", count: filteredTasks.length },
    ];
  }, [activeUser, filteredTasks]);
  const visibleTasks = useMemo(() => {
    const activeUserName = normalizedText(activeUser?.name);
    const activeUserId = activeUser?.id ?? "";
    const isMine = (task: Task) =>
      Boolean(activeUserId && task.zustaendigId === activeUserId) ||
      Boolean(activeUserName && normalizedText(task.zustaendig) === activeUserName);

    const byFilter = filteredTasks.filter((task) => {
      const status = normalizedText(task.status);
      if (taskFilter === "mine") return isMine(task);
      if (taskFilter === "progress") return status === "in bearbeitung";
      if (taskFilter === "waiting") return status.includes("wartet");
      if (taskFilter === "done") return status === "erledigt";
      if (taskFilter === "all") return true;
      return isOpenTask(task);
    });

    return [...byFilter].sort((a, b) => {
      const aOverdue = isTaskOverdue(a) ? 0 : 1;
      const bOverdue = isTaskOverdue(b) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      const aDue = a.faelligkeit ? new Date(a.faelligkeit).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.faelligkeit ? new Date(b.faelligkeit).getTime() : Number.MAX_SAFE_INTEGER;
      if (aDue !== bDue) return aDue - bDue;
      return a.titel.localeCompare(b.titel);
    });
  }, [activeUser, filteredTasks, taskFilter]);
  const taskSummary = useMemo(() => {
    const open = filteredTasks.filter(isOpenTask);
    return {
      open: open.length,
      overdue: open.filter(isTaskOverdue).length,
      dueToday: open.filter(isTaskDueToday).length,
      critical: open.filter((task) => normalizedText(task.prioritaet).includes("kritisch")).length,
    };
  }, [filteredTasks]);

  const filteredContacts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return data.contacts.filter((contact) => {
      return [
        contactName(contact),
        contact.email,
        contact.phone,
        contact.mobile,
        contact.city,
        contact.customerNumber,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [data.contacts, query]);

  const todaysPlanning = visiblePlanning
    .filter((entry) => isToday(entry.date))
    .sort((a, b) => `${a.startTime}${a.title}`.localeCompare(`${b.startTime}${b.title}`));
  const activeUserDayPlanning = data.planning
    .filter((entry) => {
      if (entry.deletedAt) return false;
      if (normalizeDateKeyValue(entry.date) !== homePlanningDateKey) return false;
      const entryData = entry as PlanningEntry & { employee?: string; workerName?: string; assignedUserName?: string };
      const activeUserName = normalizedText(activeUser?.name);
      return (
        Boolean(activeUser?.id && entry.userId === activeUser.id) ||
        Boolean(activeUserName && normalizedText(entry.employeeName) === activeUserName) ||
        Boolean(activeUserName && normalizedText(entryData.employee) === activeUserName) ||
        Boolean(activeUserName && normalizedText(entryData.workerName) === activeUserName) ||
        Boolean(activeUserName && normalizedText(entryData.assignedUserName) === activeUserName)
      );
    })
    .sort((a, b) => `${a.startTime}${a.title}`.localeCompare(`${b.startTime}${b.title}`));
  const currentPlanningEntry = activeUserDayPlanning.find((entry) => isPlanningEntryForActiveSession(entry));
  const normalizedStampProjectSearch = normalizedText(stampProjectSearch);
  const stampProjectResults = data.projects
    .filter((project) => {
      if (!normalizedStampProjectSearch) return false;
      return normalizedText(
        [
          project.projectNumber,
          project.title,
          project.customer,
          project.trade,
          project.description,
          project.responsibleName,
        ]
          .filter(Boolean)
          .join(" ")
      ).includes(normalizedStampProjectSearch);
    })
    .slice(0, 8);
  const switchReferenceMinutes = currentPlanningEntry
    ? minutesFromTime(currentPlanningEntry.endTime)
    : minutesFromTime(timeKey(new Date(timerNow)));
  const switchPlanningSuggestions = activeUserDayPlanning
    .filter((entry) => getPlanningEntryStatus(entry) === "open")
    .filter((entry) => minutesFromTime(entry.startTime) >= switchReferenceMinutes || dateTimeMs(entry.date, entry.endTime)! >= timerNow)
    .slice(0, 4);
  const openTasks = data.tasks.filter(isOpenTask);
  const overdueTasks = openTasks.filter((task) => {
    if (!task.faelligkeit) return false;
    const date = new Date(task.faelligkeit);
    return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
  });
  const sortedNotifications = [...data.notifications].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
  const unreadNotifications = sortedNotifications.filter((notification) => !notification.readAt);
  const visibleNotifications = sortedNotifications.filter((notification) => {
    const search = normalizedText(notificationSearchTerm);
    if (!search) return true;
    return normalizedText(`${notification.subject} ${notification.body}`).includes(search);
  });
  const selectedUserTimeEntries = data.timeEntries.filter(
    (entry) => entry.userId === activeUser?.id || entry.employee === activeUser?.name
  );
  const activeUserRole = normalizedText(activeUser?.roleLabel || loginUser?.roleLabel);
  const canUseCompanyTimeView =
    activeUserRole.includes("geschäft") ||
    activeUserRole.includes("geschaeft") ||
    activeUserRole.includes("admin");
  const canUseTeamTimeView =
    canUseCompanyTimeView ||
    activeUserRole.includes("führung") ||
    activeUserRole.includes("fuehrung") ||
    activeUserRole.includes("leitung") ||
    Boolean(activeUser?.planningResponsibleFor?.length);
  const canUsePlanningSection = canUseCompanyTimeView || canUseTeamTimeView;
  const visibleSections = sections.filter((section) => section.id !== "planning" || canUsePlanningSection);
  const mobileSections = visibleSections.filter((section) => mobileSectionIds.includes(section.id));
  useEffect(() => {
    if (activeSection === "planning" && !canUsePlanningSection) {
      setActiveSection("appointments");
      setSelectedPlanningDay(null);
    }
  }, [activeSection, canUsePlanningSection]);
  const availableTimeViews: TimeViewMode[] = [
    "me",
    ...(canUseTeamTimeView ? (["team"] as TimeViewMode[]) : []),
    ...(canUseCompanyTimeView ? (["company"] as TimeViewMode[]) : []),
  ];
  const effectiveTimeViewMode = availableTimeViews.includes(timeViewMode) ? timeViewMode : "me";
  const teamTimeUsers = data.users.filter((user) => {
    if (!activeUser || user.isActive === false) return false;
    if (user.id === activeUser.id) return true;
    if (canUseCompanyTimeView) return true;
    const userPlanningKey = planningKey(user.planningBoard, user.planningGroup);
    return (
      allowedPlanningKeys.has(userPlanningKey) ||
      (Boolean(activeUser.planningBoard) &&
        activeUser.planningBoard === user.planningBoard &&
        activeUser.planningGroup === user.planningGroup)
    );
  });
  const timeViewUsers =
    effectiveTimeViewMode === "company"
      ? data.users.filter((user) => user.isActive !== false)
      : effectiveTimeViewMode === "team"
        ? teamTimeUsers
        : activeUser
          ? [activeUser]
          : [];
  const timeViewUserIds = new Set(timeViewUsers.map((user) => user.id));
  const timeViewUserNames = new Set(timeViewUsers.map((user) => normalizedText(user.name)));
  const timeViewEntries = data.timeEntries.filter(
    (entry) => timeViewUserIds.has(entry.userId) || timeViewUserNames.has(normalizedText(entry.employee))
  );
  const todayTimeEntries = selectedUserTimeEntries
    .filter((entry) => normalizeDateKeyValue(entry.date) === dateKey())
    .sort((first, second) => first.startTime.localeCompare(second.startTime));
  const currentMonthEntries = selectedUserTimeEntries.filter((entry) =>
    normalizeDateKeyValue(entry.date).startsWith(monthKey())
  );
  const timeTodayEntries = timeViewEntries.filter((entry) => normalizeDateKeyValue(entry.date) === dateKey());
  const timeWeekEntries = timeViewEntries.filter((entry) => {
    const key = normalizeDateKeyValue(entry.date);
    return key >= startOfWeekKey() && key <= endOfWeekKey();
  });
  const timeMonthEntries = timeViewEntries.filter((entry) => normalizeDateKeyValue(entry.date).startsWith(monthKey()));
  const timeEntryNetMs = (entry: ProjectTimeEntry) => getStoredTimeEntryDurationMs(entry);
  const timeTodayMs = timeTodayEntries.reduce((sum, entry) => sum + timeEntryNetMs(entry), 0);
  const timeWeekMs = timeWeekEntries.reduce((sum, entry) => sum + timeEntryNetMs(entry), 0);
  const timeMonthMs = timeMonthEntries.reduce((sum, entry) => sum + timeEntryNetMs(entry), 0);
  const productiveMonthMs = timeMonthEntries
    .filter((entry) => entry.mode === "project")
    .reduce((sum, entry) => sum + timeEntryNetMs(entry), 0);
  const unproductiveMonthMs = Math.max(0, timeMonthMs - productiveMonthMs);
  const timeEntryNeedsPhotoDocumentation = (entry: ProjectTimeEntry) => {
    if (entry.mode !== "project" || !entry.projectId) return false;
    if (!canUseProjectPhotos(entry.projectId)) return false;
    const counts = getProjectPhotoCounts(entry.projectId);
    return counts.before === 0 || counts.after === 0;
  };
  const timeEntryNeedsFinalInspectionReview = (entry: ProjectTimeEntry) =>
    entry.mode === "project" && !["finished", "interrupted"].includes(entry.completionStatus || "");
  const timeEntryList = [...timeViewEntries].sort((first, second) => {
    const dateCompare = normalizeDateKeyValue(second.date).localeCompare(normalizeDateKeyValue(first.date));
    return dateCompare || second.startTime.localeCompare(first.startTime);
  });
  const baseTimePeriodEntries = timeEntryList.filter((entry) => {
    const entryDateKey = normalizeDateKeyValue(entry.date);
    if (timePeriod === "today") return entryDateKey === dateKey();
    if (timePeriod === "week") return entryDateKey >= startOfWeekKey() && entryDateKey <= endOfWeekKey();
    if (timePeriod === "month") return entryDateKey.startsWith(monthKey());
    return true;
  });
  const interruptedTimeEntries = baseTimePeriodEntries.filter((entry) => entry.completionStatus === "interrupted");
  const photoDocumentationTimeEntries = baseTimePeriodEntries.filter(timeEntryNeedsPhotoDocumentation);
  const finalInspectionReviewTimeEntries = baseTimePeriodEntries.filter(timeEntryNeedsFinalInspectionReview);
  const timePeriodEntries = baseTimePeriodEntries.filter((entry) => {
    if (timeIssueFilter === "interrupted") return entry.completionStatus === "interrupted";
    if (timeIssueFilter === "photos") return timeEntryNeedsPhotoDocumentation(entry);
    if (timeIssueFilter === "final") return timeEntryNeedsFinalInspectionReview(entry);
    return true;
  });
  const groupEntriesByDay = (entries: ProjectTimeEntry[]) => {
    const groups = new Map<string, ProjectTimeEntry[]>();
    entries.forEach((entry) => {
      const key = normalizeDateKeyValue(entry.date);
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    });
    return [...groups.entries()]
      .sort(([first], [second]) => second.localeCompare(first))
      .map(([key, entriesForDay]) => {
        const sortedEntries = [...entriesForDay].sort((first, second) => first.startTime.localeCompare(second.startTime));
        const projectMs = sortedEntries
          .filter((entry) => entry.mode === "project")
          .reduce((sum, entry) => sum + timeEntryNetMs(entry), 0);
        const unproductiveMs = sortedEntries
          .filter((entry) => entry.mode === "unproductive")
          .reduce((sum, entry) => sum + timeEntryNetMs(entry), 0);
        return {
          key,
          entries: sortedEntries,
          projectMs,
          unproductiveMs,
          totalMs: projectMs + unproductiveMs,
        };
      });
  };
  const timeDayGroups = groupEntriesByDay(timePeriodEntries);
  const timeEmployeeGroups =
    effectiveTimeViewMode === "me"
      ? []
      : timeViewUsers
          .map((user) => {
            const userEntries = timePeriodEntries.filter(
              (entry) => entry.userId === user.id || normalizedText(entry.employee) === normalizedText(user.name)
            );
            const dayGroups = groupEntriesByDay(userEntries);
            return {
              user,
              entries: userEntries,
              dayGroups,
              totalMs: userEntries.reduce((sum, entry) => sum + timeEntryNetMs(entry), 0),
            };
          })
          .filter((group) => group.entries.length > 0);
  const teamTimeRows = timeViewUsers.map((user) => {
    const userEntries = data.timeEntries.filter(
      (entry) => entry.userId === user.id || normalizedText(entry.employee) === normalizedText(user.name)
    );
    const monthEntries = userEntries.filter((entry) => normalizeDateKeyValue(entry.date).startsWith(monthKey()));
    const projectMs = monthEntries
      .filter((entry) => entry.mode === "project")
      .reduce((sum, entry) => sum + timeEntryNetMs(entry), 0);
    const unproductiveMs = monthEntries
      .filter((entry) => entry.mode === "unproductive")
      .reduce((sum, entry) => sum + timeEntryNetMs(entry), 0);
    const activeStamp = session?.userId === user.id;
    return {
      user,
      activeStamp,
      projectMs,
      unproductiveMs,
      totalMs: projectMs + unproductiveMs,
      interruptedCount: userEntries.filter((entry) => entry.completionStatus === "interrupted").length,
      missingCommentCount: userEntries.filter((entry) => !entry.comment?.trim()).length,
    };
  });
  const personalTasks = data.tasks.filter(
    (task) => task.zustaendigId === activeUser?.id || task.zustaendig === activeUser?.name
  );
  const openPersonalTasks = personalTasks.filter(isOpenTask);
  const personalAbsences = data.absences.filter(
    (absence) => absence.userId === activeUser?.id || absence.userName === activeUser?.name
  );
  const approvedVacationDays = personalAbsences.filter(
    (absence) => absence.type === "urlaub" && absence.status === "genehmigt"
  ).length;
  const remainingVacationDays = Math.max(0, 30 - approvedVacationDays);
  const upcomingTeamAbsences = data.absences
    .filter((absence) => normalizeDateKeyValue(absence.date) >= dateKey())
    .sort((a, b) => normalizeDateKeyValue(a.date).localeCompare(normalizeDateKeyValue(b.date)));
  const colleagueVacationAbsences = upcomingTeamAbsences.filter(
    (absence) => absence.type === "urlaub" && absence.userId !== activeUser?.id && absence.userName !== activeUser?.name
  );
  const representativeOptions = data.users.filter(
    (user) => user.id !== activeUser?.id && user.isActive !== false
  );
  const activeTeamUsers = useMemo(() => {
    const byId = new Map<string, User>();
    data.users.forEach((user) => {
      if (user.isActive === false || byId.has(user.id)) return;
      byId.set(user.id, user);
    });
    return [...byId.values()].sort((first, second) => first.name.localeCompare(second.name, "de"));
  }, [data.users]);
  const todayWorkedMs = todayTimeEntries.reduce(
    (sum, entry) => sum + Math.max(0, entry.durationMs - entry.pauseMs),
    0
  );
  const monthWorkedMs = currentMonthEntries.reduce(
    (sum, entry) => sum + Math.max(0, entry.durationMs - entry.pauseMs),
    0
  );
  const sessionElapsedMs = session
    ? session.accumulatedMs +
      (session.pauseStartedAt
        ? 0
        : Math.max(0, timerNow - (parseServerTimestampMs(session.startedAt, timerNow) ?? timerNow)))
    : 0;
  const sessionPauseMs = session
    ? session.pauseMs +
      (session.pauseStartedAt
        ? Math.max(0, timerNow - (parseServerTimestampMs(session.pauseStartedAt, timerNow) ?? timerNow))
        : 0)
    : 0;
  const postProcessEntry = data.timeEntries.find((entry) => entry.id === postProcessEntryId) ?? null;
  const selectedStampProject = data.projects.find((project) => project.id === stampProjectId);
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId);
  const photoGalleryProject = data.projects.find((project) => project.id === photoGalleryProjectId);
  const reschedulePlanningEntry = data.planning.find((entry) => entry.id === reschedulePlanningEntryId) ?? null;
  const approvalPlanningEntry = data.planning.find((entry) => entry.id === approvalPlanningEntryId) ?? null;
  const approvalConflicts = approvalPlanningEntry
    ? data.planning.filter((entry) => {
        if (entry.id === approvalPlanningEntry.id || entry.deletedAt) return false;
        if (entry.userId !== approvalPlanningEntry.userId && entry.employeeName !== approvalPlanningEntry.employeeName) return false;
        if (normalizeDateKeyValue(entry.date) !== normalizeDateKeyValue(approvalDate)) return false;
        return timeRangesOverlap(approvalStartTime, approvalEndTime, entry.startTime, entry.endTime);
      })
    : [];
  const activeProjectPhotoCounts = useMemo(() => {
    if (!session || session.mode !== "project" || !canUseProjectPhotos(session.projectId)) return { before: 0, after: 0 };
    return getProjectPhotoCounts(session.projectId);
  }, [data.projectLogbookEntries, session?.mode, session?.projectId]);
  const utilizationDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(dateFromKey(planningWeekStartKey), index)),
    [planningWeekStartKey]
  );

  function projectSearchLabel(project: Project) {
    return [project.projectNumber, project.title].filter(Boolean).join(" | ");
  }

  function renderStampProjectSearch() {
    return (
      <div className="projectSearchPicker">
        <label className="projectSearchInput">
          <Search size={16} />
          <input
            value={stampProjectSearch}
            onChange={(event) => setStampProjectSearch(event.target.value)}
            placeholder="Projekt suchen"
          />
        </label>

        {selectedStampProject && (
          <div className="selectedProjectPill">
            <span>Ausgewählt</span>
            <strong>{projectSearchLabel(selectedStampProject)}</strong>
            {selectedStampProject.customer && <small>{selectedStampProject.customer}</small>}
          </div>
        )}

        <div className="projectSearchResults" aria-label="Projekttreffer">
          {stampProjectResults.map((project) => (
            <button
              className={project.id === stampProjectId ? "active" : ""}
              key={project.id}
              type="button"
              onClick={() => {
                setStampProjectId(project.id);
                setStampProjectSearch(projectSearchLabel(project));
                setPendingStampStartComment("");
                setPendingUnproductiveStampComment("");
                setPendingUnproductiveStampLabel("");
              }}
            >
              <strong>{projectSearchLabel(project)}</strong>
              <span>{[project.customer, project.trade].filter(Boolean).join(" | ") || "Projekt"}</span>
            </button>
          ))}
          {!normalizedStampProjectSearch && (
            <div className="projectSearchEmpty">Bitte Projektnummer, Kunde oder Projektnamen eingeben.</div>
          )}
          {normalizedStampProjectSearch && stampProjectResults.length === 0 && (
            <div className="projectSearchEmpty">Kein Projekt gefunden. Bitte Suchbegriff prüfen.</div>
          )}
        </div>
      </div>
    );
  }

  const planningWeekEndKey = shiftDateKey(planningWeekStartKey, 6);
  const appointmentWeekEntries = useMemo(() => {
    return data.planning
      .filter((entry) => {
        if (entry.deletedAt) return false;
        const key = normalizeDateKeyValue(entry.date);
        return key >= planningWeekStartKey && key <= planningWeekEndKey && isPlanningEntryAssignedToActiveUser(entry);
      })
      .sort((a, b) => `${normalizeDateKeyValue(a.date)}${a.startTime}${a.title}`.localeCompare(`${normalizeDateKeyValue(b.date)}${b.startTime}${b.title}`));
  }, [activeUser?.id, activeUser?.name, data.planning, planningWeekEndKey, planningWeekStartKey]);
  const appointmentDays = useMemo(() => {
    return utilizationDays.map((day) => {
      const key = dateKey(day);
      const entries = appointmentWeekEntries.filter((entry) => normalizeDateKeyValue(entry.date) === key);
      const plannedHours = entries.reduce((sum, entry) => {
        if (typeof entry.durationMinutes === "number") return sum + entry.durationMinutes / 60;
        return sum + Math.max(0, (minutesFromTime(entry.endTime) - minutesFromTime(entry.startTime)) / 60);
      }, 0);
      const capacityHours = activeUser?.dailyWorkHours ?? 8;
      const percent = capacityHours > 0 ? Math.round((plannedHours / capacityHours) * 100) : 0;
      return { key, date: day, entries, plannedHours, capacityHours, percent, isWeekend: isWeekend(day) };
    });
  }, [activeUser?.dailyWorkHours, appointmentWeekEntries, utilizationDays]);
  const selectedAppointmentDay = selectedAppointmentDayKey
    ? appointmentDays.find((day) => day.key === selectedAppointmentDayKey)
    : null;
  const utilizationRows = useMemo(() => {
    const groupNames = Array.from(
      new Set([
        "Gesamt",
        ...visiblePlanningGroups.map((group) => `${group.board} | ${group.groupName}`),
        ...visiblePlanning.map((entry) => `${entry.board || "OK solutions"} | ${entry.groupName || "Ohne Gruppe"}`),
      ])
    );

    return groupNames.map((groupName) => {
      const usersInGroup =
        groupName === "Gesamt"
          ? data.users.filter((user) => user.isActive !== false && allowedPlanningKeys.has(planningKey(user.planningBoard, user.planningGroup)))
          : data.users.filter(
              (user) =>
                user.isActive !== false &&
                `${user.planningBoard || "OK solutions"} | ${user.planningGroup || "Ohne Gruppe"}` === groupName &&
                allowedPlanningKeys.has(planningKey(user.planningBoard, user.planningGroup))
            );

      return {
        groupName,
        days: utilizationDays.map((day) => {
          const key = dateKey(day);
          const dayEntries = visiblePlanning.filter((entry) => {
            if (entry.date !== key) return false;
            if (groupName === "Gesamt") return true;
            return `${entry.board || "OK solutions"} | ${entry.groupName || "Ohne Gruppe"}` === groupName;
          });
          const plannedHours = dayEntries.reduce((sum, entry) => {
            if (typeof entry.durationMinutes === "number") return sum + entry.durationMinutes / 60;
            const [startHour = 0, startMinute = 0] = entry.startTime.split(":").map(Number);
            const [endHour = 0, endMinute = 0] = entry.endTime.split(":").map(Number);
            return sum + Math.max(0, (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60);
          }, 0);
          const capacityHours = usersInGroup.reduce((sum, user) => {
            const weekdayCapacity = user.weeklyCapacity?.[getDayKey(day)];
            return sum + (Number.isFinite(Number(weekdayCapacity)) ? Number(weekdayCapacity) : user.dailyWorkHours ?? 8);
          }, 0);
          const percent = capacityHours > 0 ? Math.round((plannedHours / capacityHours) * 100) : 0;

          return {
            key,
            date: day,
            plannedHours,
            capacityHours,
            percent,
            isWeekend: isWeekend(day),
          };
        }),
      };
    });
  }, [allowedPlanningKeys, data.users, utilizationDays, visiblePlanning, visiblePlanningGroups]);
  const dayPlanningEntries = useMemo(() => {
    if (!selectedPlanningDay) return [];
    return visiblePlanning
      .filter((entry) => {
        if (normalizeDateKeyValue(entry.date) !== selectedPlanningDay.dateKey) return false;
        if (selectedPlanningDay.groupName === "Gesamt") return true;
        return (
          (entry.board || "OK solutions") === selectedPlanningDay.board &&
          (entry.groupName || "Ohne Gruppe") === selectedPlanningDay.groupName
        );
      })
      .sort((a, b) =>
        `${a.startTime}${a.endTime}${a.employeeName || ""}${a.title}`.localeCompare(
          `${b.startTime}${b.endTime}${b.employeeName || ""}${b.title}`,
          "de"
        )
      );
  }, [selectedPlanningDay, visiblePlanning]);
  const dayPlanningUsers = useMemo(() => {
    if (!selectedPlanningDay) return [];
    const groupUsers = data.users.filter((user) => {
      if (user.isActive === false) return false;
      if (selectedPlanningDay.groupName === "Gesamt") return true;
      return (
        (user.planningBoard || "OK solutions") === selectedPlanningDay.board &&
        (user.planningGroup || "Ohne Gruppe") === selectedPlanningDay.groupName
      );
    });
    const plannedUsers = dayPlanningEntries.map((entry) => ({
        id: entry.employeeName || entry.userId || entry.id,
        name: entry.employeeName || "Nicht zugeordnet",
        dailyWorkHours: 8,
      }));
    const byName = new Map<string, { id: string; name: string; dailyWorkHours?: number }>();
    [...groupUsers, ...plannedUsers].forEach((user) => {
      byName.set(user.name, { id: user.id, name: user.name, dailyWorkHours: user.dailyWorkHours });
    });
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [data.users, dayPlanningEntries, selectedPlanningDay]);

  function getStampStartPayload(user = activeUser) {
    if (!user) {
      return { error: "Bitte erst einen Mitarbeiter auswählen." };
    }
    if (stampMode === "project" && !selectedStampProject) {
      return { error: "Bitte ein Projekt auswählen." };
    }

    const typedComment = (session ? nextStampComment : stampStartComment).trim();
    if (!typedComment) {
      return {
        error: session
          ? "Bitte eintragen: Was machst du als Nächstes?"
          : "Bitte eintragen: Was machst du gerade?",
      };
    }
    return {
      payload: {
        action: "start",
        userId: user.id,
        employee: user.name,
        mode: stampMode,
        projectId: stampMode === "project" ? selectedStampProject?.id ?? "" : "__unproductive__",
        projectLabel:
          stampMode === "project"
            ? `${selectedStampProject?.projectNumber ? `${selectedStampProject.projectNumber} | ` : ""}${selectedStampProject?.title ?? ""}`
            : pendingUnproductiveStampLabel || "Unproduktiv",
        comment: typedComment,
      },
    };
  }

  async function startStampSession() {
    if (session) {
      setIsStartDialogOpen(false);
      setStampError("Es läuft bereits eine Stempelung. Bitte nutze Wechsel, damit die laufende Tätigkeit sauber abgeschlossen wird.");
      openCompletionDialog("switch");
      return;
    }
    if (!activeUser) {
      setStampError("Bitte erst einen Mitarbeiter auswählen.");
      return;
    }
    const nextStart = getStampStartPayload(activeUser);
    if (nextStart.error || !nextStart.payload) {
      setStampError(nextStart.error ?? "Stempelung konnte nicht vorbereitet werden.");
      return;
    }

    try {
      const nextSession = await fetchJson<StampSession>("/api/stamp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextStart.payload),
      });
      setStampError("");
      setSession(nextSession);
      setPendingStampStartComment("");
      setPendingUnproductiveStampComment("");
      setPendingUnproductiveStampLabel("");
      setNextStampComment("");
      setStampStartComment("");
      setIsStartDialogOpen(false);
      await loadStampSession(activeUser.id);
    } catch (startError) {
      setStampError(
        startError instanceof Error ? startError.message : "Stempelung konnte nicht gestartet werden."
      );
    }
  }

  function openStartDialog() {
    setStampError("");
    setStampProjectId("");
    setStampProjectSearch("");
    setIsStartDialogOpen(true);
  }

  function closeStartDialog() {
    setIsStartDialogOpen(false);
    setStampError("");
  }

  function getPlanningProjectInfo(entry: PlanningEntry) {
    const project = data.projects.find((item) => item.id === entry.projectId);
    const projectLabel =
      entry.projectLabel ||
      (project
        ? `${project.projectNumber ? `${project.projectNumber} | ` : ""}${project.title}`
        : entry.title);
    return {
      project,
      projectLabel,
      customer: entry.customer || project?.customer || "Kunde nicht hinterlegt",
    };
  }

  function isRecurringProject(project?: Project) {
    if (!project) return false;
    const directKind = normalizedText(project.projectKind);
    if (directKind.includes("dauer")) return true;
    const searchableText = [
      project.title,
      project.status,
      project.description,
      project.trade,
      project.billingInterval,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return ["monatlich", "jährlich", "jaehrlich", "quartal", "dauer"].some((token) =>
      searchableText.includes(token)
    );
  }

  function isImmocareProject(project?: Project) {
    if (!project) return false;
    const projectType = normalizedText(project.projectType);
    const branch = normalizedText(project.branch);
    return projectType.includes("immocare") || branch.includes("immocare");
  }

  function canUseProjectPhotos(projectId?: string) {
    if (!projectId) return false;
    return isImmocareProject(data.projects.find((project) => project.id === projectId));
  }

  function isProjectPhotoDetailLoading(projectId?: string) {
    return Boolean(projectId && projectLogbookLoadingKeys.includes(`project:${projectId}`));
  }

  function isProjectPhotoSummaryLoading() {
    return projectLogbookLoadingKeys.includes("summary");
  }

  function getProjectLogbookMonth(projectId: string) {
    const project = data.projects.find((item) => item.id === projectId);
    if (!isRecurringProject(project)) return "";

    const plannedEntry = data.planning.find(
      (entry) => entry.projectId === projectId && normalizeDateKeyValue(entry.date) === dateKey()
    );
    return normalizeDateKeyValue(plannedEntry?.date).slice(0, 7) || monthKey();
  }

  function entryMatchesProjectMonth(entry: ProjectLogbookEntry, projectMonth: string) {
    if (!projectMonth) return true;
    const entryMonth = entry.projectMonth || normalizeDateKeyValue(entry.date).slice(0, 7);
    return entryMonth === projectMonth;
  }

  function getProjectPhotoCounts(projectId?: string, entries = data.projectLogbookEntries) {
    if (!projectId) return { before: 0, after: 0 };
    if (!canUseProjectPhotos(projectId)) return { before: 0, after: 0 };
    const projectMonth = getProjectLogbookMonth(projectId);

    const countImages = (category: "Vorherbilder" | "Nachherbilder") =>
      entries
        .filter((entry) => entry.projectId === projectId && entry.title === `Bilder: ${category}`)
        .filter((entry) => entryMatchesProjectMonth(entry, projectMonth))
        .reduce(
          (sum, entry) => sum + entry.attachments.filter((attachment) => attachment.type === "Bild").length,
          0
        );

    return {
      before: countImages("Vorherbilder"),
      after: countImages("Nachherbilder"),
    };
  }

  function getProjectPhotoAttachments(projectId: string, category: "Vorherbilder" | "Nachherbilder") {
    if (!canUseProjectPhotos(projectId)) return [];
    const projectMonth = getProjectLogbookMonth(projectId);
    return data.projectLogbookEntries
      .filter((entry) => entry.projectId === projectId && entry.title === `Bilder: ${category}`)
      .filter((entry) => entryMatchesProjectMonth(entry, projectMonth))
      .flatMap((entry) =>
        entry.attachments
          .filter((attachment) => attachment.type === "Bild" && attachment.dataUrl)
          .map((attachment, attachmentIndex) => ({
            ...attachment,
            entryId: entry.id,
            attachmentIndex,
            date: entry.date,
          }))
      );
  }

  function planningStampComment(entry: PlanningEntry) {
    return `Planung: ${entry.title} (${entry.startTime}-${entry.endTime}, ${longDateLabel(entry.date)})`;
  }

  function isPlanningEntryForActiveSession(entry: PlanningEntry) {
    if (!session || !activeUser) return false;
    if (session.userId !== activeUser.id) return false;

    const sessionDate = normalizeDateKeyValue(session.startedAt);
    if (sessionDate && normalizeDateKeyValue(entry.date) !== sessionDate) return false;

    const sessionStartDate = new Date(session.startedAt);
    const sessionStartTime = Number.isNaN(sessionStartDate.getTime())
      ? entry.startTime
      : `${String(sessionStartDate.getHours()).padStart(2, "0")}:${String(sessionStartDate.getMinutes()).padStart(2, "0")}`;
    const sessionEndTime = timeKey(new Date(timerNow));

    return isBestPlanningMatchForTarget({
      entry,
      mode: session.mode,
      projectId: session.projectId,
      projectLabel: session.projectLabel,
      comment: session.comment ?? "",
      date: normalizeDateKeyValue(entry.date),
      startTime: sessionStartTime,
      endTime: sessionEndTime,
    });
  }

  function doesPlanningTargetMatch(
    planningEntry: PlanningEntry,
    target: { mode: ProjectTimeEntry["mode"]; projectId: string; projectLabel?: string; comment?: string }
  ) {
    if (planningEntry.projectId) {
      return target.mode === "project" && target.projectId === planningEntry.projectId;
    }

    const planningTitle = normalizedText(planningEntry.title);
    const label = normalizedText(target.projectLabel);
    const comment = normalizedText(target.comment);
    return (
      target.mode === "unproductive" &&
      Boolean(planningTitle) &&
      (label === planningTitle || comment.includes(planningTitle))
    );
  }

  function isPlanningEntryAssignedToActiveUser(planningEntry: PlanningEntry) {
    if (!activeUser) return false;
    const entryData = planningEntry as PlanningEntry & {
      employee?: string;
      workerName?: string;
      assignedUserName?: string;
    };
    const activeUserName = normalizedText(activeUser.name);
    return (
      Boolean(planningEntry.userId && planningEntry.userId === activeUser.id) ||
      Boolean(activeUserName && normalizedText(planningEntry.employeeName) === activeUserName) ||
      Boolean(activeUserName && normalizedText(entryData.employee) === activeUserName) ||
      Boolean(activeUserName && normalizedText(entryData.workerName) === activeUserName) ||
      Boolean(activeUserName && normalizedText(entryData.assignedUserName) === activeUserName)
    );
  }

  function getPlanningMatchCandidates(target: {
    mode: ProjectTimeEntry["mode"];
    projectId: string;
    projectLabel?: string;
    comment?: string;
    date: string;
  }) {
    const targetDate = normalizeDateKeyValue(target.date);
    return data.planning.filter(
      (entry) =>
        !entry.deletedAt &&
        normalizeDateKeyValue(entry.date) === targetDate &&
        isPlanningEntryAssignedToActiveUser(entry) &&
        doesPlanningTargetMatch(entry, target)
    );
  }

  function isBestPlanningMatchForTarget(target: {
    entry: PlanningEntry;
    mode: ProjectTimeEntry["mode"];
    projectId: string;
    projectLabel?: string;
    comment?: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const candidates = getPlanningMatchCandidates(target);
    if (candidates.length === 0) return false;

    const targetStart = minutesFromTime(target.startTime);
    const targetEnd = Math.max(targetStart, minutesFromTime(target.endTime));
    const overlaps = candidates
      .map((candidate) => {
        const overlap =
          Math.min(targetEnd, minutesFromTime(candidate.endTime)) -
          Math.max(targetStart, minutesFromTime(candidate.startTime));
        return { candidate, overlap };
      })
      .filter((item) => item.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || minutesFromTime(a.candidate.startTime) - minutesFromTime(b.candidate.startTime));

    if (overlaps[0]) return overlaps[0].candidate.id === target.entry.id;

    const cutoff = targetEnd || targetStart;
    const previousCandidates = candidates
      .filter((candidate) => minutesFromTime(candidate.endTime) <= cutoff)
      .sort((a, b) => minutesFromTime(b.endTime) - minutesFromTime(a.endTime));

    return previousCandidates[0]?.id === target.entry.id;
  }

  function isProjectTimeEntryForPlanningEntry(timeEntry: ProjectTimeEntry, planningEntry: PlanningEntry) {
    if (!activeUser) return false;
    if (normalizeDateKeyValue(timeEntry.date) !== normalizeDateKeyValue(planningEntry.date)) return false;
    if (timeEntry.userId !== activeUser.id && normalizedText(timeEntry.employee) !== normalizedText(activeUser.name)) {
      return false;
    }
    return isBestPlanningMatchForTarget({
      entry: planningEntry,
      mode: timeEntry.mode,
      projectId: timeEntry.projectId,
      projectLabel: timeEntry.projectLabel,
      comment: timeEntry.comment,
      date: timeEntry.date,
      startTime: timeEntry.startTime,
      endTime: timeEntry.endTime,
    });
  }

  function getPlanningEntryMatchedTimeEntries(entry: PlanningEntry) {
    return data.timeEntries.filter((timeEntry) => isProjectTimeEntryForPlanningEntry(timeEntry, entry));
  }

  function getPlanningEntryMatchedTimeEntry(entry: PlanningEntry) {
    return getPlanningEntryMatchedTimeEntries(entry)[0];
  }

  function getStoredTimeEntryDurationMs(entry: ProjectTimeEntry) {
    const storedDuration = Number(entry.durationMs);
    if (Number.isFinite(storedDuration) && storedDuration > 0) return storedDuration;

    const start = dateTimeMs(entry.date, entry.startTime);
    const end = dateTimeMs(entry.date, entry.endTime);
    if (start === null || end === null || end <= start) return 0;
    return Math.max(0, end - start - Math.max(0, Number(entry.pauseMs) || 0));
  }

  function getUserBreakWindowForPlanning(user: User | undefined, entry: PlanningEntry) {
    const source = user as
      | (User & {
          breakStartTime?: string;
          breakEndTime?: string;
          pauseStartTime?: string;
          pauseEndTime?: string;
          lunchBreakStart?: string;
          lunchBreakEnd?: string;
          planningBreakStart?: string;
          planningBreakEnd?: string;
        })
      | undefined;
    const start =
      source?.breakStartTime ||
      source?.pauseStartTime ||
      source?.lunchBreakStart ||
      source?.planningBreakStart ||
      "";
    const end =
      source?.breakEndTime ||
      source?.pauseEndTime ||
      source?.lunchBreakEnd ||
      source?.planningBreakEnd ||
      "";
    if (!start || !end) return null;

    const breakStart = dateTimeMs(entry.date, start);
    const breakEnd = dateTimeMs(entry.date, end);
    if (breakStart === null || breakEnd === null || breakEnd <= breakStart) return null;
    return { start: breakStart, end: breakEnd };
  }

  function getPlanningNetTargetMs(entry: PlanningEntry) {
    const start = dateTimeMs(entry.date, entry.startTime);
    const end = dateTimeMs(entry.date, entry.endTime);
    if (start === null || end === null || end <= start) return 0;

    const breakWindow = getUserBreakWindowForPlanning(activeUser, entry);
    const breakOverlap =
      breakWindow === null ? 0 : Math.max(0, Math.min(end, breakWindow.end) - Math.max(start, breakWindow.start));

    return Math.max(0, end - start - breakOverlap);
  }

  function getPlanningEntryProgressMs(entry: PlanningEntry) {
    const completedMs = getPlanningEntryMatchedTimeEntries(entry).reduce(
      (sum, timeEntry) => sum + getStoredTimeEntryDurationMs(timeEntry),
      0
    );
    const liveMs = isPlanningEntryForActiveSession(entry) ? sessionElapsedMs : 0;
    return completedMs + liveMs;
  }

  function getPlanningEntryProgress(entry: PlanningEntry) {
    return stampTargetProgress(getPlanningEntryProgressMs(entry), getPlanningNetTargetMs(entry));
  }

  function getPlanningEntryStatus(entry: PlanningEntry): PlanningEntryStatus {
    if (isPlanningEntryForActiveSession(entry)) return "active";
    const matchedEntries = getPlanningEntryMatchedTimeEntries(entry);
    if (matchedEntries.some((timeEntry) => timeEntry.completionStatus !== "interrupted")) return "done";
    if (matchedEntries.some((timeEntry) => timeEntry.completionStatus === "interrupted")) return "interrupted";

    const endMs = dateTimeMs(entry.date, entry.endTime);
    if (endMs !== null && endMs < timerNow) return "past";

    return "open";
  }

  function planningStatusLabel(status: PlanningEntryStatus) {
    if (status === "active") return "Aktiv";
    if (status === "done") return "Erledigt";
    if (status === "interrupted") return "Unterbrochen";
    if (status === "past") return "Vorbei";
    return "Offen";
  }

  function preparePlanningSwitchTarget(entry: PlanningEntry) {
    const entryComment = planningStampComment(entry);
    setPendingStampStartComment(entryComment);
    if (entry.projectId) {
      setStampMode("project");
      setStampProjectId(entry.projectId);
      setPendingUnproductiveStampComment("");
      setPendingUnproductiveStampLabel("");
      return;
    }

    setStampMode("unproductive");
    setStampProjectId("");
    setPendingUnproductiveStampComment(entryComment);
    setPendingUnproductiveStampLabel(entry.title || "Unproduktiv");
  }

  async function startStampForPlanning(entry: PlanningEntry) {
    if (!activeUser) {
      setStampError("Bitte erst einen Mitarbeiter auswählen.");
      return;
    }
    if (!entry.projectId) {
      setStampError("Diese Planung ist keinem Projekt zugeordnet.");
      return;
    }
    const { projectLabel } = getPlanningProjectInfo(entry);
    const comment = window.prompt("Was machst du gerade?", "");
    if (!comment?.trim()) {
      setStampError("Bitte eintragen: Was machst du gerade?");
      return;
    }

    try {
      const nextSession = await fetchJson<StampSession>("/api/stamp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          userId: activeUser.id,
          employee: activeUser.name,
          mode: "project",
          projectId: entry.projectId,
          projectLabel,
          comment: comment.trim(),
        }),
      });
      setStampError("");
      setStampMode("project");
      setStampProjectId("");
      setPendingUnproductiveStampComment("");
      setPendingUnproductiveStampLabel("");
      setPendingStampStartComment("");
      setNextStampComment("");
      setSession(nextSession);
      await loadStampSession(activeUser.id);
    } catch (startError) {
      setStampError(
        startError instanceof Error ? startError.message : "Stempelung konnte nicht gestartet werden."
      );
    }
  }

  async function startUnproductiveForPlanning(entry: PlanningEntry) {
    const unproductiveStartComment = window.prompt("Was machst du gerade?", "");
    if (!unproductiveStartComment?.trim()) {
      setStampError("Bitte eintragen: Was machst du gerade?");
      return;
    }
    if (!activeUser) {
      setStampError("Bitte erst einen Mitarbeiter auswählen.");
      return;
    }

    try {
      const nextSession = await fetchJson<StampSession>("/api/stamp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          userId: activeUser.id,
          employee: activeUser.name,
          mode: "unproductive",
          projectId: "__unproductive__",
          projectLabel: entry.title || "Unproduktiv",
          comment: unproductiveStartComment.trim(),
        }),
      });
      setStampError("");
      setStampMode("project");
      setStampProjectId("");
      setPendingUnproductiveStampComment("");
      setPendingUnproductiveStampLabel("");
      setPendingStampStartComment("");
      setNextStampComment("");
      setSession(nextSession);
      await loadStampSession(activeUser.id);
    } catch (startError) {
      setStampError(
        startError instanceof Error ? startError.message : "Unproduktive Stempelung konnte nicht gestartet werden."
      );
    }
  }

  function switchStampToPlanning(entry: PlanningEntry) {
    if (!entry.projectId) {
      setStampError("Diese Planung ist keinem Projekt zugeordnet.");
      return;
    }
    preparePlanningSwitchTarget(entry);
    openCompletionDialog("switch");
  }

  function switchStampToUnproductivePlanning(entry: PlanningEntry) {
    preparePlanningSwitchTarget(entry);
    openCompletionDialog("switch");
  }

  function handlePlanningPlay(entry: PlanningEntry) {
    if (!session) {
      if (entry.projectId) {
        startStampForPlanning(entry);
      } else {
        startUnproductiveForPlanning(entry);
      }
      return;
    }

    if (entry.projectId) {
      switchStampToPlanning(entry);
    } else {
      switchStampToUnproductivePlanning(entry);
    }
  }

  async function toggleSessionPause() {
    if (!session) return;
    try {
      const nextSession = await fetchJson<StampSession>("/api/stamp-session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: session.pauseStartedAt ? "resume" : "pause",
          userId: session.userId,
        }),
      });
      setStampError("");
      setSession(nextSession);
      await loadStampSession(session.userId);
    } catch (pauseError) {
      setStampError(
        pauseError instanceof Error ? pauseError.message : "Stempelung konnte nicht aktualisiert werden."
      );
    }
  }

  async function stopStampSession() {
    if (!session) return;
    if (!stampComment.trim()) {
      setStampError("Bitte einen kurzen Kommentar zur Stempelung eintragen.");
      return;
    }

    try {
      await apiFetch("/api/stamp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stop",
          userId: session.userId,
          comment: stampComment.trim(),
          completionStatus: session.mode === "project" ? workCompletionStatus : "",
        }),
      }).then(async (response) => {
        if (response.status === 404) {
          setSession(null);
          return;
        }
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Stempelung konnte nicht gespeichert werden.");
        }
      });
      setStampComment("");
      setStampError("");
      setSession(null);
      await loadStampSession(selectedUserId);
      await loadData(selectedUserId);
    } catch (saveError) {
      setStampError(saveError instanceof Error ? saveError.message : "Stempelung konnte nicht gespeichert werden.");
    }
  }

  async function switchStampSession() {
    if (!session) return;
    if (!activeUser) {
      setStampError("Bitte erst einen Mitarbeiter auswahlen.");
      return;
    }
    if (!stampComment.trim()) {
      setStampError("Bitte einen kurzen Kommentar zur abgeschlossenen Tätigkeit eintragen.");
      return;
    }

    const nextStart = getStampStartPayload(activeUser);
    if (nextStart.error || !nextStart.payload) {
      setStampError(nextStart.error ?? "Folgetätigkeit konnte nicht vorbereitet werden.");
      return;
    }

    try {
      await apiFetch("/api/stamp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stop",
          userId: session.userId,
          comment: stampComment.trim(),
          completionStatus: session.mode === "project" ? workCompletionStatus : "",
        }),
      }).then(async (response) => {
        if (response.status === 404) return;
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Aktuelle Stempelung konnte nicht beendet werden.");
        }
      });

      const nextSession = await fetchJson<StampSession>("/api/stamp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextStart.payload),
      });

      setStampComment("");
      setNextStampComment("");
      setStampError("");
      setSession(nextSession);
      setPendingUnproductiveStampComment("");
      setPendingUnproductiveStampLabel("");
      setPendingStampStartComment("");
      await loadStampSession(activeUser.id);
      await loadData(selectedUserId);
    } catch (switchError) {
      setStampError(
        switchError instanceof Error ? switchError.message : "Wechsel konnte nicht gespeichert werden."
      );
    }
  }

  function resetCompletionState() {
    setWorkCompletionStatus("");
    setFinalInspectionByColleague(false);
    setFinalChecklist(Object.fromEntries(finalInspectionItems.map((label) => [label, false])));
    setUpsellAnswer("no");
    setUpsellNotes("");
  }

  function openCompletionDialog(action: StampCompletionAction) {
    if (!session) return;
    resetCompletionState();
    setCompletionAction(action);
    setStampError("");
  }

  function closeCompletionDialog() {
    if (isCompletingStamp) return;
    setCompletionAction(null);
    resetCompletionState();
    setPendingUnproductiveStampComment("");
    setPendingUnproductiveStampLabel("");
    setPendingStampStartComment("");
    setNextStampComment("");
  }

  async function stopCurrentServerSession(comment: string) {
    if (!session) return null;

    const response = await apiFetch("/api/stamp-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "stop",
        userId: session.userId,
        comment,
        completionStatus: session.mode === "project" ? workCompletionStatus : "",
      }),
    });

    if (response.status === 404) {
      setSession(null);
      return null;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "Stempelung konnte nicht gespeichert werden.");
    }

    return (await response.json()) as ProjectTimeEntry;
  }

  async function saveFinalInspection(stoppedEntry: ProjectTimeEntry, comment: string) {
    if (workCompletionStatus !== "finished" || stoppedEntry.mode !== "project") return;

    await fetchJson("/api/final-inspections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: stoppedEntry.projectId,
        projectLabel: stoppedEntry.projectLabel,
        employee: stoppedEntry.employee,
        comment,
        status: finalInspectionByColleague ? "colleague" : "completed",
        checklist: finalInspectionItems.map((label) => ({
          label,
          done: Boolean(finalChecklist[label]),
        })),
        upsellNotes: upsellAnswer === "yes" ? upsellNotes.trim() : "",
      }),
    });
  }

  async function openProjectPhotoCamera(category: ProjectPhotoCategory, projectId = session?.projectId ?? "") {
    if (!projectId) return;
    if (!canUseProjectPhotos(projectId)) {
      setPhotoUploadError("Vorher-/Nachherbilder sind nur für OK-immocare-Projekte vorgesehen.");
      return;
    }
    const entries = await loadProjectLogbookEntries(true, projectId);
    const counts = getProjectPhotoCounts(projectId, entries);
    const count = category === "Vorherbilder" ? counts.before : counts.after;
    if (count >= 3) {
      setPhotoUploadError(`${category} sind bereits vollständig: maximal 3 Bilder.`);
      return;
    }
    setPhotoUploadError("");
    setPhotoGalleryProjectId("");
    setPhotoCaptureTarget({ category, projectId });
    if (category === "Vorherbilder") beforePhotoInputRef.current?.click();
    else afterPhotoInputRef.current?.click();
  }

  async function openProjectPhotoGallery(projectId: string) {
    if (!projectId) return;
    if (!canUseProjectPhotos(projectId)) {
      setPhotoUploadError("Vorher-/Nachherbilder sind nur für OK-immocare-Projekte vorgesehen.");
      return;
    }
    setPhotoUploadError("");
    await loadProjectLogbookEntries(true, projectId);
    setPhotoGalleryProjectId(projectId);
  }

  function openPostProcessFinalInspection(entry: ProjectTimeEntry) {
    resetCompletionState();
    setPostProcessEntryId(entry.id);
    setPostProcessError("");
  }

  function closePostProcessFinalInspection() {
    if (isPostProcessing) return;
    setPostProcessEntryId("");
    setPostProcessError("");
    resetCompletionState();
  }

  async function savePostProcessFinalInspection() {
    if (!postProcessEntry || !activeUser) return;
    if (postProcessEntry.mode !== "project") {
      setPostProcessError("Endkontrolle ist nur für Projektzeiten möglich.");
      return;
    }
    if (upsellAnswer === "yes" && !upsellNotes.trim()) {
      setPostProcessError("Bitte eintragen, welche Zusatzverkaufsmöglichkeiten vorhanden sind.");
      return;
    }

    setIsPostProcessing(true);
    setPostProcessError("");
    try {
      await fetchJson("/api/final-inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: postProcessEntry.projectId,
          projectLabel: postProcessEntry.projectLabel,
          employee: postProcessEntry.employee,
          comment: postProcessEntry.comment || "Nachbearbeitung per PWA",
          status: finalInspectionByColleague ? "colleague" : "completed",
          checklist: finalInspectionItems.map((label) => ({
            label,
            done: Boolean(finalChecklist[label]),
          })),
          upsellNotes: upsellAnswer === "yes" ? upsellNotes.trim() : "",
        }),
      });

      const response = await apiFetch("/api/project-time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...postProcessEntry,
          actorUserId: activeUser.id,
          completionStatus: "finished",
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error ??
            "Endkontrolle wurde gespeichert, der Zeitstatus konnte aber nicht nachträglich gesetzt werden."
        );
      }

      const updatedEntry = (await response.json()) as ProjectTimeEntry;
      setData((current) => ({
        ...current,
        timeEntries: current.timeEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
      }));
      setPostProcessEntryId("");
      setPostProcessError("");
      resetCompletionState();
      await loadData(selectedUserId);
    } catch (postProcessSaveError) {
      setPostProcessError(
        postProcessSaveError instanceof Error
          ? postProcessSaveError.message
          : "Nachbearbeitung konnte nicht gespeichert werden."
      );
    } finally {
      setIsPostProcessing(false);
    }
  }

  function previewProjectPhoto(category: ProjectPhotoCategory, file?: File) {
    if (!file || !photoCaptureTarget) return;
    const previewUrl = URL.createObjectURL(file);
    if (pendingProjectPhoto?.previewUrl) URL.revokeObjectURL(pendingProjectPhoto.previewUrl);
    setPhotoGalleryProjectId("");
    setPendingProjectPhoto({
      category,
      file,
      previewUrl,
      projectId: photoCaptureTarget.projectId,
    });
    setPhotoUploadError("");
  }

  function discardProjectPhotoPreview() {
    if (pendingProjectPhoto?.previewUrl) URL.revokeObjectURL(pendingProjectPhoto.previewUrl);
    setPendingProjectPhoto(null);
    setPhotoUploadError("");
  }

  function retakeProjectPhoto() {
    if (!pendingProjectPhoto) return;
    const { category, projectId } = pendingProjectPhoto;
    discardProjectPhotoPreview();
    setPhotoCaptureTarget({ category, projectId });
    window.setTimeout(() => {
      if (category === "Vorherbilder") beforePhotoInputRef.current?.click();
      else afterPhotoInputRef.current?.click();
    }, 0);
  }

  async function uploadProjectPhoto(category: ProjectPhotoCategory, file?: File, projectId = session?.projectId ?? "") {
    if (!file || !projectId) return false;
    if (!canUseProjectPhotos(projectId)) {
      setPhotoUploadError("Vorher-/Nachherbilder sind nur für OK-immocare-Projekte vorgesehen.");
      return false;
    }
    const entries = await loadProjectLogbookEntries(true, projectId);
    const counts = getProjectPhotoCounts(projectId, entries);
    const currentCount = category === "Vorherbilder" ? counts.before : counts.after;
    if (currentCount >= 3) {
      setPhotoUploadError(`${category} sind bereits vollständig: maximal 3 Bilder.`);
      return false;
    }

    setUploadingPhotoCategory(category);
    setPhotoUploadError("");
    try {
      const label = category === "Vorherbilder" ? "Vorherbild" : "Nachherbild";
      const attachment = await readImageAttachment(file, `${label} ${currentCount + 1}`);
      const projectMonth = getProjectLogbookMonth(projectId);
      const savedEntry = await fetchJson<ProjectLogbookEntry>("/api/project-logbook-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: `Bilder: ${category}`,
          text: `${category} per PWA hochgeladen`,
          author: activeUser?.name || session?.employee || "WorkPilot360 PWA",
          authorUserId: activeUser?.id || session?.userId || "",
          colleague: "",
          visibleFor: ["Geschaeftsfuehrer", "Vertriebler", "Niederlassungsleiter", "Monteur", "Buchhaltung"],
          attachments: [attachment],
          projectMonth,
        }),
      });
      setData((current) => ({
        ...current,
        projectLogbookEntries: mergeProjectLogbookEntries(current.projectLogbookEntries, [savedEntry]),
      }));
      setPhotoGalleryProjectId(projectId);
      return true;
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Bild konnte nicht gespeichert werden.";
      setPhotoUploadError(
        message.includes("413")
          ? "Das Bild ist noch zu groß. Bitte neu aufnehmen oder ein kleineres Bild verwenden."
          : message
      );
      return false;
    } finally {
      setUploadingPhotoCategory("");
    }
  }

  function validateCompletionDialog() {
    if (!session || !completionAction) return "Keine aktive Stempelung vorhanden.";
    if (session.mode === "project" && !workCompletionStatus) {
      return "Bitte auswählen, ob die Arbeit fertig oder unterbrochen ist.";
    }
    if (completionAction === "switch" && !nextStampComment.trim()) {
      return "Bitte eintragen: Was machst du als Nächstes?";
    }
    if (completionAction === "switch" && stampMode === "project" && !selectedStampProject) {
      return "Bitte einen Tagestermin oder ein anderes Projekt für die nächste Tätigkeit auswählen.";
    }
    if (
      workCompletionStatus === "finished" &&
      session.mode === "project" &&
      upsellAnswer === "yes" &&
      !upsellNotes.trim()
    ) {
      return "Bitte eintragen, welche Zusatzverkaufsmöglichkeiten vorhanden sind.";
    }

    return "";
  }

  function prepareUnproductiveFollowUp() {
    setCompletionAction("switch");
    setStampMode("unproductive");
    setStampProjectId("");
    setPendingStampStartComment("");
    setPendingUnproductiveStampComment("Unproduktive Zeit");
    setPendingUnproductiveStampLabel("Unproduktiv");
  }

  function prepareProjectFollowUp() {
    setCompletionAction("switch");
    setStampMode("project");
    setPendingStampStartComment("");
    setPendingUnproductiveStampComment("");
    setPendingUnproductiveStampLabel("");
  }

  async function completeStampAction() {
    const validationError = validateCompletionDialog();
    if (validationError) {
      setStampError(validationError);
      return;
    }

    try {
      setIsCompletingStamp(true);
      const comment = stampComment.trim();
      const action = completionAction;
      const preparedNextStart =
        action === "switch" && activeUser ? getStampStartPayload(activeUser).payload : null;
      if (action === "switch" && !activeUser) {
        throw new Error("Bitte erst einen Mitarbeiter auswählen.");
      }
      if (action === "switch" && !preparedNextStart) {
        const nextStartError = activeUser ? getStampStartPayload(activeUser).error : "";
        throw new Error(nextStartError ?? "Folgetätigkeit konnte nicht vorbereitet werden.");
      }
      const stoppedEntry = await stopCurrentServerSession(comment);

      if (stoppedEntry) {
        await saveFinalInspection(stoppedEntry, comment);
      }

      if (action === "switch") {
        const nextSession = await fetchJson<StampSession>("/api/stamp-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preparedNextStart),
        });
        setSession(nextSession);
      } else {
        setSession(null);
      }

      setStampComment("");
      setNextStampComment("");
      setStampError("");
      setCompletionAction(null);
      resetCompletionState();
      setPendingUnproductiveStampComment("");
      setPendingUnproductiveStampLabel("");
      setPendingStampStartComment("");
      await loadStampSession(selectedUserId);
      await loadData(selectedUserId);
    } catch (completeError) {
      setStampError(
        completeError instanceof Error ? completeError.message : "Stempelung konnte nicht abgeschlossen werden."
      );
    } finally {
      setIsCompletingStamp(false);
    }
  }

  async function updateTaskStatus(task: Task, status: string) {
    if (!activeUser) {
      setTaskActionError("Bitte erst einen Mitarbeiter auswählen.");
      return;
    }

    setIsTaskSaving(true);
    setTaskActionError("");
    try {
      const response = await apiFetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildTaskApiPayload(task, activeUser, status)),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Aufgabenstatus konnte nicht aktualisiert werden.");
      }

      await loadData(selectedUserId);
    } catch (statusError) {
      setTaskActionError(
        statusError instanceof Error ? statusError.message : "Aufgabenstatus konnte nicht aktualisiert werden."
      );
      await loadData(selectedUserId);
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function addTaskComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = taskCommentText.trim();
    if (!selectedTask || !activeUser || !text) return;

    setIsTaskSaving(true);
    setTaskActionError("");
    try {
      const response = await apiFetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: activeUser.id,
          text,
          recipientUserId: taskCommentRecipientId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Kommentar konnte nicht gespeichert werden.");
      }

      const comment = (await response.json()) as TaskComment;
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                kommentare: [comment, ...(task.kommentare ?? [])],
              }
            : task
        ),
      }));
      setTaskCommentText("");
      setTaskCommentRecipientId("");
      await loadData(selectedUserId);
    } catch (commentError) {
      setTaskActionError(
        commentError instanceof Error ? commentError.message : "Kommentar konnte nicht gespeichert werden."
      );
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function addTaskParticipant() {
    if (!selectedTask || !activeUser || !taskParticipantUserId) return;

    setIsTaskSaving(true);
    setTaskActionError("");
    try {
      const response = await apiFetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTask.id,
          actorId: activeUser.id,
          addParticipantUserId: taskParticipantUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Beteiligter konnte nicht hinzugefügt werden.");
      }

      const updatedTask = (await response.json()) as Task;
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      }));
      setTaskParticipantUserId("");
      await loadData(selectedUserId);
    } catch (participantError) {
      setTaskActionError(
        participantError instanceof Error
          ? participantError.message
          : "Beteiligter konnte nicht hinzugefügt werden."
      );
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function respondToTask(task: Task, response: "accepted" | "rejected") {
    if (!activeUser) {
      setTaskActionError("Bitte erst einen Mitarbeiter auswählen.");
      return;
    }

    const reason =
      response === "rejected" ? window.prompt("Bitte Begründung für die Ablehnung angeben:")?.trim() ?? "" : "";
    if (response === "rejected" && !reason) {
      setTaskActionError("Eine Aufgabe kann nur mit Begründung abgelehnt werden.");
      return;
    }

    setIsTaskSaving(true);
    setTaskActionError("");
    try {
      const apiResponse = await apiFetch("/api/tasks/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          actorId: activeUser.id,
          response,
          reason,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => null);
        throw new Error(errorData?.error ?? "Antwort konnte nicht gespeichert werden.");
      }

      await loadData(selectedUserId);
    } catch (responseError) {
      setTaskActionError(
        responseError instanceof Error ? responseError.message : "Antwort konnte nicht gespeichert werden."
      );
      await loadData(selectedUserId);
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function createQuickTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || !activeUser) return;

    setTaskActionError("");
    setIsTaskSaving(true);
    try {
      const response = await apiFetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: activeUser.id,
          title,
          description: "",
          status: "offen",
          priority: "normal",
          tradeId: null,
          ownerId: activeUser.id,
          deadline: defaultTaskDeadline(),
          customer: "",
          customerClass: null,
          projectId: null,
          autoFeedbackEnabled: false,
          autoFeedbackRecipientId: null,
          recurrenceEnabled: false,
          recurrenceInterval: null,
          estimateMinutes: null,
          planningAllocations: [],
          absenceHandoverTask: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Aufgabe konnte nicht angelegt werden.");
      }

      setNewTaskTitle("");
      await loadData(selectedUserId);
    } catch (createError) {
      setTaskActionError(createError instanceof Error ? createError.message : "Aufgabe konnte nicht angelegt werden.");
    } finally {
      setIsTaskSaving(false);
    }
  }

  async function submitAbsenceRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeUser) {
      setAbsenceActionError("Bitte erst einen Mitarbeiter auswählen.");
      return;
    }
    if (!absenceDateFrom || !absenceDateTo) {
      setAbsenceActionError("Bitte Datum von und bis auswählen.");
      return;
    }
    if (absenceDateTo < absenceDateFrom) {
      setAbsenceActionError("Das Bis-Datum darf nicht vor dem Von-Datum liegen.");
      return;
    }
    if (!absenceRepresentativeUserId) {
      setAbsenceActionError("Bitte einen Vertreter auswählen.");
      return;
    }
    if (absenceType === "urlaub" && !absenceHandoverConfirmed) {
      setAbsenceActionError("Bitte die Urlaubsübergabe bestätigen.");
      return;
    }

    setIsAbsenceSaving(true);
    setAbsenceActionError("");
    setAbsenceActionMessage("");
    try {
      const response = await apiFetch("/api/absences", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId: activeUser.id,
          userId: activeUser.id,
          type: absenceType,
          dayPart: absenceDayPart,
          dateFrom: absenceDateFrom,
          dateTo: absenceDateTo,
          representativeUserId: absenceRepresentativeUserId,
          note: absenceNote.trim(),
          handoverConfirmed: absenceType === "urlaub" ? absenceHandoverConfirmed : true,
          handoverChecklist:
            absenceType === "urlaub"
              ? ["Vertreter ausgewählt", "Offene Aufgaben geprüft", "Wichtige Informationen übergeben"]
              : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Abwesenheitsantrag konnte nicht gespeichert werden.");
      }

      const savedAbsences = (await response.json()) as Absence[];
      setData((current) => ({
        ...current,
        absences: [
          ...savedAbsences,
          ...current.absences.filter(
            (absence) => !savedAbsences.some((savedAbsence) => savedAbsence.id === absence.id)
          ),
        ].sort((a, b) => normalizeDateKeyValue(a.date).localeCompare(normalizeDateKeyValue(b.date))),
      }));
      setAbsenceActionMessage("Abwesenheitsantrag wurde gespeichert.");
      setAbsenceNote("");
      setAbsenceHandoverConfirmed(false);
      await loadData(selectedUserId);
    } catch (absenceError) {
      setAbsenceActionError(
        absenceError instanceof Error ? absenceError.message : "Abwesenheitsantrag konnte nicht gespeichert werden."
      );
    } finally {
      setIsAbsenceSaving(false);
    }
  }

  function openProjectFromPlanning(entry: PlanningEntry) {
    if (!entry.projectId) return;
    setSelectedProjectId(entry.projectId);
    setActiveSection("projects");
  }

  function canReschedulePlanningEntry(entry: PlanningEntry) {
    if (!canUsePlanningSection) return false;
    if (canUseCompanyTimeView) return true;
    return allowedPlanningKeys.has(planningKey(entry.board, entry.groupName));
  }

  function openPlanningReschedule(entry: PlanningEntry) {
    if (!canReschedulePlanningEntry(entry)) {
      setRescheduleError("Du darfst nur Termine deiner Planungsgruppe umplanen.");
      return;
    }
    setReschedulePlanningEntryId(entry.id);
    setRescheduleDate(normalizeDateKeyValue(entry.date));
    setRescheduleStartTime(entry.startTime);
    setRescheduleEndTime(entry.endTime);
    setRescheduleError("");
  }

  function closePlanningReschedule() {
    if (isReschedulingPlanning) return;
    setReschedulePlanningEntryId("");
    setRescheduleError("");
  }

  function isPlanningRequest(entry: PlanningEntry) {
    return entry.approvalStatus === "requested" || Boolean(entry.requestedByUserId && !entry.approvedAt);
  }

  function openPlanningApproval(entry: PlanningEntry) {
    if (!isPlanningRequest(entry)) {
      openPlanningReschedule(entry);
      return;
    }
    if (!canReschedulePlanningEntry(entry)) {
      setApprovalError("Du darfst nur Terminwünsche deiner Planungsgruppe freigeben.");
      return;
    }
    setApprovalPlanningEntryId(entry.id);
    setApprovalDate(normalizeDateKeyValue(entry.date));
    setApprovalStartTime(entry.startTime);
    setApprovalEndTime(entry.endTime);
    setApprovalError("");
  }

  function closePlanningApproval() {
    if (isApprovingPlanning) return;
    setApprovalPlanningEntryId("");
    setApprovalError("");
  }

  async function savePlanningApproval(options: { approve: boolean; useEditedTime?: boolean }) {
    if (!approvalPlanningEntry || !activeUser) return;
    if (!canReschedulePlanningEntry(approvalPlanningEntry)) {
      setApprovalError("Du darfst nur Terminwünsche deiner Planungsgruppe freigeben.");
      return;
    }

    if (!options.approve) {
      if (!window.confirm("Terminwunsch wirklich ablehnen? Der Wunsch wird aus der Planung entfernt.")) return;
      setIsApprovingPlanning(true);
      setApprovalError("");
      try {
        const params = new URLSearchParams({ id: approvalPlanningEntry.id, actorUserId: activeUser.id });
        const response = await apiFetch(`/api/planning-entries?${params.toString()}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error ?? "Terminwunsch konnte nicht abgelehnt werden.");
        }
        setData((current) => ({
          ...current,
          planning: current.planning.filter((entry) => entry.id !== approvalPlanningEntry.id),
        }));
        setApprovalPlanningEntryId("");
        await refreshPlanningData();
      } catch (deleteError) {
        setApprovalError(deleteError instanceof Error ? deleteError.message : "Terminwunsch konnte nicht abgelehnt werden.");
      } finally {
        setIsApprovingPlanning(false);
      }
      return;
    }

    const nextDate = options.useEditedTime ? approvalDate : normalizeDateKeyValue(approvalPlanningEntry.date);
    const nextStartTime = options.useEditedTime ? approvalStartTime : approvalPlanningEntry.startTime;
    const nextEndTime = options.useEditedTime ? approvalEndTime : approvalPlanningEntry.endTime;

    if (!nextDate || !nextStartTime || !nextEndTime) {
      setApprovalError("Bitte Datum, Startzeit und Endzeit ausfüllen.");
      return;
    }
    if (minutesFromTime(nextStartTime) >= minutesFromTime(nextEndTime)) {
      setApprovalError("Die Endzeit muss nach der Startzeit liegen.");
      return;
    }
    if (approvalConflicts.length > 0 && !window.confirm("Es gibt eine Überschneidung mit einem anderen Termin. Trotzdem freigeben?")) {
      return;
    }

    const durationMinutes = Math.max(0, minutesFromTime(nextEndTime) - minutesFromTime(nextStartTime));
    setIsApprovingPlanning(true);
    setApprovalError("");
    try {
      const response = await apiFetch("/api/planning-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...approvalPlanningEntry,
          actorUserId: activeUser.id,
          date: nextDate,
          startTime: nextStartTime,
          endTime: nextEndTime,
          durationMinutes,
          approvalStatus: "confirmed",
          approvedByUserId: activeUser.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Terminwunsch konnte nicht freigegeben werden.");
      }

      const updatedEntry = (await response.json()) as PlanningEntry;
      setData((current) => ({
        ...current,
        planning: current.planning
          .map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
          .sort((a, b) => `${normalizeDateKeyValue(a.date)}${a.startTime}`.localeCompare(`${normalizeDateKeyValue(b.date)}${b.startTime}`)),
      }));
      setSelectedPlanningDay((current) =>
        current && current.dateKey === normalizeDateKeyValue(approvalPlanningEntry.date)
          ? { ...current, dateKey: normalizeDateKeyValue(updatedEntry.date) }
          : current
      );
      setApprovalPlanningEntryId("");
      await refreshPlanningData();
    } catch (saveError) {
      setApprovalError(saveError instanceof Error ? saveError.message : "Terminwunsch konnte nicht freigegeben werden.");
    } finally {
      setIsApprovingPlanning(false);
    }
  }

  async function savePlanningReschedule() {
    if (!reschedulePlanningEntry || !activeUser) return;
    if (!canReschedulePlanningEntry(reschedulePlanningEntry)) {
      setRescheduleError("Du darfst nur Termine deiner Planungsgruppe umplanen.");
      return;
    }
    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      setRescheduleError("Bitte Datum, Startzeit und Endzeit ausfüllen.");
      return;
    }
    if (minutesFromTime(rescheduleStartTime) >= minutesFromTime(rescheduleEndTime)) {
      setRescheduleError("Die Endzeit muss nach der Startzeit liegen.");
      return;
    }

    const matchedEntries = getPlanningEntryMatchedTimeEntries(reschedulePlanningEntry);
    if (
      matchedEntries.length > 0 &&
      !window.confirm("Für diesen Termin gibt es bereits eine Stempelung. Trotzdem nur Datum/Uhrzeit umplanen?")
    ) {
      return;
    }

    const durationMinutes = Math.max(0, minutesFromTime(rescheduleEndTime) - minutesFromTime(rescheduleStartTime));
    setIsReschedulingPlanning(true);
    setRescheduleError("");
    try {
      const response = await apiFetch("/api/planning-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reschedulePlanningEntry,
          actorUserId: activeUser.id,
          date: rescheduleDate,
          startTime: rescheduleStartTime,
          endTime: rescheduleEndTime,
          durationMinutes,
          approvalStatus: reschedulePlanningEntry.approvalStatus || "confirmed",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Termin konnte nicht umgeplant werden.");
      }

      const updatedEntry = (await response.json()) as PlanningEntry;
      setData((current) => ({
        ...current,
        planning: current.planning
          .map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
          .sort((a, b) => `${normalizeDateKeyValue(a.date)}${a.startTime}`.localeCompare(`${normalizeDateKeyValue(b.date)}${b.startTime}`)),
      }));
      setSelectedPlanningDay((current) =>
        current && current.dateKey === normalizeDateKeyValue(reschedulePlanningEntry.date)
          ? { ...current, dateKey: normalizeDateKeyValue(updatedEntry.date) }
          : current
      );
      setReschedulePlanningEntryId("");
      await refreshPlanningData();
    } catch (saveError) {
      setRescheduleError(saveError instanceof Error ? saveError.message : "Termin konnte nicht umgeplant werden.");
    } finally {
      setIsReschedulingPlanning(false);
    }
  }

  async function openNotificationTargetData(target: string, targetId: string) {
    setNotificationActionError("");
    if (!target || !targetId) return;

    if (target === "task") {
      const task = data.tasks.find((item) => item.id === targetId);
      setActiveSection("tasks");
      setIsNotificationsOpen(false);
      if (task) openTaskDetail(task.id);
      return;
    }

    if (target === "absence-request") {
      setActiveSection("personal");
      setIsNotificationsOpen(false);
      return;
    }

    if (target === "planning-entry" || target === "planning-entry-overlap") {
      const entry = data.planning.find((item) => item.id === targetId);
      if (entry) {
        const entryDateKey = normalizeDateKeyValue(entry.date);
        setHomePlanningDateKey(entryDateKey);
        setSelectedAppointmentDayKey(entryDateKey);
        setPlanningWeekStartKey(startOfWeekKey(dateFromKey(entryDateKey)));
        if (canUsePlanningSection) {
          setSelectedPlanningDay({
            dateKey: entryDateKey,
            board: entry.board || "",
            groupName: entry.groupName || "Gesamt",
          });
          setPlanningDayView("board");
        }
      }
      setActiveSection(canUsePlanningSection ? "planning" : "appointments");
      setIsNotificationsOpen(false);
      return;
    }

    if (target === "project-logbook" || target === "project") {
      const project = data.projects.find((item) => item.id === targetId);
      setSelectedProjectId(targetId);
      setActiveSection("projects");
      setIsNotificationsOpen(false);
      if (project || target === "project-logbook") {
        await loadProjectLogbookEntries(true, targetId);
      }
      return;
    }
  }

  async function openNotificationTarget(notification: Notification) {
    const target = notification.linkTarget || (notification.taskId ? "task" : "");
    const targetId = notification.linkTargetId || notification.taskId || "";
    await openNotificationTargetData(target, targetId);
  }

  function renderSwitchSuggestion(entry: PlanningEntry, label: string) {
    const durationMinutes =
      typeof entry.durationMinutes === "number"
        ? entry.durationMinutes
        : Math.max(0, minutesFromTime(entry.endTime) - minutesFromTime(entry.startTime));
    const projectInfo = getPlanningProjectInfo(entry);
    const isSelected = pendingStampStartComment === planningStampComment(entry);

    return (
      <button
        type="button"
        className={isSelected ? "active" : ""}
        onClick={() => preparePlanningSwitchTarget(entry)}
        key={entry.id}
      >
        <span>{label}</span>
        <strong>
          {entry.startTime}-{entry.endTime} · {entry.title}
        </strong>
        <small>
          {entry.projectId ? projectInfo.projectLabel : "Unproduktiv"} ·{" "}
          {(durationMinutes / 60).toLocaleString("de-DE", {
            minimumFractionDigits: durationMinutes % 60 === 0 ? 0 : 1,
            maximumFractionDigits: 1,
          })}{" "}
          Std.
        </small>
      </button>
    );
  }

  function renderStampClock(compact = false) {
    return (
      <div className={compact ? "panel timeClockPanel compactClock" : "panel wide timeClockPanel"}>
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Zeiterfassung</p>
            <h2>{session ? session.projectLabel : "Bereit zum Einstempeln"}</h2>
          </div>
          <Clock3 size={22} />
        </div>

        <div className={session?.mode === "project" ? "timeReadout withPhotoPills" : "timeReadout"}>
          <div className="timeReadoutMain">
            <strong>{formatDuration(sessionElapsedMs)}</strong>
            <span>
              {session
                ? session.pauseStartedAt
                  ? `Pause lauft: ${formatDuration(sessionPauseMs)}`
                  : `${session.employee} ist eingestempelt`
                : activeUser
                  ? `${activeUser.name} ist nicht eingestempelt`
                  : "Kein Mitarbeiter ausgewahlt"}
            </span>
          </div>
          {session?.mode === "project" && canUseProjectPhotos(session.projectId) && (
            <div className="photoPillRow" aria-label="Projektbilder">
              <PhotoCaptureButton
                label="Vorher"
                count={activeProjectPhotoCounts.before}
                canCapture={uploadingPhotoCategory === "" && activeProjectPhotoCounts.before < 3}
                onCapture={() => void openProjectPhotoCamera("Vorherbilder")}
                onOpen={() => void openProjectPhotoGallery(session.projectId)}
              />
              <PhotoCaptureButton
                label="Nachher"
                count={activeProjectPhotoCounts.after}
                canCapture={uploadingPhotoCategory === "" && activeProjectPhotoCounts.after < 3}
                onCapture={() => void openProjectPhotoCamera("Nachherbilder")}
                onOpen={() => void openProjectPhotoGallery(session.projectId)}
              />
            </div>
          )}
        </div>

        <input
          ref={beforePhotoInputRef}
          className="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            previewProjectPhoto("Vorherbilder", file);
          }}
        />
        <input
          ref={afterPhotoInputRef}
          className="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            previewProjectPhoto("Nachherbilder", file);
          }}
        />

        {!compact && (
          <div className={session ? "stampSetup nextStampSetup" : "stampSetup"}>
            {session && <span className="nextStampLabel">Folgetätigkeit</span>}
            <div className="segmented">
              <button
                type="button"
                className={stampMode === "project" ? "active" : ""}
                onClick={() => {
                  setStampMode("project");
                  setPendingUnproductiveStampComment("");
                  setPendingUnproductiveStampLabel("");
                }}
              >
                Projekt
              </button>
              <button
                type="button"
                className={stampMode === "unproductive" ? "active" : ""}
                onClick={() => {
                  setStampMode("unproductive");
                  setStampProjectId("");
                  setStampProjectSearch("");
                  setPendingUnproductiveStampLabel("Unproduktiv");
                }}
              >
                Unproduktiv
              </button>
            </div>
            {stampMode === "project" && (
              renderStampProjectSearch()
            )}
          </div>
        )}

        {!session && !compact && (
          <label className="commentBox startStampCommentBox">
            <span>Was machst du gerade?</span>
            <textarea
              value={stampStartComment}
              onChange={(event) => setStampStartComment(event.target.value)}
              placeholder="Kurze Tätigkeitsnotiz eintragen"
            />
          </label>
        )}

        {stampError && <div className="inlineError">{stampError}</div>}
        {photoUploadError && <div className="inlineError">{photoUploadError}</div>}

        <div className={compact && !session ? "stampControls compactStartControls" : "stampControls"}>
          {!session ? (
            <button
              className={compact ? "roundAction startAction compactClockStartAction" : "startButton"}
              type="button"
              onClick={compact ? openStartDialog : startStampSession}
            >
              <Play size={22} fill="currentColor" />
              <span>Start</span>
            </button>
          ) : (
            <>
              <button
                className={compact ? "roundAction pauseAction" : "pauseButton"}
                type="button"
                onClick={toggleSessionPause}
              >
                {session.pauseStartedAt ? <Play size={20} fill="currentColor" /> : <Pause size={20} />}
                <span>{session.pauseStartedAt ? "Fortsetzen" : "Pause"}</span>
              </button>
              <button
                className={compact ? "roundAction switchAction" : "switchButton"}
                type="button"
                onClick={() => openCompletionDialog("switch")}
              >
                <RefreshCcw size={19} />
                <span>Wechsel</span>
              </button>
              <button
                className={compact ? "roundAction stopAction" : "stopButton"}
                type="button"
                onClick={() => openCompletionDialog("stop")}
              >
                <Square size={18} fill="currentColor" />
                <span>Stopp</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  function renderTimeIssueActions(entry: ProjectTimeEntry) {
    if (timeIssueFilter === "photos") {
      if (!entry.projectId) {
        return <small className="timeIssueHint">Projekt nicht verknüpft</small>;
      }
      return (
        <button type="button" className="timeIssueAction" onClick={() => void openProjectPhotoGallery(entry.projectId)}>
          Bilddoku öffnen
        </button>
      );
    }

    if (timeIssueFilter === "final") {
      return (
        <button type="button" className="timeIssueAction" onClick={() => openPostProcessFinalInspection(entry)}>
          Endkontrolle nachholen
        </button>
      );
    }

    return null;
  }

  const canShowNextStampStep =
    completionAction === "switch" && (!session || session.mode !== "project" || Boolean(workCompletionStatus));

  if (!loginUser) {
    return (
      <main className="loginShell">
        <section className="loginPanel" aria-label="WorkPilot360 Login">
          <img src="/workpilot360-logo-wide.png" alt="WorkPilot360" />
          <div>
            <p className="eyebrow">WorkPilot360 PWA</p>
            <h1>Anmelden</h1>
          </div>
          <form className="loginForm" onSubmit={submitLogin}>
            <label>
              E-Mail
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                autoComplete="email"
                placeholder="name@firma.de"
              />
            </label>
            <label>
              Passwort
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Passwort"
              />
            </label>
            <label className="rememberLogin">
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(event) => setRememberLogin(event.target.checked)}
              />
              <span>
                Angemeldet bleiben
                <small>auf diesem Gerät</small>
              </span>
            </label>
            {loginError && <div className="inlineError">{loginError}</div>}
            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Anmeldung läuft..." : "Anmelden"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <img className="brand" src="/workpilot360-logo-wide.png" alt="WorkPilot360" />
        <nav className="navList" aria-label="Bereiche">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                className={section.id === activeSection ? "navItem active" : "navItem"}
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="companySwitch">
          <img src="/oks-logo.png" alt="OK solutions" />
          <img src="/oki-logo.png" alt="OK immocare" />
        </div>
      </aside>

      <main className="main">
        <header className={activeSection === "home" ? "topbar homeTopbar" : "topbar"}>
          <img className="topbarLogo" src="/workpilot360-logo-header.png" alt="WorkPilot360" />
          <div className="topbarTitle">
            <p className="eyebrow">WorkPilot360 PWA</p>
            <h1>{visibleSections.find((section) => section.id === activeSection)?.label ?? "WorkPilot360"}</h1>
          </div>
          <div className="topbarActions">
            <button
              className={`iconButton notificationButton ${unreadNotifications.length ? "active" : ""}`}
              type="button"
              onClick={() => {
                setIsNotificationsOpen(true);
                setShowNotificationHistory(false);
                setNotificationSearchTerm("");
                void loadNotifications();
              }}
              title="Benachrichtigungen"
              aria-label="Benachrichtigungen"
            >
              <Bell size={18} />
              {unreadNotifications.length > 0 && <span>{unreadNotifications.length}</span>}
            </button>
            <button
              className="iconButton logoutButton"
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
              title="Abmelden"
            >
              <Power size={19} />
            </button>
          </div>
        </header>

        {state === "loading" && <div className="banner">Daten werden aus WorkPilot360 geladen...</div>}
        {error && (
          <div className="connectionNotice">
            <strong>Hauptprogramm nicht verbunden</strong>
            <span>
              Die App versucht automatisch, die Verbindung wiederherzustellen. Falls die Meldung bleibt, bitte die App kurz erneut öffnen.
            </span>
          </div>
        )}

        {activeSection === "home" && (
          <section className="contentGrid homeFocus">
            <div className="homePrimary">
              {renderStampClock(true)}
            </div>

            <div className="panel wide homeDayPlanPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Arbeitstag</p>
                  <h2>Heute eingeplant</h2>
                </div>
                <div className="panelHeaderActions">
                  <button type="button" onClick={() => void refreshHomePlanningData()} title="Planung und Bilder aktualisieren">
                    <RefreshCcw size={17} />
                  </button>
                  <CalendarDays size={20} />
                </div>
              </div>

              <div className="homeDayPlanSummary">
                <div>
                  <strong>{activeUser?.name || "Mitarbeiter"}</strong>
                  <span>
                    {longDateLabel(homePlanningDateKey)} | {activeUserDayPlanning.length} Termin
                    {activeUserDayPlanning.length === 1 ? "" : "e"}
                  </span>
                </div>
                <div className="homeDayPlanNav" aria-label="Tag wechseln">
                  <button
                    type="button"
                    onClick={() => setHomePlanningDateKey((current) => shiftDateKey(current, -1))}
                  >
                    Zurück
                  </button>
                  <button type="button" onClick={() => setHomePlanningDateKey(dateKey())}>
                    Heute
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomePlanningDateKey((current) => shiftDateKey(current, 1))}
                  >
                    Vor
                  </button>
                </div>
              </div>

              <div className="homeDayPlanList">
                {activeUserDayPlanning.map((entry) => {
                  const durationMinutes =
                    typeof entry.durationMinutes === "number"
                      ? entry.durationMinutes
                      : Math.max(0, minutesFromTime(entry.endTime) - minutesFromTime(entry.startTime));
                  const projectInfo = getPlanningProjectInfo(entry);
                  const photoCounts = getProjectPhotoCounts(entry.projectId);
                  const planningStatus = getPlanningEntryStatus(entry);
                  const isCurrentSession = planningStatus === "active";
                  const canStartPlanningEntry = ["open", "past", "interrupted"].includes(planningStatus);
                  const hasPlanningActions = isCurrentSession || canStartPlanningEntry;
                  const targetProgress = getPlanningEntryProgress(entry);
                  const showTargetProgress = isCurrentSession || targetProgress.percent > 0;
                  const visibleProgressPercent = Math.min(100, Math.round(targetProgress.percent));
                  const showProjectPhotos = canUseProjectPhotos(entry.projectId);
                  const projectPhotosLoading = showProjectPhotos && isProjectPhotoSummaryLoading();

                  return (
                    <article
                      className={`homeDayPlanItem ${hasPlanningActions ? "withActions" : "withoutActions"} ${
                        showTargetProgress ? "withProgress" : ""
                      } ${
                        isCurrentSession ? "currentSession" : ""
                      } ${planningStatus}`}
                      key={entry.id}
                    >
                      {showTargetProgress && (
                        <div
                          className={`homeDayPlanProgress ${targetProgress.overrun ? "overrun" : ""}`}
                          aria-label={`Vorgabeauslastung ${visibleProgressPercent} Prozent`}
                        >
                          <span style={{ width: `${targetProgress.width}%` }} />
                          <b>{visibleProgressPercent}%</b>
                        </div>
                      )}
                      <time>
                        <strong>{entry.startTime}</strong>
                        <span>{entry.endTime}</span>
                      </time>
                      <div className="homeDayPlanDetails">
                        <strong>{entry.title}</strong>
                        {entry.projectId ? (
                          <button
                            type="button"
                            className="homeDayPlanProjectLink"
                            onClick={() => openProjectFromPlanning(entry)}
                            title="Projekt öffnen"
                          >
                            Projekt: {projectInfo.projectLabel}
                          </button>
                        ) : (
                          <span>Projekt: {projectInfo.projectLabel}</span>
                        )}
                        <span>Kunde: {projectInfo.customer}</span>
                        <small>
                          {entry.board || "OK solutions"} | {entry.groupName || "Ohne Gruppe"} |{" "}
                          {(durationMinutes / 60).toLocaleString("de-DE", {
                            minimumFractionDigits: durationMinutes % 60 === 0 ? 0 : 1,
                            maximumFractionDigits: 1,
                          })}{" "}
                          Std.
                        </small>
                      </div>
                      <div className="homeDayPlanInfoRow">
                        <span className={`badge ${entry.projectId ? statusClass(entry.approvalStatus) : "neutral"} homeDayPlanKind`}>
                          {entry.projectId ? "Termin" : "Unproduktiv"}
                        </span>
                        <span className={`homePlanningStatus ${planningStatus}`}>
                          {planningStatusLabel(planningStatus)}
                        </span>
                        {showProjectPhotos && projectPhotosLoading && (
                          <span className="homePhotoPill missing">Bilder laden...</span>
                        )}
                        {showProjectPhotos && !projectPhotosLoading && (
                          <>
                            <button
                              type="button"
                              className={`homePhotoPill ${photoCounts.before > 0 ? "ok" : "missing"}`}
                              onClick={() => void openProjectPhotoCamera("Vorherbilder", entry.projectId)}
                              disabled={uploadingPhotoCategory !== "" || photoCounts.before >= 3}
                              title="Vorherbild aufnehmen"
                            >
                              V-Bilder {photoCounts.before}
                            </button>
                            <button
                              type="button"
                              className={`homePhotoPill ${photoCounts.after > 0 ? "ok" : "missing"}`}
                              onClick={() => void openProjectPhotoCamera("Nachherbilder", entry.projectId)}
                              disabled={uploadingPhotoCategory !== "" || photoCounts.after >= 3}
                              title="Nachherbild aufnehmen"
                            >
                              N-Bilder {photoCounts.after}
                            </button>
                          </>
                        )}
                      </div>
                      {hasPlanningActions && (
                        <div className="homeDayPlanActions">
                          <div className="roundActionGroup" aria-label="Stempelaktionen">
                            {!isCurrentSession && canStartPlanningEntry && (
                              <button
                                type="button"
                                className="roundAction startAction"
                                onClick={() => handlePlanningPlay(entry)}
                                title={session ? "Auf diesen Termin wechseln" : "Start"}
                                aria-label={session ? "Auf diesen Termin wechseln" : "Start"}
                              >
                                <Play size={22} fill="currentColor" />
                              </button>
                            )}
                            {isCurrentSession && (
                              <>
                                <button
                                  type="button"
                                  className="roundAction pauseAction"
                                  onClick={toggleSessionPause}
                                  title={session?.pauseStartedAt ? "Fortsetzen" : "Pause"}
                                  aria-label={session?.pauseStartedAt ? "Fortsetzen" : "Pause"}
                                >
                                  {session?.pauseStartedAt ? <Play size={20} fill="currentColor" /> : <Pause size={20} />}
                                </button>
                                <button
                                  type="button"
                                  className="roundAction switchAction"
                                  onClick={() => openCompletionDialog("switch")}
                                  title="Wechsel"
                                  aria-label="Wechsel"
                                >
                                  <RefreshCcw size={19} />
                                </button>
                                <button
                                  type="button"
                                  className="roundAction stopAction"
                                  onClick={() => openCompletionDialog("stop")}
                                  title="Stopp"
                                  aria-label="Stopp"
                                >
                                  <Square size={18} fill="currentColor" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
                {activeUserDayPlanning.length === 0 && (
                  <Empty text="Für diesen Tag sind für den Mitarbeiter keine Projekte eingeplant." />
                )}
              </div>
            </div>

            <div className="dashboardTiles">
              <Metric icon={Clock3} label="Heute gestempelt" value={Number((todayWorkedMs / 3_600_000).toFixed(1))} tone="green" compact />
              <Metric icon={CalendarDays} label="Heute geplant" value={todaysPlanning.length} tone="blue" compact />
              <Metric icon={ListChecks} label="Offene Aufgaben" value={openTasks.length} tone="blue" compact />
              <Metric icon={Clock3} label="Überfällig" value={overdueTasks.length} tone="red" compact />
              <Metric icon={Bell} label="Ungelesen" value={unreadNotifications.length} tone="amber" compact />
              <Metric icon={Users} label="Mitarbeiter" value={data.users.filter((user) => user.isActive !== false).length} tone="green" compact />
            </div>

            <div className="panel wide planningBoardPanel">
              {!selectedPlanningDay ? (
                <>
                  <div className="panelHeader">
                    <div>
                      <p className="eyebrow">Auslastung</p>
                      <h2>Planungsboard</h2>
                    </div>
                    <CalendarDays size={20} />
                  </div>
                  <div className="utilizationBoard" role="region" aria-label="Auslastung der naechsten Tage">
                    <div className="utilizationGrid">
                      <div className="utilizationCorner" />
                      {utilizationDays.map((day) => (
                        <div className={isWeekend(day) ? "utilizationDay weekend" : "utilizationDay"} key={dateKey(day)}>
                          <strong>{weekdayLabel(day)}</strong>
                          <span>{formatDate(day.toISOString())}</span>
                        </div>
                      ))}
                      {utilizationRows.map((row) => (
                        <Fragment key={row.groupName}>
                          <div className="utilizationGroup">
                            {row.groupName}
                          </div>
                          {row.days.map((day) => (
                            <button
                              type="button"
                              className={day.isWeekend ? "utilizationCell weekend" : "utilizationCell"}
                              data-load={day.percent >= 90 ? "high" : day.percent >= 60 ? "medium" : "low"}
                              key={`${row.groupName}-${day.key}`}
                              onClick={() => {
                                const { board, groupName } =
                                  row.groupName === "Gesamt"
                                    ? { board: "", groupName: "Gesamt" }
                                    : splitPlanningKey(row.groupName.replace(" | ", ":"));
                                setSelectedPlanningDay({ dateKey: day.key, board, groupName });
                              }}
                            >
                              {day.isWeekend ? (
                                <span className="weekendText">Wochenende</span>
                              ) : (
                                <>
                                  <strong>{day.percent}%</strong>
                                  <span>
                                    {day.plannedHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h/
                                    {day.capacityHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h
                                  </span>
                                  <i style={{ width: `${Math.min(100, day.percent)}%` }} />
                                </>
                              )}
                            </button>
                          ))}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="dayPlanningPanel">
                <div className="dayPlanningHeader">
                  <div>
                    <p className="eyebrow">Tagesplanung</p>
                    <h2>{longDateLabel(selectedPlanningDay.dateKey)}</h2>
                    <span>
                      {selectedPlanningDay.groupName === "Gesamt"
                        ? "Freigegebene Planung"
                        : `${selectedPlanningDay.board} | ${selectedPlanningDay.groupName}`}
                    </span>
                  </div>
                  <button type="button" onClick={() => setSelectedPlanningDay(null)}>
                    Zurück zum Planungsboard
                  </button>
                </div>
                <div className="dayTimeline">
                  <div className="workerHeader">Worker</div>
                  <div className="hoursHeader">
                    {Array.from({ length: 15 }, (_, index) => 6 + index).map((hour) => (
                      <span key={hour}>{String(hour).padStart(2, "0")}:00</span>
                    ))}
                  </div>
                  {dayPlanningUsers.map((user) => {
                    const entries = visiblePlanning.filter((entry) => {
                      if (entry.date !== selectedPlanningDay.dateKey) return false;
                      if (
                        selectedPlanningDay.groupName !== "Gesamt" &&
                        ((entry.board || "OK solutions") !== selectedPlanningDay.board ||
                          (entry.groupName || "Ohne Gruppe") !== selectedPlanningDay.groupName)
                      ) {
                        return false;
                      }
                      return entry.employeeName === user.name || (!entry.employeeName && user.name === "Nicht zugeordnet");
                    });
                    const plannedHours = entries.reduce((sum, entry) => {
                      if (typeof entry.durationMinutes === "number") return sum + entry.durationMinutes / 60;
                      return sum + Math.max(0, (minutesFromTime(entry.endTime) - minutesFromTime(entry.startTime)) / 60);
                    }, 0);
                    const targetHours = user.dailyWorkHours ?? 8;
                    const percent = targetHours > 0 ? Math.round((plannedHours / targetHours) * 100) : 0;

                    return (
                      <Fragment key={user.id}>
                        <div className="workerCell">
                          <strong>{user.name}</strong>
                          <span className={percent >= 100 ? "overload" : ""}>{percent}% ausgelastet</span>
                          <small>
                            {plannedHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h von{" "}
                            {targetHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h verplant
                          </small>
                        </div>
                        <div className="workerTimeline">
                          <span className="workWindow" />
                          <span className="pauseMarker">Pause</span>
                          {entries.map((entry) => {
                            const start = Math.max(360, minutesFromTime(entry.startTime));
                            const end = Math.min(1260, minutesFromTime(entry.endTime));
                            const left = ((start - 360) / 900) * 100;
                            const width = Math.max(4, ((end - start) / 900) * 100);
                            const style = { left: `${left}%`, width: `${width}%` };
                            const title = `${entry.startTime}-${entry.endTime} ${entry.title}`;

                            return entry.projectId ? (
                              <button
                                className="planningBar"
                                key={entry.id}
                                style={style}
                                title={`${title} öffnen`}
                                type="button"
                                onClick={() => openProjectFromPlanning(entry)}
                              >
                                {entry.title}
                              </button>
                            ) : (
                              <span
                                className="planningBar"
                                key={entry.id}
                                style={style}
                                title={title}
                              >
                                {entry.title}
                              </span>
                            );
                          })}
                        </div>
                      </Fragment>
                    );
                  })}
                  {dayPlanningUsers.length === 0 && <Empty text="Keine Mitarbeiter oder Planungen für diesen Tag." />}
                </div>
              </div>
              )}
            </div>

            <div className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Schnellanlage</p>
                  <h2>Aufgabe</h2>
                </div>
                <Send size={20} />
              </div>
              <form className="quickForm" onSubmit={createQuickTask}>
                <input
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  placeholder="Was ist zu tun?"
                />
                <button type="submit">Anlegen</button>
              </form>
            </div>

            <div className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Benachrichtigungen</p>
                  <h2>Rückkanal</h2>
                </div>
                <Bell size={20} />
              </div>
              <div className="stackList compact">
                {data.notifications.slice(0, 6).map((notification) => (
                  <article className={notification.readAt ? "listItem" : "listItem unread"} key={notification.id}>
                    <strong>{notification.subject}</strong>
                    <span>{notification.body}</span>
                  </article>
                ))}
                {data.notifications.length === 0 && <Empty text="Keine Nachrichten vorhanden." />}
              </div>
            </div>
          </section>
        )}

        {activeSection === "time" && (
          <section className="contentGrid timeSection">
            <div className="timeScopeBar">
              <div>
                <p className="eyebrow">Zeitraum</p>
                <h2>
                  {effectiveTimeViewMode === "company"
                    ? "Gesamtzeiten"
                    : effectiveTimeViewMode === "team"
                      ? "Teamzeiten"
                      : "Meine Zeiten"}
                </h2>
              </div>
              <div className="timeViewSwitch" aria-label="Zeitansicht wählen">
                {availableTimeViews.map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    className={effectiveTimeViewMode === mode ? "active" : ""}
                    onClick={() => setTimeViewMode(mode)}
                  >
                    {mode === "me" ? "Meine Zeiten" : mode === "team" ? "Team" : "Gesamt"}
                  </button>
                ))}
              </div>
            </div>

            <div className="timeMetrics">
              <Metric icon={Clock3} label="Heute" value={Number((timeTodayMs / 3_600_000).toFixed(1))} suffix="h" tone="green" />
              <Metric
                icon={CalendarDays}
                label="Diese Woche"
                value={Number((timeWeekMs / 3_600_000).toFixed(1))}
                suffix="h"
                tone="blue"
              />
              <Metric
                icon={ListChecks}
                label="Dieser Monat"
                value={Number((timeMonthMs / 3_600_000).toFixed(1))}
                suffix="h"
                tone="blue"
              />
              <Metric
                icon={Coffee}
                label="Unproduktiv"
                value={Number((unproductiveMonthMs / 3_600_000).toFixed(1))}
                suffix="h"
                tone="amber"
              />
            </div>

            <div className="panel wide">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">{timePeriodEntries.length} Buchungen</p>
                  <h2>Zeitnachweise</h2>
                </div>
                <ListChecks size={20} />
              </div>
              <div className="timePeriodSwitch" aria-label="Zeitraum wählen">
                {([
                  ["today", "Heute"],
                  ["week", "Woche"],
                  ["month", "Monat"],
                  ["all", "Alle"],
                ] as Array<[TimePeriod, string]>).map(([period, label]) => (
                  <button
                    type="button"
                    key={period}
                    className={timePeriod === period ? "active" : ""}
                    onClick={() => {
                      setTimePeriod(period);
                      setTimeIssueFilter("");
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="timeGroupedList">
                {effectiveTimeViewMode === "me"
                  ? timeDayGroups.map((group) => (
                      <section className="timeDayGroup" key={group.key}>
                        <header>
                          <div>
                            <strong>{formatFullDate(group.key)}</strong>
                            <span>{group.entries.length} Buchungen</span>
                          </div>
                          <div className="timeDayTotals">
                            <span>
                              <small>Gesamt</small>
                              <strong>{millisecondsToHours(group.totalMs)}</strong>
                            </span>
                            <span>
                              <small>Projekt</small>
                              <strong>{millisecondsToHours(group.projectMs)}</strong>
                            </span>
                            <span>
                              <small>Unproduktiv</small>
                              <strong>{millisecondsToHours(group.unproductiveMs)}</strong>
                            </span>
                          </div>
                        </header>
                        <div className="timeEntryList detailed">
                          {group.entries.map((entry) => {
                            const isInterrupted = entry.completionStatus === "interrupted";
                            const isProject = entry.mode === "project";
                            return (
                              <article
                                className={`timeEntryCard detailed ${isInterrupted ? "interrupted" : isProject ? "project" : "unproductive"}`}
                                key={entry.id}
                              >
                                <time>
                                  <strong>
                                    {entry.startTime} - {entry.endTime}
                                  </strong>
                                  <span>{millisecondsToHours(timeEntryNetMs(entry))}</span>
                                </time>
                                <div>
                                  <strong>{entry.projectLabel || (isProject ? "Projektzeit" : "Unproduktiv")}</strong>
                                  <span>{entry.comment?.trim() || "Ohne Kommentar"}</span>
                                  <small>{entry.employee || activeUser?.name || "Mitarbeiter"}</small>
                                </div>
                                <div className="timeEntryMeta">
                                  <span
                                    className={`homePlanningStatus ${isInterrupted ? "interrupted" : isProject ? "done" : "past"}`}
                                  >
                                    {isInterrupted ? "Unterbrochen" : isProject ? "Projekt" : "Unproduktiv"}
                                  </span>
                                  {renderTimeIssueActions(entry)}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    ))
                  : timeEmployeeGroups.map((employeeGroup) => (
                      <section className="timeEmployeeGroup" key={employeeGroup.user.id}>
                        <header>
                          <div>
                            <strong>{employeeGroup.user.name}</strong>
                            <span>{employeeGroup.user.roleLabel || employeeGroup.user.email}</span>
                          </div>
                          <b>{millisecondsToHours(employeeGroup.totalMs)}</b>
                        </header>
                        <div className="timeGroupedList nested">
                          {employeeGroup.dayGroups.map((group) => (
                            <section className="timeDayGroup" key={`${employeeGroup.user.id}-${group.key}`}>
                              <header>
                                <div>
                                  <strong>{formatFullDate(group.key)}</strong>
                                  <span>{group.entries.length} Buchungen</span>
                                </div>
                                <div className="timeDayTotals">
                                  <span>
                                    <small>Gesamt</small>
                                    <strong>{millisecondsToHours(group.totalMs)}</strong>
                                  </span>
                                  <span>
                                    <small>Projekt</small>
                                    <strong>{millisecondsToHours(group.projectMs)}</strong>
                                  </span>
                                  <span>
                                    <small>Unproduktiv</small>
                                    <strong>{millisecondsToHours(group.unproductiveMs)}</strong>
                                  </span>
                                </div>
                              </header>
                              <div className="timeEntryList detailed">
                                {group.entries.map((entry) => {
                                  const isInterrupted = entry.completionStatus === "interrupted";
                                  const isProject = entry.mode === "project";
                                  return (
                                    <article
                                      className={`timeEntryCard detailed ${isInterrupted ? "interrupted" : isProject ? "project" : "unproductive"}`}
                                      key={entry.id}
                                    >
                                      <time>
                                        <strong>
                                          {entry.startTime} - {entry.endTime}
                                        </strong>
                                        <span>{millisecondsToHours(timeEntryNetMs(entry))}</span>
                                      </time>
                                      <div>
                                        <strong>{entry.projectLabel || (isProject ? "Projektzeit" : "Unproduktiv")}</strong>
                                        <span>{entry.comment?.trim() || "Ohne Kommentar"}</span>
                                      </div>
                                      <div className="timeEntryMeta">
                                        <span
                                          className={`homePlanningStatus ${isInterrupted ? "interrupted" : isProject ? "done" : "past"}`}
                                        >
                                          {isInterrupted ? "Unterbrochen" : isProject ? "Projekt" : "Unproduktiv"}
                                        </span>
                                        {renderTimeIssueActions(entry)}
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            </section>
                          ))}
                        </div>
                      </section>
                    ))}
                {timePeriodEntries.length === 0 && <Empty text="Keine Zeiten im gewählten Bereich vorhanden." />}
              </div>
            </div>

            <div className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Nacharbeit</p>
                  <h2>Offene Punkte</h2>
                </div>
                <Clock3 size={20} />
              </div>
              <div className="timeAlertList">
                <button
                  className={`timeAlert ${interruptedTimeEntries.length ? "warning" : "ok"} ${timeIssueFilter === "interrupted" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setTimeIssueFilter(timeIssueFilter === "interrupted" ? "" : "interrupted")}
                >
                  <span>Unterbrochene Arbeiten</span>
                  <strong>{interruptedTimeEntries.length}</strong>
                  <small>
                    {interruptedTimeEntries.length
                      ? "Anklicken zeigt nur Arbeiten, die fortgeführt oder fachlich abgeschlossen werden sollten."
                      : "Keine offenen Unterbrechungen im gewählten Bereich."}
                  </small>
                </button>
                <button
                  className={`timeAlert ${photoDocumentationTimeEntries.length ? "warning" : "ok"} ${timeIssueFilter === "photos" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setTimeIssueFilter(timeIssueFilter === "photos" ? "" : "photos")}
                >
                  <span>Bilddoku offen</span>
                  <strong>{photoDocumentationTimeEntries.length}</strong>
                  <small>
                    {photoDocumentationTimeEntries.length
                      ? "Anklicken zeigt Projektzeiten, bei denen Vorher- oder Nachherbilder fehlen."
                      : "Für die Projektzeiten im Bereich ist die Bilddoku vollständig."}
                  </small>
                </button>
                <button
                  className={`timeAlert ${finalInspectionReviewTimeEntries.length ? "warning" : "ok"} ${timeIssueFilter === "final" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setTimeIssueFilter(timeIssueFilter === "final" ? "" : "final")}
                >
                  <span>Endkontrolle prüfen</span>
                  <strong>{finalInspectionReviewTimeEntries.length}</strong>
                  <small>
                    {finalInspectionReviewTimeEntries.length
                      ? "Anklicken zeigt Projektzeiten ohne eindeutigen Abschlussstatus."
                      : "Alle Projektzeiten im Bereich haben einen Abschlussstatus."}
                  </small>
                </button>
                {timeIssueFilter ? (
                  <button className="timeIssueReset" type="button" onClick={() => setTimeIssueFilter("")}>
                    Filter zurücksetzen
                  </button>
                ) : null}
              </div>
            </div>

            {effectiveTimeViewMode !== "me" && (
              <div className="panel wide">
                <div className="panelHeader">
                  <div>
                    <p className="eyebrow">{teamTimeRows.length} Personen</p>
                    <h2>{effectiveTimeViewMode === "company" ? "Unternehmensübersicht" : "Teamübersicht"}</h2>
                  </div>
                  <Users size={20} />
                </div>
                <div className="teamTimeList">
                  {teamTimeRows.map((row) => (
                    <article className={row.activeStamp ? "teamTimeRow active" : "teamTimeRow"} key={row.user.id}>
                      <div>
                        <strong>{row.user.name}</strong>
                        <span>{row.user.roleLabel || row.user.email}</span>
                      </div>
                      <div className="teamTimeValues">
                        <span>
                          Projekt <b>{millisecondsToHours(row.projectMs)}</b>
                        </span>
                        <span>
                          Unproduktiv <b>{millisecondsToHours(row.unproductiveMs)}</b>
                        </span>
                        <span>
                          Gesamt <b>{millisecondsToHours(row.totalMs)}</b>
                        </span>
                      </div>
                      <div className="teamTimeFlags">
                        {row.activeStamp && <span className="homePlanningStatus active">Aktiv</span>}
                        {row.interruptedCount > 0 && (
                          <span className="homePlanningStatus interrupted">{row.interruptedCount} unterbrochen</span>
                        )}
                        {row.missingCommentCount > 0 && (
                          <span className="homePlanningStatus past">{row.missingCommentCount} ohne Kommentar</span>
                        )}
                      </div>
                    </article>
                  ))}
                  {teamTimeRows.length === 0 && <Empty text="Keine Mitarbeiter für diese Ansicht vorhanden." />}
                </div>
              </div>
            )}
          </section>
        )}

        {activeSection === "tasks" && (
          <section className="contentGrid single">
            <div className="panel wide tasksPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">{visibleTasks.length} von {filteredTasks.length} Einträgen</p>
                  <h2>Aufgabenliste</h2>
                </div>
                <ListChecks size={20} />
              </div>
              <label className="sectionSearchBox">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Aufgaben suchen"
                />
              </label>
              <div className="taskSummaryGrid">
                <div className="taskSummaryTile">
                  <span>Offen</span>
                  <strong>{taskSummary.open}</strong>
                </div>
                <div className={`taskSummaryTile ${taskSummary.overdue > 0 ? "danger" : ""}`}>
                  <span>Überfällig</span>
                  <strong>{taskSummary.overdue}</strong>
                </div>
                <div className="taskSummaryTile">
                  <span>Heute fällig</span>
                  <strong>{taskSummary.dueToday}</strong>
                </div>
                <div className={`taskSummaryTile ${taskSummary.critical > 0 ? "warning" : ""}`}>
                  <span>Kritisch</span>
                  <strong>{taskSummary.critical}</strong>
                </div>
              </div>
              <div className="taskFilterBar" aria-label="Aufgaben filtern">
                {taskFilterOptions.map((option) => (
                  <button
                    className={taskFilter === option.id ? "active" : ""}
                    key={option.id}
                    type="button"
                    onClick={() => setTaskFilter(option.id)}
                  >
                    <span>{option.label}</span>
                    <strong>{option.count}</strong>
                  </button>
                ))}
              </div>
              {taskActionError ? <div className="taskActionError">{taskActionError}</div> : null}
              <div className="taskList">
                {visibleTasks.map((task) => (
                  <article className="taskCard" key={task.id}>
                    <button className="taskOpenArea" type="button" onClick={() => openTaskDetail(task.id)}>
                      <div className="taskCardTop">
                        <span className={`badge ${statusClass(task.status)}`}>{taskStatusLabel(task)}</span>
                        <span className={`taskPriority ${taskPriorityClass(task)}`}>
                          {taskPriorityLabel(task)}
                        </span>
                      </div>
                      <h3>{task.titel}</h3>
                      <p>{task.kunde || task.projectLabel || task.beschreibung || "Keine Zusatzinfo"}</p>
                      <div className="metaLine">
                        <span>{task.zustaendig || "Nicht zugewiesen"}</span>
                        <span>Fällig {formatDateTime(task.faelligkeit)}</span>
                      </div>
                    </button>
                    <div className="taskActions">
                      {canRespondToTask(task) ? (
                        <button type="button" onClick={() => respondToTask(task, "accepted")} disabled={isTaskSaving}>
                          <CheckCircle2 size={16} />
                          Annehmen
                        </button>
                      ) : null}
                      {canRespondToTask(task) ? (
                        <button type="button" onClick={() => respondToTask(task, "rejected")} disabled={isTaskSaving}>
                          Ablehnen
                        </button>
                      ) : null}
                      {!canRespondToTask(task) && isOpenTask(task) ? (
                        availableTaskStatusActions(task).map((action) => (
                          <button
                            className={normalizedText(action.status) === "erledigt" ? "statusDone" : ""}
                            key={action.status}
                            type="button"
                            onClick={() => updateTaskStatus(task, action.status)}
                            disabled={isTaskSaving}
                          >
                            {normalizedText(action.status) === "erledigt" ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <Clock3 size={16} />
                            )}
                            {action.label}
                          </button>
                        ))
                      ) : (
                        <button type="button" onClick={() => openTaskDetail(task.id)}>
                          Details
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                {visibleTasks.length === 0 && <Empty text="Keine Aufgaben gefunden." />}
              </div>
            </div>
          </section>
        )}

        {selectedTask && (
          <div className="modalOverlay" role="dialog" aria-modal="true">
            <div className="taskDetailDialog">
              <div className="taskDetailHeader">
                <div>
                  <p className="eyebrow">Aufgabe</p>
                  <h2>{selectedTask.titel}</h2>
                  <span>{selectedTask.kunde || selectedTask.projectLabel || "Ohne Kundenbezug"}</span>
                </div>
                <button type="button" onClick={() => setSelectedTaskId("")} aria-label="Aufgabe schließen">
                  ×
                </button>
              </div>
              <div className="taskStatusPanel">
                {canRespondToTask(selectedTask) ? (
                  <div className="taskDialogActions">
                    <button type="button" onClick={() => respondToTask(selectedTask, "accepted")} disabled={isTaskSaving}>
                      <CheckCircle2 size={16} />
                      Annehmen
                    </button>
                    <button type="button" onClick={() => respondToTask(selectedTask, "rejected")} disabled={isTaskSaving}>
                      Ablehnen
                    </button>
                  </div>
                ) : (
                  <label className={`taskStatusSelectField ${statusClass(selectedTask.status)}`}>
                    <span>Status</span>
                    <select
                      value={
                        TASK_STATUS_ACTIONS.find(
                          (action) => normalizedText(action.status) === normalizedText(selectedTask.status)
                        )?.status ?? "offen"
                      }
                      onChange={(event) => updateTaskStatus(selectedTask, event.target.value)}
                      disabled={isTaskSaving}
                    >
                      {TASK_STATUS_ACTIONS.map((action) => (
                        <option key={action.status} value={action.status}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div className="taskQuickSummary">
                <div>
                  <span>Fällig</span>
                  <strong>{formatDateTime(selectedTask.faelligkeit)}</strong>
                  {isTaskOverdue(selectedTask) ? <em>überfällig</em> : null}
                </div>
                <div>
                  <span>Zuständig</span>
                  <strong>{selectedTask.zustaendig || "Nicht zugewiesen"}</strong>
                </div>
                <div>
                  <span>Priorität</span>
                  <strong>{taskPriorityLabel(selectedTask)}</strong>
                </div>
              </div>
              <div className="taskReadonlyField">
                <span>Beschreibung</span>
                <p>{selectedTask.beschreibung || "Keine Beschreibung hinterlegt."}</p>
              </div>
              {taskActionError ? <div className="taskActionError">{taskActionError}</div> : null}
              <div className="taskDetailTabs" role="tablist" aria-label="Aufgabendetails">
                {[
                  { id: "comments" as const, label: "Kommentare", count: selectedTask.kommentare?.length ?? 0 },
                  { id: "participants" as const, label: "Beteiligte", count: (selectedTask.participants?.length ?? 0) + 1 },
                  { id: "details" as const, label: "Details" },
                  { id: "history" as const, label: "Historie", count: selectedTask.history?.length ?? 0 },
                ].map((tab) => (
                  <button
                    className={taskDetailTab === tab.id ? "active" : ""}
                    key={tab.id}
                    type="button"
                    onClick={() => setTaskDetailTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" ? <strong>{tab.count}</strong> : null}
                  </button>
                ))}
              </div>
              {taskDetailTab === "comments" ? (
                <div className="taskDetailSection">
                <h3>Kommentare</h3>
                {(selectedTask.kommentare ?? []).length ? (
                  <div className="taskChatList">
                    {[...(selectedTask.kommentare ?? [])]
                      .sort((first, second) => {
                        const firstTime = new Date(first.createdAt || first.erstelltAm || "").getTime();
                        const secondTime = new Date(second.createdAt || second.erstelltAm || "").getTime();
                        return (Number.isFinite(firstTime) ? firstTime : 0) - (Number.isFinite(secondTime) ? secondTime : 0);
                      })
                      .map((comment) => {
                        const author = comment.authorName || comment.autor || "Unbekannt";
                        const isOwnComment = normalizedText(author) === normalizedText(activeUser?.name);
                        return (
                          <article className={isOwnComment ? "taskChatMessage own" : "taskChatMessage"} key={comment.id}>
                            <div className="taskChatAvatar" aria-hidden="true">
                              {author.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="taskChatBubble">
                              <div className="taskChatMeta">
                                <strong>
                                  {author}
                                  {comment.recipientName ? ` an ${comment.recipientName}` : ""}
                                </strong>
                                <span>{formatDateTime(comment.createdAt || comment.erstelltAm)}</span>
                              </div>
                              <p>{comment.text}</p>
                            </div>
                          </article>
                        );
                      })}
                  </div>
                ) : (
                  <Empty text="Noch keine Kommentare vorhanden." />
                )}
                <form className="taskCommentForm" onSubmit={addTaskComment}>
                  <select
                    value={taskCommentRecipientId}
                    onChange={(event) => setTaskCommentRecipientId(event.target.value)}
                    disabled={isTaskSaving || selectedTaskCommentRecipients.length === 0}
                  >
                    <option value="">Kommentar an alle</option>
                    {selectedTaskCommentRecipients.map((recipient) => (
                      <option key={recipient.id} value={recipient.id}>
                        An {recipient.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows={2}
                    value={taskCommentText}
                    onChange={(event) => setTaskCommentText(event.target.value)}
                    placeholder="Kommentar schreiben"
                    disabled={isTaskSaving}
                  />
                  <button type="submit" disabled={!taskCommentText.trim() || isTaskSaving}>
                    <Send size={15} />
                    Senden
                  </button>
                </form>
                </div>
              ) : null}
              {taskDetailTab === "participants" ? (
                <div className="taskDetailSection">
                  <h3>Aufgabenbeteiligte</h3>
                  <div className="taskChipList">
                    <span className="taskInfoChip strong">
                      Zuständig: {selectedTask.zustaendig || "Nicht zugewiesen"}
                    </span>
                    {(selectedTask.participants ?? []).map((participant) => (
                      <span className="taskInfoChip" key={participant.id}>
                        {participant.name || participant.userName || "Beteiligte Person"}
                        {participant.roleLabel || participant.role ? ` · ${participant.roleLabel || participant.role}` : ""}
                        {participant.acceptanceStatus ? ` · ${participant.acceptanceStatus}` : ""}
                      </span>
                    ))}
                  </div>
                  <div className="taskParticipantControls">
                    <select
                      value={taskParticipantUserId}
                      onChange={(event) => setTaskParticipantUserId(event.target.value)}
                      disabled={isTaskSaving || selectedTaskAssignableUsers.length === 0}
                    >
                      <option value="">
                        {selectedTaskAssignableUsers.length ? "Kollegen hinzufügen" : "Keine weiteren Personen verfügbar"}
                      </option>
                      {selectedTaskAssignableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} {user.roleLabel ? `· ${user.roleLabel}` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addTaskParticipant}
                      disabled={!taskParticipantUserId || isTaskSaving}
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              ) : null}
              {taskDetailTab === "details" ? (
                <div className="taskDetailSection">
                  <h3>Details</h3>
                  <div className="taskMetaList">
                    <Detail label="Projekt" value={selectedTask.projectLabel || selectedTask.projectId || "-"} />
                    <Detail label="Kunde" value={selectedTask.kunde || "-"} />
                    <Detail label="Gewerk" value={selectedTask.gewerk || "-"} />
                    <Detail label="Angelegt von" value={selectedTask.createdByName || "-"} />
                    <Detail label="Angelegt am" value={formatDateTime(selectedTask.createdAt)} />
                  </div>
                </div>
              ) : null}
              {taskDetailTab === "history" ? (
                <div className="taskDetailSection taskHistorySection">
                  <h3>Historie</h3>
                  {selectedTask.history?.length ? (
                    <div className="taskHistoryTimeline">
                      {selectedTask.history.slice(0, 8).map((entry) => (
                        <div key={entry.id}>
                          <strong>{entry.event}</strong>
                          <span>{[entry.actorName, formatDateTime(entry.at || entry.createdAt)].filter(Boolean).join(" · ")}</span>
                          {entry.note ? <p>{entry.note}</p> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty text="Noch keine Historie vorhanden." />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {activeSection === "projects" && (
          <section className="contentGrid single">
            {selectedProject ? (
              <div className="panel wide projectDetail">
                <div className="projectDetailHeader">
                  <div>
                    <p className="eyebrow">Projekt</p>
                    <h2>{selectedProject.title}</h2>
                    <span>{selectedProject.customer || "Ohne Kunde"}</span>
                  </div>
                  <button type="button" onClick={() => setSelectedProjectId("")}>
                    Zurück zu Projekten
                  </button>
                </div>
                <div className="projectDetailGrid">
                  <Detail label="Status" value={selectedProject.status || "Lead"} />
                  <Detail label="Projektnummer" value={selectedProject.projectNumber || "-"} />
                  <Detail label="Verantwortlich" value={selectedProject.responsibleName || "-"} />
                  <Detail label="Projektende" value={formatDate(selectedProject.projectRuntimeUntil)} />
                  <Detail label="Budget" value={selectedProject.timeBudgetHours || "-"} />
                  <Detail label="Volumen" value={selectedProject.volume || "-"} />
                </div>
                <div className="projectRelated">
                  <div>
                    <p className="eyebrow">Heute geplant</p>
                    <strong>
                      {
                        visiblePlanning.filter(
                          (entry) => entry.projectId === selectedProject.id && normalizeDateKeyValue(entry.date) === dateKey()
                        ).length
                      }{" "}
                      Einsaetze
                    </strong>
                  </div>
                  <div>
                    <p className="eyebrow">Gestempelt</p>
                    <strong>
                      {millisecondsToHours(
                        data.timeEntries
                          .filter((entry) => entry.projectId === selectedProject.id)
                          .reduce((sum, entry) => sum + Math.max(0, entry.durationMs - entry.pauseMs), 0)
                      )}
                    </strong>
                  </div>
                </div>
                {canUseProjectPhotos(selectedProject.id) && (
                  <div className="projectPhotoGallery">
                    {(["Vorherbilder", "Nachherbilder"] as const).map((category) => {
                      const images = getProjectPhotoAttachments(selectedProject.id, category);
                      const isLoading = isProjectPhotoDetailLoading(selectedProject.id);
                      return (
                        <section key={category}>
                          <div className="projectPhotoGalleryHeader">
                            <div>
                              <p className="eyebrow">{category === "Vorherbilder" ? "Vorher" : "Nachher"}</p>
                              <h3>{images.length ? `${images.length} Bilder` : isLoading ? "Wird geladen..." : "0 Bilder"}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => void openProjectPhotoCamera(category, selectedProject.id)}
                              disabled={uploadingPhotoCategory !== "" || isLoading || images.length >= 3}
                            >
                              Aufnehmen
                            </button>
                          </div>
                          {images.length ? (
                            <div className="projectPhotoThumbGrid">
                              {images.map((image) => (
                                <a
                                  href={image.dataUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  key={`${image.entryId}-${image.name}-${image.attachmentIndex}`}
                                >
                                  <img src={image.dataUrl} alt={image.name} />
                                  <span>{image.name}</span>
                                </a>
                              ))}
                            </div>
                          ) : isLoading ? (
                            <div className="projectPhotoEmpty">Bilder werden geladen...</div>
                          ) : (
                            <div className="projectPhotoEmpty">Noch keine Bilder vorhanden.</div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="pipelineHeader">
                  <CompanyCard logo="/oks-logo.png" label="OK solutions" count={data.projects.length} />
                  <CompanyCard logo="/oki-logo.png" label="OK immocare" count={data.projects.length} />
                </div>
                <div className="projectGrid">
                  {data.projects.slice(0, 18).map((project) => (
                    <button
                      className="projectCard"
                      key={project.id}
                      type="button"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div>
                        <span className={`badge ${statusClass(project.status)}`}>{project.status || "Lead"}</span>
                        <h3>{project.title}</h3>
                        <p>{project.customer || "Ohne Kunde"}</p>
                      </div>
                      <dl>
                        <div>
                          <dt>Nr.</dt>
                          <dd>{project.projectNumber || "-"}</dd>
                        </div>
                        <div>
                          <dt>Bis</dt>
                          <dd>{formatDate(project.projectRuntimeUntil)}</dd>
                        </div>
                        <div>
                          <dt>Budget</dt>
                          <dd>{project.timeBudgetHours || "-"}</dd>
                        </div>
                      </dl>
                    </button>
                  ))}
                  {data.projects.length === 0 && <Empty text="Keine Projekte aus WorkPilot360 geladen." />}
                </div>
              </>
            )}
          </section>
        )}

        {activeSection === "appointments" && (
          <section className="contentGrid single">
            <div className="panel wide planningBoardPanel mobilePlanningPanel">
              {!selectedAppointmentDay ? (
                <>
                  <div className="panelHeader">
                    <div>
                      <p className="eyebrow">{appointmentWeekEntries.length} Termine</p>
                      <h2>Meine Termine</h2>
                    </div>
                    <CalendarCheck size={20} />
                  </div>
                  <div className="mobilePlanningIntro">
                    <div>
                      <strong>
                        Woche {formatDate(planningWeekStartKey)} - {formatDate(planningWeekEndKey)}
                      </strong>
                      <span>Tippe auf einen Tag, um deine Termine im Detail zu öffnen.</span>
                    </div>
                    <div className="planningWeekNav">
                      <button
                        type="button"
                        onClick={() => {
                          setPlanningWeekStartKey((current) => shiftDateKey(current, -7));
                          setSelectedAppointmentDayKey("");
                        }}
                      >
                        Zurück
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlanningWeekStartKey(startOfWeekKey());
                          setSelectedAppointmentDayKey("");
                        }}
                      >
                        Heute
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlanningWeekStartKey((current) => shiftDateKey(current, 7));
                          setSelectedAppointmentDayKey("");
                        }}
                      >
                        Vor
                      </button>
                    </div>
                  </div>
                  <div className="mobileUtilizationList" aria-label="Meine Termine">
                    <section className="mobileUtilizationBoard">
                      <header>
                        <strong>{activeUser?.name || "Meine Termine"}</strong>
                        <span>
                          {appointmentWeekEntries
                            .reduce((sum, entry) => {
                              if (typeof entry.durationMinutes === "number") return sum + entry.durationMinutes / 60;
                              return sum + Math.max(0, (minutesFromTime(entry.endTime) - minutesFromTime(entry.startTime)) / 60);
                            }, 0)
                            .toLocaleString("de-DE", { maximumFractionDigits: 1 })}
                          h geplant
                        </span>
                      </header>
                      <div className="mobileUtilizationDays">
                        {appointmentDays.map((day) => {
                          const load = day.percent >= 100 ? "high" : day.percent >= 70 ? "medium" : "low";
                          return (
                            <button
                              type="button"
                              className={day.isWeekend ? "mobileUtilizationDay weekend" : "mobileUtilizationDay"}
                              data-load={load}
                              key={day.key}
                              onClick={() => setSelectedAppointmentDayKey(day.key)}
                            >
                              <span className="mobileUtilizationDate">
                                <strong>{weekdayLabel(day.date).toUpperCase()}</strong>
                                <small>{formatDate(day.date.toISOString()).replace(/\.$/, "")}</small>
                              </span>
                              {day.isWeekend && day.entries.length === 0 ? (
                                <span className="mobileUtilizationWeekendText">Wochenende</span>
                              ) : (
                                <span className="mobileUtilizationLoad">
                                  <span className="mobileUtilizationTopline">
                                    <span className="mobileUtilizationProgress" aria-hidden="true">
                                      <i style={{ width: `${Math.min(100, day.percent)}%` }} />
                                    </span>
                                    <strong>{day.percent}%</strong>
                                  </span>
                                  <small>
                                    {day.entries.length} Termin{day.entries.length === 1 ? "" : "e"} |{" "}
                                    {day.plannedHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h
                                  </small>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                </>
              ) : (
                <div className="dayPlanningPanel mobileDayPlanning">
                  <div className="dayPlanningHeader">
                    <div>
                      <p className="eyebrow">Meine Termine</p>
                      <h2>{longDateLabel(selectedAppointmentDay.key)}</h2>
                      <span>
                        {selectedAppointmentDay.entries.length} Termin
                        {selectedAppointmentDay.entries.length === 1 ? "" : "e"}
                      </span>
                    </div>
                    <button type="button" onClick={() => setSelectedAppointmentDayKey("")}>
                      Zurück
                    </button>
                  </div>
                  <div className="mobileDayWorkerList">
                    <article className="mobileWorkerPlan">
                      <header>
                        <div>
                          <strong>{activeUser?.name || "Meine Termine"}</strong>
                          <span className={selectedAppointmentDay.percent >= 100 ? "overload" : ""}>
                            {selectedAppointmentDay.percent}% ausgelastet ·{" "}
                            {selectedAppointmentDay.plannedHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h von{" "}
                            {selectedAppointmentDay.capacityHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h
                          </span>
                        </div>
                        <i>
                          <b style={{ width: `${Math.min(100, selectedAppointmentDay.percent)}%` }} />
                        </i>
                      </header>
                      <div className="mobileWorkerEntries">
                        {selectedAppointmentDay.entries.map((entry) => {
                          const appointmentStatus = getPlanningEntryStatus(entry);
                          const isProject = Boolean(entry.projectId);
                          return (
                            <button
                              className={`mobileWorkerEntry ${isProject ? "project" : "unproductive"} ${appointmentStatus}`}
                              key={entry.id}
                              type="button"
                              onClick={() => entry.projectId && openProjectFromPlanning(entry)}
                              disabled={!entry.projectId}
                            >
                              <time>
                                {entry.startTime}
                                <span>{entry.endTime}</span>
                              </time>
                              <div>
                                <strong>{entry.title}</strong>
                                <span>{entry.projectLabel || entry.customer || entry.groupName}</span>
                              </div>
                              <small className={`badge ${statusClass(entry.approvalStatus)}`}>
                                {entry.approvalStatus || "confirmed"}
                              </small>
                            </button>
                          );
                        })}
                        {selectedAppointmentDay.entries.length === 0 && <Empty text="Keine eigenen Termine an diesem Tag." />}
                      </div>
                    </article>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === "planning" && canUsePlanningSection && (
          <section className="contentGrid single">
            <div className="panel wide planningBoardPanel mobilePlanningPanel">
              {!selectedPlanningDay ? (
                <>
                  <div className="panelHeader">
                    <div>
                      <p className="eyebrow">{visiblePlanning.length} Planungen</p>
                      <h2>Planungsboards</h2>
                    </div>
                    <CalendarDays size={20} />
                  </div>
                  <div className="mobilePlanningIntro">
                    <div>
                      <strong>
                        Woche {formatDate(planningWeekStartKey)} - {formatDate(planningWeekEndKey)}
                      </strong>
                      <span>Tippe auf einen Tag, um die Mitarbeiterplanung im Detail zu öffnen.</span>
                    </div>
                    <div className="planningWeekNav">
                      <button
                        type="button"
                        onClick={() => {
                          setPlanningWeekStartKey((current) => shiftDateKey(current, -7));
                          setSelectedPlanningDay(null);
                        }}
                      >
                        Zurück
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlanningWeekStartKey(startOfWeekKey());
                          setSelectedPlanningDay(null);
                        }}
                      >
                        Heute
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlanningWeekStartKey((current) => shiftDateKey(current, 7));
                          setSelectedPlanningDay(null);
                        }}
                      >
                        Vor
                      </button>
                    </div>
                  </div>
                  <div className="mobileUtilizationList" aria-label="Mobile Planungsboards">
                    {utilizationRows.map((row) => (
                      <section className="mobileUtilizationBoard" key={row.groupName}>
                        <header>
                          <strong>{row.groupName}</strong>
                          <span>
                            {row.days
                              .reduce((sum, day) => sum + day.plannedHours, 0)
                              .toLocaleString("de-DE", { maximumFractionDigits: 1 })}
                            h geplant
                          </span>
                        </header>
                        <div className="mobileUtilizationDays">
                          {row.days.map((day) => {
                            const load = day.percent >= 100 ? "high" : day.percent >= 70 ? "medium" : "low";
                            const { board, groupName } =
                              row.groupName === "Gesamt"
                                ? { board: "", groupName: "Gesamt" }
                                : splitPlanningKey(row.groupName.replace(" | ", ":"));

                            return (
                              <button
                                type="button"
                                className={day.isWeekend ? "mobileUtilizationDay weekend" : "mobileUtilizationDay"}
                                data-load={load}
                                key={`${row.groupName}-${day.key}`}
                                onClick={() => setSelectedPlanningDay({ dateKey: day.key, board, groupName })}
                              >
                                <span className="mobileUtilizationDate">
                                  <strong>{weekdayLabel(day.date).toUpperCase()}</strong>
                                  <small>{formatDate(day.date.toISOString()).replace(/\.$/, "")}</small>
                                </span>
                                {day.isWeekend ? (
                                  <span className="mobileUtilizationWeekendText">Wochenende</span>
                                ) : (
                                  <span className="mobileUtilizationLoad">
                                    <span className="mobileUtilizationTopline">
                                      <span className="mobileUtilizationProgress" aria-hidden="true">
                                        <i style={{ width: `${Math.min(100, day.percent)}%` }} />
                                      </span>
                                      <strong>{day.percent}%</strong>
                                    </span>
                                    <small>
                                      ({day.plannedHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h von{" "}
                                      {day.capacityHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h verplant)
                                    </small>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                    {utilizationRows.length === 0 && <Empty text="Keine freigegebenen Planungsboards für diese Ansicht vorhanden." />}
                  </div>
                </>
              ) : (
                <div className="dayPlanningPanel mobileDayPlanning">
                  <div className="dayPlanningHeader">
                    <div>
                      <p className="eyebrow">Tagesplanung</p>
                      <h2>{longDateLabel(selectedPlanningDay.dateKey)}</h2>
                      <span>
                        {selectedPlanningDay.groupName === "Gesamt"
                          ? "Alle freigegebenen Planungsgruppen"
                          : `${selectedPlanningDay.board} | ${selectedPlanningDay.groupName}`}
                      </span>
                    </div>
                    <button type="button" onClick={() => setSelectedPlanningDay(null)}>
                      Zurück
                    </button>
                  </div>
                  <div className="planningDayTabs two" role="tablist" aria-label="Tagesplanung Ansicht">
                    <button
                      type="button"
                      className={planningDayView === "board" ? "active" : ""}
                      onClick={() => setPlanningDayView("board")}
                    >
                      Tagesboard
                    </button>
                    <button
                      type="button"
                      className={planningDayView === "workers" ? "active" : ""}
                      onClick={() => setPlanningDayView("workers")}
                    >
                      Liste
                    </button>
                  </div>
                  {planningDayView === "board" ? (
                    <div className="mobilePlannerBoard" aria-label="Tagesboard">
                      <div className="mobilePlannerBoardCanvas">
                        <div className="mobilePlannerBoardHeader">
                          <span>Team</span>
                          {Array.from({ length: 14 }, (_, index) => 6 + index).map((hour) => (
                            <strong key={hour}>{`${String(hour).padStart(2, "0")}:00`}</strong>
                          ))}
                        </div>
                        {dayPlanningUsers.map((user) => {
                          const entries = dayPlanningEntries.filter(
                            (entry) => entry.employeeName === user.name || (!entry.employeeName && user.name === "Nicht zugeordnet")
                          );
                          const plannedHours = entries.reduce((sum, entry) => {
                            if (typeof entry.durationMinutes === "number") return sum + entry.durationMinutes / 60;
                            return sum + Math.max(0, (minutesFromTime(entry.endTime) - minutesFromTime(entry.startTime)) / 60);
                          }, 0);
                          const targetHours = user.dailyWorkHours ?? 8;
                          const percent = targetHours > 0 ? Math.round((plannedHours / targetHours) * 100) : 0;

                          return (
                            <div className="mobilePlannerBoardRow" key={user.id}>
                              <div className="mobilePlannerWorker">
                                <strong>{user.name}</strong>
                                <span className={percent >= 100 ? "overload" : ""}>
                                  {percent}% · {plannedHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h von{" "}
                                  {targetHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h
                                </span>
                              </div>
                              <div className="mobilePlannerLane">
                                {entries.map((entry) => {
                                  const startMinutes = Math.max(360, minutesFromTime(entry.startTime));
                                  const endMinutes = Math.min(1200, Math.max(startMinutes + 30, minutesFromTime(entry.endTime)));
                                  const left = ((startMinutes - 360) / 840) * 100;
                                  const width = ((endMinutes - startMinutes) / 840) * 100;
                                  const isDone = entry.approvalStatus === "done" || entry.approvalStatus === "completed";
                                  const isRequest = isPlanningRequest(entry);

                                  return (
                                    <button
                                      className={`mobilePlannerBar ${isDone ? "done" : ""} ${isRequest ? "requested" : ""}`}
                                      key={entry.id}
                                      type="button"
                                      data-approval={isRequest ? "requested" : entry.approvalStatus || "confirmed"}
                                      style={{ left: `${left}%`, width: `${Math.max(7, width)}%` }}
                                      onClick={() => openPlanningApproval(entry)}
                                      disabled={!canReschedulePlanningEntry(entry)}
                                      title={`${entry.startTime}-${entry.endTime} ${entry.title}`}
                                    >
                                      <strong>{isRequest ? "Terminwunsch" : entry.title}</strong>
                                      <span>{entry.startTime}-{entry.endTime}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {dayPlanningUsers.length === 0 && <Empty text="Keine Mitarbeiter oder Planungen für diesen Tag." />}
                      </div>
                    </div>
                  ) : (
                    <div className="mobileDayWorkerList">
                      {dayPlanningUsers.map((user) => {
                        const entries = dayPlanningEntries.filter(
                          (entry) => entry.employeeName === user.name || (!entry.employeeName && user.name === "Nicht zugeordnet")
                        );
                        const plannedHours = entries.reduce((sum, entry) => {
                          if (typeof entry.durationMinutes === "number") return sum + entry.durationMinutes / 60;
                          return sum + Math.max(0, (minutesFromTime(entry.endTime) - minutesFromTime(entry.startTime)) / 60);
                        }, 0);
                        const targetHours = user.dailyWorkHours ?? 8;
                        const percent = targetHours > 0 ? Math.round((plannedHours / targetHours) * 100) : 0;

                        return (
                          <article className="mobileWorkerPlan" key={user.id}>
                            <header>
                              <div>
                                <strong>{user.name}</strong>
                                <span className={percent >= 100 ? "overload" : ""}>
                                  {percent}% ausgelastet · {plannedHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h von{" "}
                                  {targetHours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h
                                </span>
                              </div>
                              <i>
                                <b style={{ width: `${Math.min(100, percent)}%` }} />
                              </i>
                            </header>
                            <div className="mobileWorkerEntries">
                              {entries.map((entry) => (
                                <button
                                  className="mobileWorkerEntry"
                                  key={entry.id}
                                  type="button"
                                  onClick={() => openPlanningApproval(entry)}
                                  disabled={!canReschedulePlanningEntry(entry)}
                                >
                                  <time>
                                    {entry.startTime}
                                    <span>{entry.endTime}</span>
                                  </time>
                                  <div>
                                    <strong>{isPlanningRequest(entry) ? `Terminwunsch: ${entry.title}` : entry.title}</strong>
                                    <span>{entry.projectLabel || entry.customer || entry.groupName}</span>
                                  </div>
                                  <small className={`badge ${statusClass(entry.approvalStatus)}`}>
                                    {isPlanningRequest(entry) ? "Prüfen" : "Umplanen"}
                                  </small>
                                </button>
                              ))}
                              {entries.length === 0 && <Empty text="Keine Termine für diesen Mitarbeiter." />}
                            </div>
                          </article>
                        );
                      })}
                      {dayPlanningUsers.length === 0 && <Empty text="Keine Mitarbeiter oder Planungen für diesen Tag." />}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === "personal" && (
          <section className="contentGrid single">
            <div className="personalHero panel">
              <div className="personalIdentity">
                {activeUser?.profileImageDataUrl ? (
                  <img src={activeUser.profileImageDataUrl} alt="" />
                ) : (
                  <em>{activeUser?.name?.slice(0, 1) || "?"}</em>
                )}
                <div>
                  <p className="eyebrow">Persönlicher Bereich</p>
                  <h2>{activeUser?.name || "Mitarbeiter"}</h2>
                  <span>{activeUser?.roleLabel || activeUser?.email || "-"}</span>
                </div>
              </div>
              <div className="personalFacts">
                <span>{(activeUser?.dailyWorkHours ?? 8).toLocaleString("de-DE")} Std./Tag</span>
                <span>{activeUser?.planningBoard || "OK solutions"}</span>
                <span>{activeUser?.email || "-"}</span>
              </div>
            </div>

            <div className="personalKpis">
              <Metric icon={CalendarDays} label="Resturlaub" value={remainingVacationDays} tone="blue" compact />
              <Metric icon={Clock3} label="Zeitkonto Std." value={Number(((monthWorkedMs / 3_600_000) - 40).toFixed(1))} tone="amber" compact />
              <Metric icon={ListChecks} label="Meine Aufgaben" value={openPersonalTasks.length} tone="blue" compact />
              <Metric icon={CalendarDays} label="Abwesenheiten" value={personalAbsences.length} tone="green" compact />
            </div>

            <div className="panel personalDataPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Stammdaten</p>
                  <h2>Meine Daten</h2>
                </div>
                <IdCard size={20} />
              </div>
              <div className="personalMasterData">
                <Detail label="Personalnummer" value={activeUser?.personalNumber || "-"} />
                <Detail label="Anrede" value={activeUser?.salutation || "-"} />
                <Detail label="Geburtsdatum" value={formatFullDate(activeUser?.birthDate)} />
                <Detail label="Sprache" value={activeUser?.language || "-"} />
                <Detail label="E-Mail" value={activeUser?.email || "-"} />
                <Detail label="Telefon" value={activeUser?.mobile || activeUser?.phone || "-"} />
                <Detail label="Adresse" value={[activeUser?.street, activeUser?.postalCode, activeUser?.city].filter(Boolean).join(", ") || "-"} />
                <Detail label="Planungsgruppe" value={`${activeUser?.planningBoard || "-"} | ${activeUser?.planningGroup || "-"}`} />
                <Detail label="Arbeitszeit" value={`${activeUser?.planningStartTime || "08:00"} - ${activeUser?.planningEndTime || "17:00"}`} />
                <Detail label="Freigegebene Boards" value={visiblePlanningGroups.map((group) => `${group.board} | ${group.groupName}`).join(", ") || "-"} />
              </div>
            </div>

            <div className="panel personalAbsenceRequestPanel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Abwesenheitsantrag</p>
                  <h2>Urlaub oder Krank melden</h2>
                </div>
                <Send size={20} />
              </div>
              <form className="personalAbsenceForm" onSubmit={submitAbsenceRequest}>
                <label>
                  Art
                  <select value={absenceType} onChange={(event) => setAbsenceType(event.target.value as "urlaub" | "krank")}>
                    <option value="urlaub">Urlaub</option>
                    <option value="krank">Krank</option>
                  </select>
                </label>
                <label>
                  Zeitraum
                  <span className="personalDateRange">
                    <input
                      type="date"
                      value={absenceDateFrom}
                      onChange={(event) => {
                        setAbsenceDateFrom(event.target.value);
                        setAbsenceDateTo((current) => current < event.target.value ? event.target.value : current);
                      }}
                    />
                    <input
                      type="date"
                      min={absenceDateFrom}
                      value={absenceDateTo}
                      onChange={(event) => setAbsenceDateTo(event.target.value)}
                    />
                  </span>
                </label>
                <label>
                  Tagesanteil
                  <select value={absenceDayPart} onChange={(event) => setAbsenceDayPart(event.target.value as "full" | "first-half" | "second-half")}>
                    <option value="full">Ganztägig</option>
                    <option value="first-half">1. Halbtag</option>
                    <option value="second-half">2. Halbtag</option>
                  </select>
                </label>
                <label>
                  Vertreter
                  <select value={absenceRepresentativeUserId} onChange={(event) => setAbsenceRepresentativeUserId(event.target.value)}>
                    <option value="">Bitte auswählen</option>
                    {representativeOptions.map((user) => (
                      <option value={user.id} key={user.id}>{user.name}</option>
                    ))}
                  </select>
                </label>
                <label className="fullWidth">
                  Notiz
                  <textarea
                    value={absenceNote}
                    onChange={(event) => setAbsenceNote(event.target.value)}
                    placeholder="Optional: wichtige Hinweise für Vertretung oder Führungskraft"
                  />
                </label>
                {absenceType === "urlaub" && (
                  <label className="personalHandoverCheck fullWidth">
                    <input
                      type="checkbox"
                      checked={absenceHandoverConfirmed}
                      onChange={(event) => setAbsenceHandoverConfirmed(event.target.checked)}
                    />
                    <span>Urlaubsübergabe ist erledigt: offene Aufgaben geprüft, Vertreter informiert.</span>
                  </label>
                )}
                {absenceActionError && <div className="inlineError fullWidth">{absenceActionError}</div>}
                {absenceActionMessage && <div className="inlineSuccess fullWidth">{absenceActionMessage}</div>}
                <button type="submit" className="primaryDialogButton fullWidth" disabled={isAbsenceSaving}>
                  {isAbsenceSaving ? "Speichern..." : "Antrag absenden"}
                </button>
              </form>
            </div>

            <div className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Abwesenheiten</p>
                  <h2>Meine Anträge</h2>
                </div>
                <CalendarDays size={20} />
              </div>
              <div className="stackList compact">
                {personalAbsences.slice(0, 6).map((absence) => (
                  <article className="listItem personalAbsenceItem" data-status={absence.status} key={absence.id}>
                    <strong>{formatDate(absence.date)} | {absenceTypeLabel(absence.type)}</strong>
                    <span>{absenceStatusLabel(absence.status)} | {absenceDayPartLabel(absence.dayPart)}</span>
                    <small>{absence.representativeName ? `Vertretung: ${absence.representativeName}` : "Keine Vertretung hinterlegt"}</small>
                    {absence.rejectionReason && <em>{absence.rejectionReason}</em>}
                  </article>
                ))}
                {personalAbsences.length === 0 && <Empty text="Noch keine Abwesenheitsanträge." />}
              </div>
            </div>

            <div className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Teamkalender</p>
                  <h2>Urlaub der Kollegen</h2>
                </div>
                <Users size={20} />
              </div>
              <div className="stackList compact">
                {colleagueVacationAbsences.slice(0, 10).map((absence) => (
                  <article className="listItem personalAbsenceItem" data-status={absence.status} key={absence.id}>
                    <strong>{absence.userName}</strong>
                    <span>{formatDate(absence.date)} | {absenceStatusLabel(absence.status)}</span>
                    <small>{absence.representativeName ? `Vertretung: ${absence.representativeName}` : "Vertretung offen"}</small>
                  </article>
                ))}
                {colleagueVacationAbsences.length === 0 && <Empty text="Keine kommenden Urlaube der Kollegen sichtbar." />}
              </div>
            </div>

            <div className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Nächste Schritte</p>
                  <h2>Aufgaben & Übergaben</h2>
                </div>
                <ListChecks size={20} />
              </div>
              <div className="stackList compact">
                {personalTasks.slice(0, 6).map((task) => (
                  <article className="listItem" key={task.id}>
                    <strong>{task.titel}</strong>
                    <span>{task.kunde || task.status} | {formatDateTime(task.faelligkeit)}</span>
                  </article>
                ))}
                {personalTasks.length === 0 && <Empty text="Keine eigenen Aufgaben vorhanden." />}
              </div>
            </div>
          </section>
        )}

        {activeSection === "contacts" && (
          <section className="contentGrid single">
            <div className="contactGrid">
              {filteredContacts.slice(0, 60).map((contact) => (
                <article className="contactCard" key={contact.id}>
                  <strong>{contactName(contact)}</strong>
                  <span>{contact.category || "Kontakt"} | {contact.customerNumber || "-"}</span>
                  <p>{[contact.city, contact.email, contact.mobile || contact.phone].filter(Boolean).join(" | ")}</p>
                </article>
              ))}
              {!query.trim() && <Empty text="Bitte einen Suchbegriff eingeben." />}
              {query.trim() && filteredContacts.length === 0 && <Empty text="Keine Kontakte gefunden." />}
            </div>
          </section>
        )}

        {activeSection === "team" && (
          <section className="contentGrid">
            <div className="panel wide">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">{activeTeamUsers.length} aktive Mitarbeiter</p>
                  <h2>Team</h2>
                </div>
                <Users size={20} />
              </div>
              <div className="teamGrid">
                {activeTeamUsers.map((user) => (
                  <article className="teamCard" key={user.id}>
                    <strong>{user.name}</strong>
                    <span>{user.roleLabel || user.email}</span>
                    <p>{user.planningBoard || "OK solutions"} | {user.planningGroup || "Gruppe"}</p>
                    <small>Aktiv</small>
                  </article>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Abwesenheiten</p>
                  <h2>Anträge</h2>
                </div>
                <CalendarDays size={20} />
              </div>
              <div className="stackList compact">
                {data.absences.slice(0, 12).map((absence) => (
                  <article className="listItem" key={absence.id}>
                    <strong>{absence.userName}</strong>
                    <span>
                      {formatDate(absence.date)} | {absence.type} | {absence.status}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {isStartDialogOpen && !session && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Stempelung starten">
          <section className="completionDialog startStampDialog">
            <header>
              <div>
                <p className="eyebrow">Stempelung starten</p>
                <h2>Wähle deine Tätigkeit</h2>
              </div>
            </header>

            <div className="completionStep">
              <div className="stampSetup">
                <div className="segmented">
                  <button
                    type="button"
                    className={stampMode === "project" ? "active" : ""}
                    onClick={() => {
                      setStampMode("project");
                      setPendingUnproductiveStampComment("");
                      setPendingUnproductiveStampLabel("");
                    }}
                  >
                    Projekt
                  </button>
                  <button
                    type="button"
                    className={stampMode === "unproductive" ? "active" : ""}
                    onClick={() => {
                      setStampMode("unproductive");
                      setStampProjectId("");
                      setStampProjectSearch("");
                      setPendingUnproductiveStampLabel("Unproduktiv");
                    }}
                  >
                    Unproduktiv
                  </button>
                </div>
                {stampMode === "project" && (
                  renderStampProjectSearch()
                )}
              </div>

              <label className="commentBox startStampCommentBox">
                <span>Was machst du gerade?</span>
                <textarea
                  value={stampStartComment}
                  onChange={(event) => setStampStartComment(event.target.value)}
                  placeholder="Kurze Tätigkeitsnotiz eintragen"
                />
              </label>
            </div>

            {stampError && <div className="inlineError">{stampError}</div>}

            <footer>
              <button type="button" className="secondaryDialogButton" onClick={closeStartDialog}>
                Abbrechen
              </button>
              <button type="button" className="primaryDialogButton" onClick={startStampSession}>
                Starten
              </button>
            </footer>
          </section>
        </div>
      )}

      {isLogoutDialogOpen && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Abmelden bestätigen">
          <section className="confirmDialog">
            <header>
              <div className="confirmDialogIcon">
                <Power size={30} />
              </div>
              <div>
                <p className="eyebrow">Abmelden</p>
                <h2>Willst du dich wirklich abmelden?</h2>
              </div>
            </header>
            <p>
              Du wirst auf diesem Gerät abgemeldet und musst dich danach erneut mit E-Mail und Passwort anmelden.
            </p>
            <footer>
              <button type="button" className="secondaryDialogButton" onClick={() => setIsLogoutDialogOpen(false)}>
                Nein
              </button>
              <button type="button" className="dangerDialogButton" onClick={() => void logout()}>
                Ja, abmelden
              </button>
            </footer>
          </section>
        </div>
      )}

      {completionAction && session && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Stempelung abschließen">
          <section className="completionDialog">
            <header>
              <div>
                <p className="eyebrow">
                  {completionAction === "switch" ? "Wechsel vorbereiten" : "Stempelung stoppen"}
                </p>
                <h2>{session.projectLabel}</h2>
              </div>
            </header>

            <div className="completionStep">
              <p className="stepTitle">1. Abschluss</p>
              <div className="startCommentBox">
                <span>Bereits beim Start erfasst</span>
                <strong>{session.comment?.trim() || "Keine Startnotiz erfasst."}</strong>
              </div>
              <details className="optionalCompletionDetails">
                <summary>Ergänzung hinzufügen (optional)</summary>
                <label className="commentBox">
                  <span>Möchtest du noch etwas ergänzen?</span>
                  <textarea
                    value={stampComment}
                    onChange={(event) => setStampComment(event.target.value)}
                    placeholder="Optional: Ergänzung zur abgeschlossenen Tätigkeit"
                  />
                </label>
              </details>
              {session.mode === "project" && (
                <>
                  {!workCompletionStatus ? (
                    <div className="completionWorkRow">
                      <span>Arbeit:</span>
                      <button
                        type="button"
                        className="workFinishedButton"
                        onClick={() => setWorkCompletionStatus("finished")}
                      >
                        fertig
                      </button>
                      <button
                        type="button"
                        className="workInterruptedButton"
                        onClick={() => setWorkCompletionStatus("interrupted")}
                      >
                        unterbrochen
                      </button>
                    </div>
                  ) : (
                    <div className={`completionStatusSummary ${workCompletionStatus}`}>
                      <span>Arbeit</span>
                      <strong>{workCompletionStatus === "finished" ? "fertig" : "unterbrochen"}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setWorkCompletionStatus("");
                          setCompletionAction("stop");
                          setNextStampComment("");
                          setPendingStampStartComment("");
                          setPendingUnproductiveStampComment("");
                          setPendingUnproductiveStampLabel("");
                        }}
                      >
                        ändern
                      </button>
                    </div>
                  )}
                </>
              )}
              {canShowNextStampStep && (
                <div className="dialogNextStamp">
                  <span>Neue Tätigkeit</span>
                  {switchPlanningSuggestions[0] ? (
                    <div className="switchSuggestionList primary">
                      {renderSwitchSuggestion(switchPlanningSuggestions[0], "Nächster Termin")}
                    </div>
                  ) : (
                    <div className="completionHint">Kein weiterer Tagestermin gefunden.</div>
                  )}
                  <details className="switchMoreOptions" open={switchPlanningSuggestions.length === 0}>
                    <summary>Andere Tätigkeit wählen</summary>
                    {switchPlanningSuggestions.length > 1 && (
                      <div className="switchSuggestionList compact">
                        {switchPlanningSuggestions
                          .slice(1)
                          .map((entry) => renderSwitchSuggestion(entry, "Tagestermin"))}
                      </div>
                    )}
                    <div className="completionChoice small">
                      <button
                        type="button"
                        className={stampMode === "project" && !pendingStampStartComment ? "active" : ""}
                        onClick={() => {
                          setStampMode("project");
                          setPendingStampStartComment("");
                          setPendingUnproductiveStampComment("");
                          setPendingUnproductiveStampLabel("");
                        }}
                      >
                        Anderes Projekt
                      </button>
                      <button
                        type="button"
                        className={stampMode === "unproductive" && !pendingStampStartComment ? "active" : ""}
                        onClick={() => {
                          setStampMode("unproductive");
                          setStampProjectId("");
                          setStampProjectSearch("");
                          setPendingStampStartComment("");
                          setPendingUnproductiveStampComment("Unproduktive Zeit");
                          setPendingUnproductiveStampLabel("Unproduktiv");
                        }}
                      >
                        Ich bin unproduktiv
                      </button>
                    </div>
                    {stampMode === "project" && !pendingStampStartComment && (
                      renderStampProjectSearch()
                    )}
                  </details>
                  <label className="commentBox nextStampCommentBox">
                    <span>Was machst du als Nächstes?</span>
                    <textarea
                      value={nextStampComment}
                      onChange={(event) => setNextStampComment(event.target.value)}
                      placeholder="Pflicht: kurze Startnotiz zur nächsten Tätigkeit"
                    />
                  </label>
                </div>
              )}
            </div>

            {workCompletionStatus === "finished" && session.mode === "project" && (
              <div className="completionStep">
                <p className="stepTitle">2. Endkontrolle</p>
                <label className="toggleRow">
                  <input
                    type="checkbox"
                    checked={finalInspectionByColleague}
                    onChange={(event) => setFinalInspectionByColleague(event.target.checked)}
                  />
                  <span>Endkontrolle wird vom Kollegen durchgeführt</span>
                </label>
                <div className="checklistGrid">
                  {finalInspectionItems.map((label) => (
                    <label key={label}>
                      <input
                        type="checkbox"
                        checked={Boolean(finalChecklist[label])}
                        disabled={finalInspectionByColleague}
                        onChange={(event) =>
                          setFinalChecklist((current) => ({
                            ...current,
                            [label]: event.target.checked,
                          }))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <div className="upsellBlock">
                  <span>Zusatzverkaufsmöglichkeiten vorhanden?</span>
                  <div className="completionChoice small">
                    <button
                      type="button"
                      className={upsellAnswer === "no" ? "active" : ""}
                      onClick={() => setUpsellAnswer("no")}
                    >
                      Nein
                    </button>
                    <button
                      type="button"
                      className={upsellAnswer === "yes" ? "active" : ""}
                      onClick={() => setUpsellAnswer("yes")}
                    >
                      Ja
                    </button>
                  </div>
                  {upsellAnswer === "yes" && (
                    <label className="commentBox">
                      <span>Falls ja, welche?</span>
                      <textarea
                        value={upsellNotes}
                        onChange={(event) => setUpsellNotes(event.target.value)}
                        placeholder="Zusatzverkauf kurz beschreiben"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {workCompletionStatus === "finished" && session.mode !== "project" && (
              <div className="completionHint">
                Für unproduktive Zeiten wird keine Endkontrolle gespeichert.
              </div>
            )}

            {stampError && <div className="inlineError">{stampError}</div>}

            {session.mode === "project" && workCompletionStatus && !canShowNextStampStep && (
              <div className="completionActionRow" aria-label="Nächste Aktion">
                <button
                  type="button"
                  className="completionStopAction"
                  onClick={completeStampAction}
                  disabled={isCompletingStamp}
                >
                  {isCompletingStamp ? "Speichern..." : "Stoppen"}
                </button>
                <button type="button" className="completionSwitchAction" onClick={prepareProjectFollowUp}>
                  Wechseln
                </button>
                <button type="button" className="completionUnproductiveAction" onClick={prepareUnproductiveFollowUp}>
                  Unproduktiv
                </button>
              </div>
            )}

            <footer>
              <button type="button" className="secondaryDialogButton" onClick={closeCompletionDialog} disabled={isCompletingStamp}>
                Abbrechen
              </button>
              {(completionAction !== "stop" || session.mode !== "project") && (
                <button type="button" className="primaryDialogButton" onClick={completeStampAction} disabled={isCompletingStamp}>
                  {isCompletingStamp
                    ? "Speichern..."
                    : completionAction === "switch"
                      ? "Wechseln"
                      : "Stoppen"}
                </button>
              )}
            </footer>
          </section>
        </div>
      )}

      {postProcessEntry && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Endkontrolle nachbearbeiten">
          <section className="completionDialog">
            <header>
              <div>
                <p className="eyebrow">Nachbearbeitung</p>
                <h2>{postProcessEntry.projectLabel || "Projektzeit"}</h2>
              </div>
              <button type="button" onClick={closePostProcessFinalInspection} disabled={isPostProcessing}>
                ×
              </button>
            </header>
            <div className="completionStep">
              <p className="stepTitle">Endkontrolle</p>
              <div className="startCommentBox">
                <span>Zeitbuchung</span>
                <strong>
                  {formatFullDate(postProcessEntry.date)} · {postProcessEntry.startTime} - {postProcessEntry.endTime}
                </strong>
              </div>
              <div className="startCommentBox">
                <span>Tätigkeitsnotiz</span>
                <strong>{postProcessEntry.comment?.trim() || "Keine Tätigkeitsnotiz erfasst."}</strong>
              </div>
              <label className="toggleRow">
                <input
                  type="checkbox"
                  checked={finalInspectionByColleague}
                  onChange={(event) => setFinalInspectionByColleague(event.target.checked)}
                />
                <span>Endkontrolle wird vom Kollegen durchgeführt</span>
              </label>
              <div className="checklistGrid">
                {finalInspectionItems.map((label) => (
                  <label key={label}>
                    <input
                      type="checkbox"
                      checked={Boolean(finalChecklist[label])}
                      disabled={finalInspectionByColleague}
                      onChange={(event) =>
                        setFinalChecklist((current) => ({
                          ...current,
                          [label]: event.target.checked,
                        }))
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="upsellBlock">
                <span>Zusatzverkaufsmöglichkeiten vorhanden?</span>
                <div className="completionChoice small">
                  <button
                    type="button"
                    className={upsellAnswer === "no" ? "active" : ""}
                    onClick={() => setUpsellAnswer("no")}
                  >
                    Nein
                  </button>
                  <button
                    type="button"
                    className={upsellAnswer === "yes" ? "active" : ""}
                    onClick={() => setUpsellAnswer("yes")}
                  >
                    Ja
                  </button>
                </div>
                {upsellAnswer === "yes" && (
                  <label className="commentBox">
                    <span>Falls ja, welche?</span>
                    <textarea
                      value={upsellNotes}
                      onChange={(event) => setUpsellNotes(event.target.value)}
                      placeholder="Zusatzverkauf kurz beschreiben"
                    />
                  </label>
                )}
              </div>
            </div>
            {postProcessError && <div className="inlineError">{postProcessError}</div>}
            <footer>
              <button
                type="button"
                className="secondaryDialogButton"
                onClick={closePostProcessFinalInspection}
                disabled={isPostProcessing}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="primaryDialogButton"
                onClick={savePostProcessFinalInspection}
                disabled={isPostProcessing}
              >
                {isPostProcessing ? "Speichern..." : "Endkontrolle speichern"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {pendingProjectPhoto && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Bild prüfen">
          <section className="photoReviewDialog">
            <header>
              <p className="eyebrow">
                {pendingProjectPhoto.category === "Vorherbilder" ? "Vorherbild" : "Nachherbild"}
              </p>
              <h2>Bild verwenden?</h2>
            </header>
            <img src={pendingProjectPhoto.previewUrl} alt="Aufgenommenes Projektbild" />
            {photoUploadError && <div className="inlineError">{photoUploadError}</div>}
            <div className="photoReviewActions">
              <button
                type="button"
                className="photoRetakeButton"
                onClick={retakeProjectPhoto}
                disabled={uploadingPhotoCategory !== ""}
              >
                Neu aufnehmen
              </button>
              <button
                type="button"
                className="photoUseButton"
                disabled={uploadingPhotoCategory !== ""}
                onClick={async () => {
                  const photo = pendingProjectPhoto;
                  const saved = await uploadProjectPhoto(photo.category, photo.file, photo.projectId);
                  if (saved) discardProjectPhotoPreview();
                }}
              >
                {uploadingPhotoCategory ? "Speichern..." : "Verwenden"}
              </button>
            </div>
            <button
              type="button"
              className="photoDiscardButton"
              onClick={discardProjectPhotoPreview}
              disabled={uploadingPhotoCategory !== ""}
            >
              Verwerfen
            </button>
          </section>
        </div>
      )}

      {photoGalleryProjectId && canUseProjectPhotos(photoGalleryProjectId) && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Projektbilder ansehen">
          <section className="projectPhotoDialog">
            <header>
              <div>
                <p className="eyebrow">Projektbilder</p>
                <h2>{photoGalleryProject?.title || session?.projectLabel || "Projekt"}</h2>
              </div>
              <button type="button" onClick={() => setPhotoGalleryProjectId("")} aria-label="Projektbilder schließen">
                ×
              </button>
            </header>
            {(["Vorherbilder", "Nachherbilder"] as const).map((category) => {
              const images = getProjectPhotoAttachments(photoGalleryProjectId, category);
              const isLoading = isProjectPhotoDetailLoading(photoGalleryProjectId);
              return (
                <section key={category} className="projectPhotoDialogSection">
                  <div className="projectPhotoGalleryHeader">
                    <div>
                      <p className="eyebrow">{category === "Vorherbilder" ? "Vorher" : "Nachher"}</p>
                      <h3>{images.length ? `${images.length} Bilder` : isLoading ? "Wird geladen..." : "0 Bilder"}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => void openProjectPhotoCamera(category, photoGalleryProjectId)}
                      disabled={uploadingPhotoCategory !== "" || isLoading || images.length >= 3}
                    >
                      Aufnehmen
                    </button>
                  </div>
                  {images.length ? (
                    <div className="projectPhotoThumbGrid">
                      {images.map((image) => (
                        <a
                          href={image.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          key={`${image.entryId}-${image.name}-${image.attachmentIndex}`}
                        >
                          <img src={image.dataUrl} alt={image.name} />
                          <span>{image.name}</span>
                        </a>
                      ))}
                    </div>
                  ) : isLoading ? (
                    <div className="projectPhotoEmpty">Bilder werden geladen...</div>
                  ) : (
                    <div className="projectPhotoEmpty">Noch keine Bilder vorhanden.</div>
                  )}
                </section>
              );
            })}
          </section>
        </div>
      )}

      {isNotificationsOpen && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Benachrichtigungen">
          <section className="notificationSheet">
            <header>
              <div>
                <p className="eyebrow">Benachrichtigungen</p>
                <h2>{showNotificationHistory ? "Alle Nachrichten" : "Neue Nachrichten"}</h2>
              </div>
              <button type="button" onClick={() => setIsNotificationsOpen(false)} aria-label="Benachrichtigungen schließen">
                ×
              </button>
            </header>
            <div className="notificationToolbar">
              <button
                type="button"
                className={!showNotificationHistory ? "active" : ""}
                onClick={() => {
                  setShowNotificationHistory(false);
                  setNotificationSearchTerm("");
                  void loadNotifications();
                }}
              >
                Neu {unreadNotifications.length > 0 ? unreadNotifications.length : ""}
              </button>
              <button
                type="button"
                className={showNotificationHistory ? "active" : ""}
                onClick={() => {
                  setShowNotificationHistory(true);
                  void loadNotifications({ history: true, search: notificationSearchTerm });
                }}
              >
                Alle
              </button>
              {unreadNotifications.length > 0 && (
                <button type="button" onClick={() => void markNotificationsRead()}>
                  Alle gelesen
                </button>
              )}
            </div>
            <div className={`pushSetupCard ${pushStatus}`}>
              <div>
                <strong>Push aufs Handy</strong>
                <span>
                  {pushStatus === "enabled"
                    ? "Dieses Gerät erhält Pushbenachrichtigungen."
                    : pushStatus === "blocked"
                      ? "Push ist auf diesem Gerät blockiert."
                      : pushStatus === "unsupported"
                        ? "Dieses Gerät unterstützt keine Web-Pushmeldungen."
                        : "Für Terminänderungen direkt benachrichtigt werden."}
                </span>
                {pushMessage && <small>{pushMessage}</small>}
                {pushDebugInfo && <small>{pushDebugInfo}</small>}
              </div>
              {pushStatus !== "enabled" && pushStatus !== "unsupported" && (
                <button type="button" onClick={() => void enablePushNotifications()} disabled={isPushSaving}>
                  {isPushSaving ? "Aktiviere..." : "Aktivieren"}
                </button>
              )}
            </div>
            {showNotificationHistory && (
              <label className="notificationSearch">
                <Search size={16} />
                <input
                  value={notificationSearchTerm}
                  onChange={(event) => {
                    const nextSearch = event.target.value;
                    setNotificationSearchTerm(nextSearch);
                    void loadNotifications({ history: true, search: nextSearch });
                  }}
                  placeholder="Nachricht suchen"
                />
              </label>
            )}
            {notificationActionError && <div className="inlineError">{notificationActionError}</div>}
            <div className="notificationList">
              {visibleNotifications.map((notification) => {
                const canOpenTarget = Boolean((notification.linkTarget || notification.taskId) && (notification.linkTargetId || notification.taskId));
                return (
                  <article className={notification.readAt ? "notificationItem" : "notificationItem unread"} key={notification.id}>
                    <div>
                      <strong>{notification.subject}</strong>
                      <span>{notification.body}</span>
                      <small>
                        {notification.readAt ? "Gelesen" : "Neu"} · {formatDateTime(notification.createdAt)}
                      </small>
                    </div>
                    {canOpenTarget && (
                      <button type="button" onClick={() => void openNotificationTarget(notification)}>
                        {notification.linkLabel || "Öffnen"}
                      </button>
                    )}
                  </article>
                );
              })}
              {visibleNotifications.length === 0 && (
                <Empty text={showNotificationHistory ? "Keine passenden Benachrichtigungen gefunden." : "Keine neuen Benachrichtigungen."} />
              )}
            </div>
          </section>
        </div>
      )}

      {reschedulePlanningEntry && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Termin umplanen">
          <section className="planningRescheduleDialog">
            <header>
              <div>
                <p className="eyebrow">Termin umplanen</p>
                <h2>{reschedulePlanningEntry.title}</h2>
                <span>{reschedulePlanningEntry.employeeName || "Nicht zugeordnet"}</span>
              </div>
              <button type="button" onClick={closePlanningReschedule} aria-label="Umplanen schließen">
                ×
              </button>
            </header>
            <div className="planningRescheduleInfo">
              <span>{reschedulePlanningEntry.projectLabel || reschedulePlanningEntry.customer || reschedulePlanningEntry.groupName}</span>
              <small>Nur Datum und Uhrzeit werden geändert. Projekt, Gewerk und Abrechnungsbezug bleiben unverändert.</small>
            </div>
            <div className="planningRescheduleGrid">
              <label>
                Datum
                <input type="date" value={rescheduleDate} onChange={(event) => setRescheduleDate(event.target.value)} />
              </label>
              <label>
                Start
                <input type="time" value={rescheduleStartTime} onChange={(event) => setRescheduleStartTime(event.target.value)} />
              </label>
              <label>
                Ende
                <input type="time" value={rescheduleEndTime} onChange={(event) => setRescheduleEndTime(event.target.value)} />
              </label>
            </div>
            {rescheduleError && <div className="inlineError">{rescheduleError}</div>}
            <footer>
              <button type="button" onClick={closePlanningReschedule} disabled={isReschedulingPlanning}>
                Abbrechen
              </button>
              <button className="primaryDialogButton" type="button" onClick={() => void savePlanningReschedule()} disabled={isReschedulingPlanning}>
                {isReschedulingPlanning ? "Speichern..." : "Umplanen"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {approvalPlanningEntry && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Terminwunsch prüfen">
          <section className="planningRescheduleDialog planningApprovalDialog">
            <header>
              <div>
                <p className="eyebrow">Terminwunsch prüfen</p>
                <h2>{approvalPlanningEntry.title}</h2>
                <span>
                  {approvalPlanningEntry.employeeName || "Nicht zugeordnet"} · angefragt von {approvalPlanningEntry.requestedByName || "unbekannt"}
                </span>
              </div>
              <button type="button" onClick={closePlanningApproval} aria-label="Freigabe schließen">
                ×
              </button>
            </header>
            <div className="planningRescheduleInfo planningApprovalInfo">
              <div className="planningApprovalProject">
                <span>Projekt / Bereich</span>
                <strong>{approvalPlanningEntry.projectLabel || approvalPlanningEntry.customer || approvalPlanningEntry.groupName}</strong>
              </div>
              <div className="planningApprovalMetaGrid">
                <div>
                  <span>Mitarbeiter</span>
                  <strong>{approvalPlanningEntry.employeeName || "Nicht zugeordnet"}</strong>
                </div>
                <div>
                  <span>Zeitwunsch</span>
                  <strong>
                    {formatFullDate(approvalPlanningEntry.date)}
                    <br />
                    {approvalPlanningEntry.startTime}-{approvalPlanningEntry.endTime}
                  </strong>
                </div>
              </div>
              {approvalPlanningEntry.description?.trim() && (
                <div className="planningApprovalDescription">
                  <span>Beschreibung</span>
                  <p>{approvalPlanningEntry.description.trim()}</p>
                </div>
              )}
            </div>
            {approvalConflicts.length > 0 && (
              <div className="planningConflictWarning">
                <strong>Konflikt möglich</strong>
                <span>
                  Überschneidet sich mit {approvalConflicts.length} Termin{approvalConflicts.length === 1 ? "" : "en"} für{" "}
                  {approvalPlanningEntry.employeeName || "diesen Mitarbeiter"}.
                </span>
              </div>
            )}
            <div className="planningRescheduleGrid">
              <label>
                Datum
                <input type="date" value={approvalDate} onChange={(event) => setApprovalDate(event.target.value)} />
              </label>
              <label>
                Start
                <input type="time" value={approvalStartTime} onChange={(event) => setApprovalStartTime(event.target.value)} />
              </label>
              <label>
                Ende
                <input type="time" value={approvalEndTime} onChange={(event) => setApprovalEndTime(event.target.value)} />
              </label>
            </div>
            {approvalError && <div className="inlineError">{approvalError}</div>}
            <footer className="planningApprovalActions">
              <button type="button" onClick={closePlanningApproval} disabled={isApprovingPlanning}>
                Abbrechen
              </button>
              <button type="button" className="dangerDialogButton" onClick={() => void savePlanningApproval({ approve: false })} disabled={isApprovingPlanning}>
                Ablehnen
              </button>
              <button type="button" onClick={() => void savePlanningApproval({ approve: true, useEditedTime: true })} disabled={isApprovingPlanning}>
                Umplanen & freigeben
              </button>
              <button className="primaryDialogButton" type="button" onClick={() => void savePlanningApproval({ approve: true })} disabled={isApprovingPlanning}>
                {isApprovingPlanning ? "Speichern..." : "Freigeben"}
              </button>
            </footer>
          </section>
        </div>
      )}

      <nav className={`mobileNav count-${mobileSections.length}`} aria-label="Mobile Bereiche">
        {mobileSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              className={section.id === activeSection ? "active" : ""}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              <Icon size={18} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  suffix = "",
  tone,
  compact = false,
}: {
  icon: typeof Home;
  label: string;
  value: number;
  suffix?: string;
  tone: string;
  compact?: boolean;
}) {
  return (
    <article className={`metric ${tone}${compact ? " compactMetric" : ""}`}>
      <Icon size={20} />
      <div>
        <span>{label}</span>
        <strong>
          {value}
          {suffix && <small>{suffix}</small>}
        </strong>
      </div>
    </article>
  );
}

function PhotoCaptureButton({
  label,
  count,
  canCapture,
  onCapture,
  onOpen,
}: {
  label: string;
  count: number;
  canCapture: boolean;
  onCapture: () => void;
  onOpen: () => void;
}) {
  const cappedCount = Math.min(3, count);
  return (
    <div className={`photoCaptureButton ${cappedCount > 0 ? "hasPhotos" : "missingPhotos"}`}>
      <button type="button" onClick={onOpen}>
        <span>{label}</span>
        <strong>{cappedCount}/3</strong>
      </button>
      <button type="button" disabled={!canCapture} onClick={onCapture} title={`${label} aufnehmen`}>
        <Camera size={15} />
      </button>
    </div>
  );
}

function CompanyCard({ logo, label, count }: { logo: string; label: string; count: number }) {
  return (
    <article className="companyCard">
      <img src={logo} alt={label} />
      <div>
        <strong>{label}</strong>
        <span>{count} Projekte verbunden</span>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detailItem">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="emptyState">{text}</div>;
}

export default App;

