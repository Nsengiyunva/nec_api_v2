import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class PayrollComment extends Model {
  public id!: number;
  public payrollId!: number;
  public userId!: number;
  public comment!: string;
  public stage!: number | null;
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
  },
  { sequelize, tableName: "payroll_comments", timestamps: true }
);