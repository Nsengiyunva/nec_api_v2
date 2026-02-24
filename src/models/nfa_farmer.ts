import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaFarmer extends Model {
  public id!: number;
}

NfaFarmer.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    clientID: DataTypes.STRING,
    farmer_type: DataTypes.STRING,
    title: DataTypes.STRING,
    dob: DataTypes.STRING,
    first_name: DataTypes.STRING,
    surname: DataTypes.STRING,
    other_name: DataTypes.STRING,
    primary_contact: DataTypes.STRING,
    secondary_contact: DataTypes.STRING,
    tin: DataTypes.STRING,
    physical_address: DataTypes.STRING,
    postal_address: DataTypes.STRING,
    gender: DataTypes.STRING,
    document_type: DataTypes.STRING,
    documentID: DataTypes.STRING,
    email_address: DataTypes.STRING,
    profile_picture: DataTypes.STRING,
    name: DataTypes.STRING,
    marital_status: DataTypes.STRING,

    nok_email_address: DataTypes.STRING,
    nok_firstname: DataTypes.STRING,
    nok_lastname: DataTypes.STRING,
    nok_other_name: DataTypes.STRING,
    nok_gender: DataTypes.STRING,
    nok_relationship: DataTypes.STRING,
    nok_telephone: DataTypes.STRING,
    nok_secondary: DataTypes.STRING,
    nok_document_type: DataTypes.STRING,
    nok_documentID: DataTypes.STRING,

    district: DataTypes.STRING,
    county: DataTypes.STRING,
    county_other: DataTypes.STRING,
    subcounty: DataTypes.STRING,
    subcounty_other: DataTypes.STRING,
    parish: DataTypes.STRING,
    parish_other: DataTypes.STRING,
    village: DataTypes.STRING,
    village_other: DataTypes.STRING,

    spouse_email_address: DataTypes.STRING,
    spouse_firstname: DataTypes.STRING,
    spouse_lastname: DataTypes.STRING,
    spouse_other_name: DataTypes.STRING,
    spouse_gender: DataTypes.STRING,
    spouse_telephone: DataTypes.STRING,

    created_by: DataTypes.STRING,
    created_role: DataTypes.STRING,

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
    tableName: "nfa_farmer",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);