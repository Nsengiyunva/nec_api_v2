import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaHectareDetail extends Model {
  public id!: number;
}

NfaHectareDetail.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    parentID: {
      type: DataTypes.BIGINT,
      allowNull: false
    },

    period: DataTypes.STRING,
    total_area_planted: DataTypes.STRING,
    hectares_allocated: DataTypes.STRING,
    rateperha: DataTypes.STRING,

    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "nfa_hectare_details",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);
