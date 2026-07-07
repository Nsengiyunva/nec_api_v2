// ============================================================
// Payroll approval workflow — single source of truth for the
// stage/role/decision state machine.
//
// Stage numbers:
//   0 = with ACCOUNTANT (initial submission, or returned for revision)
//   1 = with AUDITOR ("CIA")           — pre-approval review
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
  // Fallback trail message used when the actor leaves no remark
  // (only possible where commentRequired is false, e.g. MD approve/reject).
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
    ownerRole: "AUDITOR",
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
      defer: { nextStage: 1, status: "PENDING APPROVAL", label: "Deferred back to CIA" },
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
