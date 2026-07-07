import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface StaffChildAttributes {
  id: number;
  staff_id?: string;
  child_name?: string;
  spouse_name?: string;
  spouse_phone?: string;
  type?: string;
}

type StaffChildCreationAttributes = Optional<StaffChildAttributes, "id">;

export class StaffChild extends Model<StaffChildAttributes, StaffChildCreationAttributes> implements StaffChildAttributes {
  public id!: number;
  public staff_id?: string;
  public child_name?: string;
  public spouse_name?: string;
  public spouse_phone?: string;
  public type?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

StaffChild.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    staff_id: { type: DataTypes.STRING(100), allowNull: true },
    child_name: { type: DataTypes.STRING(100), allowNull: true },
    spouse_name: { type: DataTypes.STRING(255), allowNull: true },
    spouse_phone: { type: DataTypes.STRING(150), allowNull: true },
    type: { type: DataTypes.STRING(25), allowNull: true },
  },
  {
    sequelize,
    tableName: "staff_children",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
