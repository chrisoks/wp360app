import {
  Bell,
  BriefcaseBusiness,
  Camera,
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
  UserRound,
  Users,
} from "lucide-react";
import { Fragment, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type AppSection = "home" | "time" | "tasks" | "projects" | "planning" | "personal" | "contacts" | "team";

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
  gewerk?: string;
  rolle?: string;
  kundenklasse?: string;
  createdAt?: string;
  createdByName?: string;
  createdById?: string;
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

type Project = {
  id: string;
  projectNumber?: string;
  title: string;
  customer?: string;
  status?: string;
  responsibleName?: string;
  projectRuntimeUntil?: string;
  volume?: string;
  timeBudgetHours?: string;
};

type PlanningEntry = {
  id: string;
  board: string;
  groupName: string;
  userId?: string;
  employeeName?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  title: string;
  customer?: string;
  projectId?: string;
  projectLabel?: string;
  approvalStatus?: string;
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
  title: string;
  text: string;
  author?: string;
  attachments: LogbookAttachment[];
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
  createdAt: string;
  readAt: string | null;
};

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
  { id: "planning", label: "Planung", icon: CalendarDays },
  { id: "personal", label: "Persönlich", icon: IdCard },
  { id: "team", label: "Team", icon: Users },
  { id: "contacts", label: "Kontakte", icon: BriefcaseBusiness },
];
const mobileSectionIds: AppSection[] = ["home", "time", "tasks", "planning", "personal"];

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

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(endpoint(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
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

function readImageAttachment(file: File, name: string): Promise<LogbookAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    reader.onload = () =>
      resolve({
        name,
        type: "Bild",
        mimeType: file.type || "image/jpeg",
        size: file.size,
        dataUrl: String(reader.result ?? ""),
      });
    reader.readAsDataURL(file);
  });
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
  const [taskCommentText, setTaskCommentText] = useState("");
  const [taskCommentRecipientId, setTaskCommentRecipientId] = useState("");
  const [taskParticipantUserId, setTaskParticipantUserId] = useState("");
  const [taskActionError, setTaskActionError] = useState("");
  const [isTaskSaving, setIsTaskSaving] = useState(false);
  const [session, setSession] = useState<StampSession | null>(null);
  const [timerNow, setTimerNow] = useState(Date.now());
  const [stampMode, setStampMode] = useState<"project" | "unproductive">("project");
  const [stampProjectId, setStampProjectId] = useState("");
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
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [timeViewMode, setTimeViewMode] = useState<TimeViewMode>("me");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
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
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [uploadingPhotoCategory, setUploadingPhotoCategory] = useState<ProjectPhotoCategory | "">("");
  const [photoCaptureTarget, setPhotoCaptureTarget] = useState<{
    category: ProjectPhotoCategory;
    projectId: string;
  } | null>(null);
  const [pendingProjectPhoto, setPendingProjectPhoto] = useState<PendingProjectPhoto | null>(null);
  const beforePhotoInputRef = useRef<HTMLInputElement>(null);
  const afterPhotoInputRef = useRef<HTMLInputElement>(null);
  const isProjectLogbookLoadingRef = useRef(false);
  const hasProjectLogbookLoadedRef = useRef(false);

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
    const safeFetch = async <T,>(path: string, fallback: T): Promise<T> => {
      try {
        return await fetchJson<T>(path);
      } catch (loadError) {
        errors.push(loadError instanceof Error ? loadError.message : path);
        return fallback;
      }
    };

      const [tasks, contacts, users, projects, planning, absences, timeEntries] = await Promise.all([
      safeFetch<Task[]>("/api/tasks", []),
      safeFetch<Contact[]>("/api/contacts", []),
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

    setData((current) => ({
      ...current,
      tasks,
      contacts,
      users,
      projects,
      planning,
      absences,
      timeEntries,
      notifications,
    }));
    setSelectedUserId(nextUserId);
    await loadStampSession(nextUserId);
    setError(errors.join(" | "));
    setState("ready");
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
      const response = await fetch(endpoint("/api/auth/login"), {
        method: "POST",
        headers: {
          Accept: "application/json",
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

  function logout() {
    localStorage.removeItem(loginStorageKey);
    sessionStorage.removeItem(loginSessionStorageKey);
    setIsLogoutDialogOpen(false);
    setLoginUser(null);
    setSelectedUserId("");
    setSession(null);
    setData(emptyData);
    setState("idle");
    setActiveSection("home");
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

  async function loadProjectLogbookEntries() {
    if (hasProjectLogbookLoadedRef.current) return data.projectLogbookEntries;
    if (isProjectLogbookLoadingRef.current) return data.projectLogbookEntries;
    isProjectLogbookLoadingRef.current = true;
    try {
      const entries = await fetchJson<ProjectLogbookEntry[]>("/api/project-logbook-entries");
      hasProjectLogbookLoadedRef.current = true;
      setData((current) => ({ ...current, projectLogbookEntries: entries }));
      setError("");
      return entries;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Projektlogbuch konnte nicht geladen werden.");
      return data.projectLogbookEntries;
    } finally {
      isProjectLogbookLoadingRef.current = false;
    }
  }

  useEffect(() => {
    if (!loginUser) return;
    loadData(loginUser.id);
  }, []);

  useEffect(() => {
    if (!selectedUserId || state === "idle") return;
    fetchJson<Notification[]>(`/api/notifications?userId=${encodeURIComponent(selectedUserId)}`)
      .then((notifications) => setData((current) => ({ ...current, notifications })))
      .catch(() => undefined);
    loadStampSession(selectedUserId);
  }, [selectedUserId]);

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
    const intervalId = window.setInterval(() => {
      refreshPlanningData();
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [activeSection, selectedUserId]);

  useEffect(() => {
    if (activeSection !== "home") return;
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), 15_000);
    return () => window.clearInterval(intervalId);
  }, [activeSection]);

  useEffect(() => {
    return () => {
      if (pendingProjectPhoto?.previewUrl) URL.revokeObjectURL(pendingProjectPhoto.previewUrl);
    };
  }, [pendingProjectPhoto?.previewUrl]);

  useEffect(() => {
    if (!session && !stampProjectId && data.projects[0]) setStampProjectId(data.projects[0].id);
  }, [data.projects, session, stampProjectId]);

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
    return data.contacts.filter((contact) => {
      if (!normalized) return true;
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
  const unreadNotifications = data.notifications.filter((notification) => !notification.readAt);
  const selectedUserTimeEntries = data.timeEntries.filter(
    (entry) => entry.userId === activeUser?.id || entry.employee === activeUser?.name
  );
  const activeUserRole = normalizedText(activeUser?.roleLabel);
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
  const interruptedTimeEntries = timeViewEntries.filter((entry) => entry.completionStatus === "interrupted");
  const missingCommentTimeEntries = timeViewEntries.filter((entry) => !entry.comment?.trim());
  const timeEntryList = [...timeViewEntries].sort((first, second) => {
    const dateCompare = normalizeDateKeyValue(second.date).localeCompare(normalizeDateKeyValue(first.date));
    return dateCompare || second.startTime.localeCompare(first.startTime);
  });
  const timePeriodEntries = timeEntryList.filter((entry) => {
    const entryDateKey = normalizeDateKeyValue(entry.date);
    if (timePeriod === "today") return entryDateKey === dateKey();
    if (timePeriod === "week") return entryDateKey >= startOfWeekKey() && entryDateKey <= endOfWeekKey();
    if (timePeriod === "month") return entryDateKey.startsWith(monthKey());
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
  const selectedStampProject = data.projects.find((project) => project.id === stampProjectId);
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId);
  const activeProjectPhotoCounts = useMemo(() => {
    if (!session || session.mode !== "project") return { before: 0, after: 0 };
    return getProjectPhotoCounts(session.projectId);
  }, [data.projectLogbookEntries, session?.mode, session?.projectId]);
  const utilizationDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(dateFromKey(planningWeekStartKey), index)),
    [planningWeekStartKey]
  );
  const planningWeekEndKey = shiftDateKey(planningWeekStartKey, 6);
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
    const plannedUsers = visiblePlanning
      .filter((entry) => {
        if (normalizeDateKeyValue(entry.date) !== selectedPlanningDay.dateKey) return false;
        if (selectedPlanningDay.groupName === "Gesamt") return true;
        return (
          (entry.board || "OK solutions") === selectedPlanningDay.board &&
          (entry.groupName || "Ohne Gruppe") === selectedPlanningDay.groupName
        );
      })
      .map((entry) => ({
        id: entry.employeeName || entry.userId || entry.id,
        name: entry.employeeName || "Nicht zugeordnet",
        dailyWorkHours: 8,
      }));
    const byName = new Map<string, { id: string; name: string; dailyWorkHours?: number }>();
    [...groupUsers, ...plannedUsers].forEach((user) => {
      byName.set(user.name, { id: user.id, name: user.name, dailyWorkHours: user.dailyWorkHours });
    });
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [data.users, selectedPlanningDay, visiblePlanning]);

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

  function getProjectPhotoCounts(projectId?: string, entries = data.projectLogbookEntries) {
    if (!projectId) return { before: 0, after: 0 };

    const countImages = (category: "Vorherbilder" | "Nachherbilder") =>
      entries
        .filter((entry) => entry.projectId === projectId && entry.title === `Bilder: ${category}`)
        .reduce(
          (sum, entry) => sum + entry.attachments.filter((attachment) => attachment.type === "Bild").length,
          0
        );

    return {
      before: countImages("Vorherbilder"),
      after: countImages("Nachherbilder"),
    };
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
      await fetch(endpoint("/api/stamp-session"), {
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
      await fetch(endpoint("/api/stamp-session"), {
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

    const response = await fetch(endpoint("/api/stamp-session"), {
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
    const entries = await loadProjectLogbookEntries();
    const counts = getProjectPhotoCounts(projectId, entries);
    const count = category === "Vorherbilder" ? counts.before : counts.after;
    if (count >= 3) {
      setPhotoUploadError(`${category} sind bereits vollständig: maximal 3 Bilder.`);
      return;
    }
    setPhotoUploadError("");
    setPhotoCaptureTarget({ category, projectId });
    if (category === "Vorherbilder") beforePhotoInputRef.current?.click();
    else afterPhotoInputRef.current?.click();
  }

  function previewProjectPhoto(category: ProjectPhotoCategory, file?: File) {
    if (!file || !photoCaptureTarget) return;
    const previewUrl = URL.createObjectURL(file);
    if (pendingProjectPhoto?.previewUrl) URL.revokeObjectURL(pendingProjectPhoto.previewUrl);
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
    const entries = hasProjectLogbookLoadedRef.current ? data.projectLogbookEntries : await loadProjectLogbookEntries();
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
      const savedEntry = await fetchJson<ProjectLogbookEntry>("/api/project-logbook-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: `Bilder: ${category}`,
          text: `${category} per PWA hochgeladen`,
          author: activeUser?.name || session?.employee || "WorkPilot360 PWA",
          colleague: "",
          visibleFor: ["Geschaeftsfuehrer", "Vertriebler", "Niederlassungsleiter", "Monteur", "Buchhaltung"],
          attachments: [attachment],
        }),
      });
      setData((current) => ({
        ...current,
        projectLogbookEntries: [savedEntry, ...current.projectLogbookEntries],
      }));
      return true;
    } catch (uploadError) {
      setPhotoUploadError(uploadError instanceof Error ? uploadError.message : "Bild konnte nicht gespeichert werden.");
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
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === task.id ? { ...item, status } : item)),
    }));

    try {
      await fetch(endpoint("/api/tasks"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status }),
      });
      await loadData(selectedUserId);
    } catch {
      await loadData(selectedUserId);
    }
  }

  async function addTaskComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = taskCommentText.trim();
    if (!selectedTask || !activeUser || !text) return;

    setIsTaskSaving(true);
    setTaskActionError("");
    try {
      const response = await fetch(endpoint(`/api/tasks/${selectedTask.id}/comments`), {
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
      const response = await fetch(endpoint("/api/tasks"), {
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

  async function createQuickTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || !activeUser) return;

    const deadline = new Date();
    deadline.setHours(17, 0, 0, 0);

    try {
      await fetch(endpoint("/api/tasks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titel: title,
          beschreibung: "",
          status: "offen",
          prioritaet: "normal",
          zustaendigId: activeUser.id,
          faelligkeit: deadline.toISOString().slice(0, 16),
        }),
      });
      setNewTaskTitle("");
      await loadData(selectedUserId);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Aufgabe konnte nicht angelegt werden.");
      setState("error");
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
      const response = await fetch(endpoint("/api/absences"), {
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
          {session?.mode === "project" && (
            <div className="photoPillRow" aria-label="Projektbilder">
              <PhotoCaptureButton
                label="Vorher"
                count={activeProjectPhotoCounts.before}
                disabled={uploadingPhotoCategory !== "" || activeProjectPhotoCounts.before >= 3}
                onClick={() => void openProjectPhotoCamera("Vorherbilder")}
              />
              <PhotoCaptureButton
                label="Nachher"
                count={activeProjectPhotoCounts.after}
                disabled={uploadingPhotoCategory !== "" || activeProjectPhotoCounts.after >= 3}
                onClick={() => void openProjectPhotoCamera("Nachherbilder")}
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
                  setPendingUnproductiveStampLabel("Unproduktiv");
                }}
              >
                <Coffee size={16} />
                Unproduktiv
              </button>
            </div>
            {stampMode === "project" && (
              <select value={stampProjectId} onChange={(event) => setStampProjectId(event.target.value)}>
                {session && <option value="">Bitte auswählen</option>}
                {data.projects.map((project) => (
                  <option value={project.id} key={project.id}>
                    {project.projectNumber ? `${project.projectNumber} | ` : ""}
                    {project.title}
                  </option>
                ))}
              </select>
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
          {sections.map((section) => {
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
            <h1>{sections.find((section) => section.id === activeSection)?.label}</h1>
          </div>
          <div className="topbarActions">
            {activeSection !== "home" && (
              <label className="searchBox">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Suchen"
                />
              </label>
            )}
            <div className="currentUserBadge" title={loginUser.email}>
              {activeUser?.profileImageDataUrl ? (
                <img src={activeUser.profileImageDataUrl} alt="" />
              ) : (
                <UserRound size={16} />
              )}
              <span>{activeUser?.name ?? loginUser.name}</span>
            </div>
            <button className="iconButton" type="button" onClick={() => loadData(loginUser.id)} title="Aktualisieren">
              <RefreshCcw size={18} />
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
              Bitte WorkPilot360 auf Port 3001 starten. Danach oben auf Aktualisieren tippen.
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
                  <button type="button" onClick={refreshPlanningData} title="Planung aktualisieren">
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

                  return (
                    <article
                      className={`homeDayPlanItem ${hasPlanningActions ? "withActions" : "withoutActions"} ${
                        showTargetProgress ? "withProgress" : ""
                      } ${
                        isCurrentSession ? "currentSession" : ""
                      }`}
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
                        {entry.projectId && (
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
              <Metric icon={Clock3} label="Heute" value={Number((timeTodayMs / 3_600_000).toFixed(1))} tone="green" />
              <Metric
                icon={CalendarDays}
                label="Diese Woche"
                value={Number((timeWeekMs / 3_600_000).toFixed(1))}
                tone="blue"
              />
              <Metric
                icon={ListChecks}
                label="Dieser Monat"
                value={Number((timeMonthMs / 3_600_000).toFixed(1))}
                tone="blue"
              />
              <Metric
                icon={Coffee}
                label="Unproduktiv"
                value={Number((unproductiveMonthMs / 3_600_000).toFixed(1))}
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
                    onClick={() => setTimePeriod(period)}
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
                            <span>Gesamt {millisecondsToHours(group.totalMs)}</span>
                            <span>Projekt {millisecondsToHours(group.projectMs)}</span>
                            <span>Unproduktiv {millisecondsToHours(group.unproductiveMs)}</span>
                          </div>
                        </header>
                        <div className="timeEntryList detailed">
                          {group.entries.map((entry) => {
                            const isInterrupted = entry.completionStatus === "interrupted";
                            const isProject = entry.mode === "project";
                            return (
                              <article className="timeEntryCard detailed" key={entry.id}>
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
                                  <span>Gesamt {millisecondsToHours(group.totalMs)}</span>
                                  <span>Projekt {millisecondsToHours(group.projectMs)}</span>
                                  <span>Unproduktiv {millisecondsToHours(group.unproductiveMs)}</span>
                                </div>
                              </header>
                              <div className="timeEntryList detailed">
                                {group.entries.map((entry) => {
                                  const isInterrupted = entry.completionStatus === "interrupted";
                                  const isProject = entry.mode === "project";
                                  return (
                                    <article className="timeEntryCard detailed" key={entry.id}>
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
                  <p className="eyebrow">Prüfung</p>
                  <h2>Hinweise</h2>
                </div>
                <Clock3 size={20} />
              </div>
              <div className="timeAlertList">
                <article className={interruptedTimeEntries.length ? "timeAlert warning" : "timeAlert ok"}>
                  <span>Unterbrochene Arbeiten</span>
                  <strong>{interruptedTimeEntries.length}</strong>
                  <small>
                    {interruptedTimeEntries.length
                      ? "Diese Einträge sollten später fortgeführt oder fachlich abgeschlossen werden."
                      : "Keine offenen Unterbrechungen im gewählten Bereich."}
                  </small>
                </article>
                <article className={missingCommentTimeEntries.length ? "timeAlert warning" : "timeAlert ok"}>
                  <span>Ohne Kommentar</span>
                  <strong>{missingCommentTimeEntries.length}</strong>
                  <small>
                    {missingCommentTimeEntries.length
                      ? "Diese Zeiten sind für Nachvollziehbarkeit und Abrechnung dünn dokumentiert."
                      : "Alle Zeiten haben eine Tätigkeitsnotiz."}
                  </small>
                </article>
                <article className={session ? "timeAlert active" : "timeAlert ok"}>
                  <span>Live-Stempelung</span>
                  <strong>{session ? "läuft" : "aus"}</strong>
                  <small>{session ? session.projectLabel : "Aktuell ist keine zentrale Session aktiv."}</small>
                </article>
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
              <div className="taskList">
                {visibleTasks.map((task) => (
                  <article className="taskCard" key={task.id}>
                    <button className="taskOpenArea" type="button" onClick={() => setSelectedTaskId(task.id)}>
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
                      {isOpenTask(task) && normalizedText(task.status) !== "in bearbeitung" ? (
                        <button type="button" onClick={() => updateTaskStatus(task, "in Bearbeitung")}>
                          <Clock3 size={16} />
                          In Arbeit
                        </button>
                      ) : null}
                      {isOpenTask(task) && normalizedText(task.status) === "in bearbeitung" ? (
                        <button type="button" onClick={() => updateTaskStatus(task, "wartet auf Rückmeldung")}>
                          <Clock3 size={16} />
                          Warten
                        </button>
                      ) : null}
                      {isOpenTask(task) ? (
                        <button type="button" onClick={() => updateTaskStatus(task, "erledigt")}>
                          <CheckCircle2 size={16} />
                          Erledigt
                        </button>
                      ) : (
                        <button type="button" onClick={() => setSelectedTaskId(task.id)}>
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
              <div className="taskDetailChips">
                <span className={`badge ${statusClass(selectedTask.status)}`}>{taskStatusLabel(selectedTask)}</span>
                <span className={`taskPriority ${taskPriorityClass(selectedTask)}`}>
                  {taskPriorityLabel(selectedTask)}
                </span>
                {isTaskOverdue(selectedTask) ? <span className="badge danger">überfällig</span> : null}
              </div>
              <div className="taskDetailGrid">
                <Detail label="Zuständig" value={selectedTask.zustaendig || "Nicht zugewiesen"} />
                <Detail label="Fällig" value={formatDateTime(selectedTask.faelligkeit)} />
                <Detail label="Kunde" value={selectedTask.kunde || "-"} />
                <Detail label="Projekt" value={selectedTask.projectLabel || selectedTask.projectId || "-"} />
                <Detail label="Gewerk" value={selectedTask.gewerk || "-"} />
                <Detail label="Angelegt von" value={selectedTask.createdByName || "-"} />
                <Detail label="Angelegt am" value={formatDateTime(selectedTask.createdAt)} />
              </div>
              <div className="taskReadonlyField">
                <span>Beschreibung</span>
                <p>{selectedTask.beschreibung || "Keine Beschreibung hinterlegt."}</p>
              </div>
              <div className="taskDialogActions">
                {isOpenTask(selectedTask) ? (
                  <>
                    <button type="button" onClick={() => updateTaskStatus(selectedTask, "in Bearbeitung")}>
                      <Clock3 size={16} />
                      In Arbeit
                    </button>
                    <button type="button" onClick={() => updateTaskStatus(selectedTask, "wartet auf Rückmeldung")}>
                      <Clock3 size={16} />
                      Warten
                    </button>
                    <button type="button" onClick={() => updateTaskStatus(selectedTask, "erledigt")}>
                      <CheckCircle2 size={16} />
                      Erledigt
                    </button>
                  </>
                ) : normalizedText(selectedTask.status) === "erledigt" ? (
                  <button type="button" onClick={() => updateTaskStatus(selectedTask, "offen")}>
                    Wieder öffnen
                  </button>
                ) : (
                  <button type="button" onClick={() => setSelectedTaskId("")}>
                    Nur anzeigen
                  </button>
                )}
              </div>
              {taskActionError ? <div className="taskActionError">{taskActionError}</div> : null}
              <div className="taskDetailSection">
                <h3>Aufgabenbeteiligte</h3>
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
              </div>
              <div className="taskDetailSection">
                <h3>Kommentare</h3>
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
                    rows={3}
                    value={taskCommentText}
                    onChange={(event) => setTaskCommentText(event.target.value)}
                    placeholder="Kommentar schreiben"
                    disabled={isTaskSaving}
                  />
                  <button type="submit" disabled={!taskCommentText.trim() || isTaskSaving}>
                    Kommentar speichern
                  </button>
                </form>
                {(selectedTask.kommentare ?? []).length ? (
                  <div className="taskTimeline">
                    {(selectedTask.kommentare ?? []).map((comment) => (
                      <div key={comment.id}>
                        <strong>
                          {comment.authorName || comment.autor || "Unbekannt"}
                          {comment.recipientName ? ` an ${comment.recipientName}` : ""}
                        </strong>
                        <span>{formatDateTime(comment.createdAt || comment.erstelltAm)}</span>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty text="Noch keine Kommentare vorhanden." />
                )}
              </div>
              {selectedTask.history?.length ? (
                <div className="taskDetailSection">
                  <h3>Historie</h3>
                  <div className="taskTimeline">
                    {selectedTask.history.slice(0, 5).map((entry) => (
                      <div key={entry.id}>
                        <strong>{entry.event}</strong>
                        <span>{[entry.actorName, formatDateTime(entry.at || entry.createdAt)].filter(Boolean).join(" · ")}</span>
                        {entry.note ? <p>{entry.note}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <button className="dialogCancel" type="button" onClick={() => setSelectedTaskId("")}>
                Schließen
              </button>
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

        {activeSection === "planning" && (
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
                  <div className="mobileDayWorkerList">
                    {dayPlanningUsers.map((user) => {
                      const entries = visiblePlanning
                        .filter((entry) => {
                          if (normalizeDateKeyValue(entry.date) !== selectedPlanningDay.dateKey) return false;
                          if (
                            selectedPlanningDay.groupName !== "Gesamt" &&
                            ((entry.board || "OK solutions") !== selectedPlanningDay.board ||
                              (entry.groupName || "Ohne Gruppe") !== selectedPlanningDay.groupName)
                          ) {
                            return false;
                          }
                          return entry.employeeName === user.name || (!entry.employeeName && user.name === "Nicht zugeordnet");
                        })
                        .sort((a, b) => `${a.startTime}${a.title}`.localeCompare(`${b.startTime}${b.title}`));
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
                            ))}
                            {entries.length === 0 && <Empty text="Keine Termine für diesen Mitarbeiter." />}
                          </div>
                        </article>
                      );
                    })}
                    {dayPlanningUsers.length === 0 && <Empty text="Keine Mitarbeiter oder Planungen für diesen Tag." />}
                  </div>
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
              {filteredContacts.length === 0 && <Empty text="Keine Kontakte gefunden." />}
            </div>
          </section>
        )}

        {activeSection === "team" && (
          <section className="contentGrid">
            <div className="panel wide">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">{data.users.length} Mitarbeiter</p>
                  <h2>Team</h2>
                </div>
                <Users size={20} />
              </div>
              <div className="teamGrid">
                {data.users.map((user) => (
                  <article className="teamCard" key={user.id}>
                    <strong>{user.name}</strong>
                    <span>{user.roleLabel || user.email}</span>
                    <p>{user.planningBoard || "OK solutions"} | {user.planningGroup || "Gruppe"}</p>
                    <small>{user.isActive === false ? "Inaktiv" : "Aktiv"}</small>
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
                      setPendingUnproductiveStampLabel("Unproduktiv");
                    }}
                  >
                    <Coffee size={16} />
                    Unproduktiv
                  </button>
                </div>
                {stampMode === "project" && (
                  <select value={stampProjectId} onChange={(event) => setStampProjectId(event.target.value)}>
                    {data.projects.map((project) => (
                      <option value={project.id} key={project.id}>
                        {project.projectNumber ? `${project.projectNumber} | ` : ""}
                        {project.title}
                      </option>
                    ))}
                  </select>
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
              <button type="button" className="dangerDialogButton" onClick={logout}>
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
                          setPendingStampStartComment("");
                          setPendingUnproductiveStampComment("Unproduktive Zeit");
                          setPendingUnproductiveStampLabel("Unproduktiv");
                        }}
                      >
                        Ich bin unproduktiv
                      </button>
                    </div>
                    {stampMode === "project" && !pendingStampStartComment && (
                      <select
                        value={stampProjectId}
                        onChange={(event) => {
                          setStampProjectId(event.target.value);
                          setPendingStampStartComment("");
                          setPendingUnproductiveStampComment("");
                          setPendingUnproductiveStampLabel("");
                        }}
                      >
                        <option value="">Bitte auswählen</option>
                        {data.projects.map((project) => (
                          <option value={project.id} key={project.id}>
                            {project.projectNumber ? `${project.projectNumber} | ` : ""}
                            {project.title}
                          </option>
                        ))}
                      </select>
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

      <nav className="mobileNav" aria-label="Mobile Bereiche">
        {sections.filter((section) => mobileSectionIds.includes(section.id)).map((section) => {
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
  tone,
  compact = false,
}: {
  icon: typeof Home;
  label: string;
  value: number;
  tone: string;
  compact?: boolean;
}) {
  return (
    <article className={`metric ${tone}${compact ? " compactMetric" : ""}`}>
      <Icon size={20} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function PhotoCaptureButton({
  label,
  count,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const cappedCount = Math.min(3, count);
  return (
    <button
      className={`photoCaptureButton ${cappedCount > 0 ? "hasPhotos" : "missingPhotos"}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <Camera size={15} />
      <span>{label}</span>
      <strong>{cappedCount}/3</strong>
    </button>
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

