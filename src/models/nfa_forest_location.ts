import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaForestLocation extends Model {
  public id!: number;
}

NfaForestLocation.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    range: DataTypes.STRING,
    sector: DataTypes.STRING,
    beat: DataTypes.STRING,
    reserve: DataTypes.STRING,
    block_number: DataTypes.STRING,

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
    tableName: "nfa_forest_locations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);
