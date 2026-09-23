import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class PayrollComment extends Model {
  public id!: number;
  public payrollId!: number;
  public userId!: number;
  public comment!: string;
  public stage!: number | null;
  public actorName!: string | null;
  public actorRole!: string | null;
}

PayrollComment.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    payrollId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
    // The workflow stage the payroll was AT when this comment/action was made.
    // Lets us tell "already acted at this exact stage" apart from having
    // commented earlier in the payroll's overall journey.
    stage: { type: DataTypes.INTEGER, allowNull: true },
    // Snapshot of WHO acted and in WHAT capacity at the time of the
    // action. The trail must not change when a user account is later
    // renamed or re-roled (e.g. the old CIA account becoming the HRM
    // account) — so the UI reads these first and only falls back to
    // the live nec_user row for comments that pre-date the snapshot.
    actorName: { type: DataTypes.STRING, allowNull: true },
    actorRole: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: "payroll_comments", timestamps: true }
);