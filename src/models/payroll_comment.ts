import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class PayrollComment extends Model {
  public id!: number;
  public payrollId!: number;
  public userId!: number;
  public comment!: string;
}

PayrollComment.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    payrollId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, tableName: "payroll_comments", timestamps: true }
);