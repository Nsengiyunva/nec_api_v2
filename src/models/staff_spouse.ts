import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface StaffSpouseAttributes {
  id: number;
  staff_id?: string;
  spouse_name?: string;
  spouse_phone?: string;
  type?: string;
}

type StaffSpouseCreationAttributes = Optional<StaffSpouseAttributes, "id">;

export class StaffSpouse extends Model<StaffSpouseAttributes, StaffSpouseCreationAttributes> implements StaffSpouseAttributes {
  public id!: number;
  public staff_id?: string;
  public spouse_name?: string;
  public spouse_phone?: string;
  public type?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

StaffSpouse.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    staff_id: { type: DataTypes.STRING(100), allowNull: true },
    spouse_name: { type: DataTypes.STRING(255), allowNull: true },
    spouse_phone: { type: DataTypes.STRING(255), allowNull: true },
    type: { type: DataTypes.STRING(50), allowNull: true },
  },
  {
    sequelize,
    tableName: "staff_spouses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
