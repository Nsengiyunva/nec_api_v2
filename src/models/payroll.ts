import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Payroll extends Model {
  public id!: number;
  public month!: string;
  public fileName!: string;
  public filePath!: string;
  public fileSize!: string;
  public uploadedBy!: string;
  public status!: string;
  public deletedAt!: Date | null;
}

Payroll.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    month: { type: DataTypes.STRING, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    fileSize: { type: DataTypes.STRING },
    stage: { type: DataTypes.INTEGER},
    uploadedBy: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING},
    // Soft-delete marker: NULL = active/visible, non-null = deleted
    // (hidden from normal reads, row itself is never removed).
    deletedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  { sequelize, tableName: "payroll" }
);