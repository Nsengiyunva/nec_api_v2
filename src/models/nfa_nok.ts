import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaNok extends Model {
  public id!: number;
}

NfaNok.init(
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

    first_name: DataTypes.STRING,
    middle_name: DataTypes.STRING,
    surname: DataTypes.STRING,
    gender: DataTypes.STRING,
    primary_contact: DataTypes.STRING,
    secondary_contact: DataTypes.STRING,
    email_address: DataTypes.STRING,
    physical_address: DataTypes.STRING,
    IDType: DataTypes.STRING,
    documentID: DataTypes.STRING,
    relationship: DataTypes.STRING,
    nok_other: DataTypes.STRING,

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
    tableName: "nfa_nok",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);
