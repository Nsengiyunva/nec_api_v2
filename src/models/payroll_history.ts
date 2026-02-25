import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class PayrollStatusHistory extends Model {}

PayrollStatusHistory.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    payrollId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    oldStatus: {
      type: DataTypes.STRING,
    },
    newStatus: {
      type: DataTypes.STRING,
    },
    changedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
    },
  },
  {
    sequelize,
    tableName: "payroll_status_history",
    timestamps: true,
  }
);