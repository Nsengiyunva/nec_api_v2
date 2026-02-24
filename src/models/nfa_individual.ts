import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaIndividual extends Model {
  public id!: number;
}

NfaIndividual.init(
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
    marital_status: DataTypes.STRING,
    birth_date: DataTypes.STRING,
    title: DataTypes.STRING,

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
    tableName: "nfa_individual",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);
