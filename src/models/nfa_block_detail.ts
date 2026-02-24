import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaBlockDetail extends Model {
  public id!: number;
}

NfaBlockDetail.init(
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

    range: DataTypes.STRING,
    sector: DataTypes.STRING,
    beat: DataTypes.STRING,
    reserve: DataTypes.STRING,
    block_number: DataTypes.STRING,
    district: DataTypes.STRING,
    county: DataTypes.STRING,
    subcounty: DataTypes.STRING,
    parish: DataTypes.STRING,
    village: DataTypes.STRING,

    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    range_other: DataTypes.STRING,
    sector_other: DataTypes.STRING,
    beat_other: DataTypes.STRING,
    reserve_other: DataTypes.STRING,

    block_other_district: DataTypes.STRING,
    block_other_county: DataTypes.STRING,
    block_other_subcounty: DataTypes.STRING,
    block_other_parish: DataTypes.STRING,
    block_other_village: DataTypes.STRING
  },
  {
    sequelize,
    tableName: "nfa_block_details",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);
