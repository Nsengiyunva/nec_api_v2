import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaPlanting extends Model {
  public id!: number;
}

NfaPlanting.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    parentID: DataTypes.STRING,
    seedling_source: DataTypes.STRING,
    other_seedling_source: DataTypes.STRING,
    start_year: DataTypes.STRING,
    end_year: DataTypes.STRING,
    objective: DataTypes.TEXT,
    planting_rate: DataTypes.STRING,
    funding_source: DataTypes.STRING,
    species_planted: DataTypes.TEXT,
    purpose: DataTypes.TEXT,

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "nfa_planting",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
