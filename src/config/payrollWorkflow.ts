// ============================================================
// Payroll approval workflow — single source of truth for the
// stage/role/decision state machine.
//
// Stage numbers:
//   0 = with ACCOUNTANT (initial submission, or returned for revision)
//   1 = with HRM                       — pre-approval review
//   2 = with GM_FINANCE                — pre-approval review
//   3 = with MD                        — approve / reject
//   4 = with GM_FINANCE (post-approval) — payment processing
//   5 = with ACCOUNTANT (post-approval) — payment processing
//   6 = with CASHIER                   — pays out
//   7 = PAID (terminal)
//
// Stages 0-3 are the "pre-approval" phase: visibility is restricted
// to the current owner plus anyone who has already acted on this
// specific payroll. Stages 4+ (approved by MD onward, incl. PAID)
// are visible to every role.
// ============================================================

export interface StageTransition {
  nextStage: number;
  status: string;
  label: string;
}

export interface StageRule {
  ownerRole: string;
  commentRequired: boolean;
  decisions: Record<string, StageTransition>;
}

export const PAYROLL_STAGES: Record<number, StageRule> = {
  0: {
    ownerRole: "ACCOUNTANT",
    commentRequired: true,
    decisions: {
      submit: { nextStage: 1, status: "PENDING APPROVAL", label: "Submitted the payroll" },
    },
  },
  1: {
    ownerRole: "HRM",
    commentRequired: true,
    decisions: {
      forward: { nextStage: 2, status: "PENDING APPROVAL", label: "Forwarded to GM Finance" },
      defer: { nextStage: 0, status: "PENDING APPROVAL", label: "Deferred back to Accountant" },
    },
  },
  2: {
    ownerRole: "GM_FINANCE",
    commentRequired: true,
    decisions: {
      forward: { nextStage: 3, status: "PENDING APPROVAL", label: "Forwarded to MD" },
      defer: { nextStage: 1, status: "PENDING APPROVAL", label: "Deferred back to HRM" },
    },
  },
  3: {
    ownerRole: "MD",
    commentRequired: false,
    decisions: {
      approve: { nextStage: 4, status: "APPROVED", label: "Approved" },
      reject: { nextStage: 2, status: "REJECTED", label: "Rejected" },
    },
  },
  4: {
    ownerRole: "GM_FINANCE",
    commentRequired: true,
    decisions: {
      forward: { nextStage: 5, status: "PROCESSING PAYMENT", label: "Forwarded to Accountant for payment processing" },
    },
  },
  5: {
    ownerRole: "ACCOUNTANT",
    commentRequired: true,
    decisions: {
      forward: { nextStage: 6, status: "PROCESSING PAYMENT", label: "Forwarded to Cashier" },
    },
  },
  6: {
    ownerRole: "CASHIER",
    commentRequired: true,
    decisions: {
      complete: { nextStage: 7, status: "PAID", label: "Marked as paid" },
    },
  },
};

// Stage at/above which a payroll is visible to every role, regardless
// of whether they've acted on it: covers "approved by MD" through "paid".
export const VISIBILITY_OPEN_STAGE = 4;

// Statuses that mean "approved by MD or later". Used alongside the stage
// number so records whose `stage` column is NULL/garbled (legacy rows
// created before the stage column existed) are still visible to everyone
// once approved — previously those rows were silently filtered out of
// every page for anyone who wasn't ICT.
export const OPEN_STATUSES = new Set(["APPROVED", "PROCESSING PAYMENT", "PAID"]);

// Best-guess stage for rows where `stage` is NULL or not a number.
const STATUS_TO_STAGE: Record<string, number> = {
  "DRAFT": 0,
  "PENDING APPROVAL": 1,
  "REJECTED": 2,
  "APPROVED": 4,
  "PROCESSING PAYMENT": 5,
  "PAID": 7,
};

export function effectiveStage(p: { stage?: unknown; status?: unknown }): number {
  const raw = p?.stage;
  if (raw !== null && raw !== undefined && raw !== "" && Number.isFinite(Number(raw))) {
    return Number(raw);
  }
  const status = String(p?.status ?? "").trim().toUpperCase();
  return STATUS_TO_STAGE[status] ?? 0;
}

// The HRM role has been stored as "HR", "HRM" (and historically the
// frontend compared against "HR" while this file used "HRM"). Normalise
// before comparing so the HRM can actually act on stage 1.
// Accounts created before the rename can still carry "AUDITOR" (the
// frontend already labels it "HRM"), so treat it as HRM too — otherwise
// the HRM sees the payroll but can never comment/action stage 1.
const HRM_ALIASES = new Set(["HR", "HRM", "AUDITOR"]);
export function normalizeRole(role: unknown): string {
  const r = String(role ?? "").trim().toUpperCase();
  if (HRM_ALIASES.has(r)) return "HRM";
  return r;
}


// ------------------------------------------------------------
// Historical stage-1 reviewer.
// The HRM role (Solomon Ssentamu) only started with the August 2026
// payroll. Before that, stage 1 was handled by the CIA / Auditor,
// Edson Oyera. The CIA's old account was re-used for the HRM, so older
// comments point at the HRM's user row — relabel them on read.
// ------------------------------------------------------------
export const HRM_FIRST_PAYROLL_MONTH = "August 2026";
export const LEGACY_STAGE1_REVIEWER = { name: "Edson Oyera", role: "CIA" };
