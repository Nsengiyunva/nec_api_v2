import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaApplication extends Model {
  public id!: number;
}

NfaApplication.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    licenseID: DataTypes.STRING,
    referenceID: DataTypes.STRING,
    clientID: DataTypes.STRING,
    datePrepared: DataTypes.STRING,
    date: DataTypes.STRING,
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    IDType: DataTypes.STRING,
    amountAvailable: DataTypes.STRING,
    amountDue: DataTypes.STRING,
    amountPaid: DataTypes.STRING,
    amountPlanned: DataTypes.STRING,
    period: DataTypes.STRING,
    openingBalance: DataTypes.STRING,
    plantedSpecies: DataTypes.STRING,
    plantingRate: DataTypes.STRING,
    primaryContact: DataTypes.STRING,
    secondaryContact: DataTypes.STRING,
    purpose: DataTypes.STRING,
    ratePerHectare: DataTypes.STRING,
    residentDistrict: DataTypes.STRING,
    residentParish: DataTypes.STRING,
    residentSubCounty: DataTypes.STRING,
    residentVillage: DataTypes.STRING,
    managementArea: DataTypes.STRING,
    sector: DataTypes.STRING,
    beat: DataTypes.STRING,
    forestReserve: DataTypes.STRING,
    blockNumber: DataTypes.STRING,
    seedlingSource: DataTypes.STRING,
    spouseName: DataTypes.STRING,
    stagedBy: DataTypes.STRING,
    stagedOn: DataTypes.STRING,
    startYear: DataTypes.STRING,
    completionYear: DataTypes.STRING,
    tin: DataTypes.STRING,
    totalAreaPlanted: DataTypes.STRING,
    address: DataTypes.STRING,
    title: DataTypes.STRING,
    companyName: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    middleName: DataTypes.STRING,
    birthDate: DataTypes.STRING,
    gender: DataTypes.STRING,
    maritalStatus: DataTypes.STRING,
    documentID: DataTypes.STRING,
    emailAddress: DataTypes.STRING,
    nokIDType: DataTypes.STRING,
    nokFirstName: DataTypes.STRING,
    nokLastName: DataTypes.STRING,
    nokAddress: DataTypes.STRING,
    nokRelationship: DataTypes.STRING,
    nokTelephone: DataTypes.STRING,
    nokDocumentID: DataTypes.STRING,
    nokGender: DataTypes.STRING,
    objective: DataTypes.STRING,
    status: DataTypes.STRING,

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "nfa_applications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);
