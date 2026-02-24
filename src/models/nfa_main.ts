import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaMain extends Model {
  public id!: number;
  public farmer_type!: string; 
}

NfaMain.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    referenceID: {
      type: DataTypes.BIGINT,
      allowNull: false
    },

    farmer_type: DataTypes.STRING,
    farmer_category: DataTypes.STRING,
    clientID: DataTypes.STRING,
    name: DataTypes.STRING,
    primary_contact: DataTypes.STRING,
    secondary_contact: DataTypes.STRING,
    email_address: DataTypes.STRING,
    tin: DataTypes.STRING,
    ursb_number: DataTypes.STRING,
    documentID: DataTypes.STRING,
    licenseID: DataTypes.STRING,
    progress: DataTypes.STRING,
    status: DataTypes.STRING,
    stage: DataTypes.STRING,

    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    form: DataTypes.STRING,
    postal_address: DataTypes.STRING,
    show_offered: DataTypes.STRING,
    from_date: DataTypes.STRING,
    residential_district: DataTypes.STRING,
    residential_county: DataTypes.STRING,
    residential_subcounty: DataTypes.STRING,
    residential_parish: DataTypes.STRING,
    residential_village: DataTypes.STRING,
    IDType: DataTypes.STRING,
    form_date: DataTypes.STRING,
    end_date: DataTypes.STRING,
    period: DataTypes.STRING,
    brn: DataTypes.STRING,
    issue_date: DataTypes.STRING,
    expiry_date: DataTypes.STRING,
    physical_address: DataTypes.STRING,
    comments: DataTypes.TEXT,
    district_other: DataTypes.STRING,
    county_other: DataTypes.STRING,
    subcounty_other: DataTypes.STRING,
    parish_other: DataTypes.STRING,
    village_other: DataTypes.STRING,
    created_by: DataTypes.STRING,
    created_role: DataTypes.STRING,
    user_type: DataTypes.STRING,
    next_actor: DataTypes.STRING,
    destination: DataTypes.TEXT,
    next_email: DataTypes.STRING,
    next_name: DataTypes.STRING,
    next_remarks: DataTypes.STRING,
    director_comments: DataTypes.TEXT,
    executive_comments: DataTypes.TEXT,
    director: DataTypes.STRING,
    executive: DataTypes.STRING,
    start_date: DataTypes.STRING,
    director_role: DataTypes.STRING,
    executive_role: DataTypes.STRING
  },
  {
    sequelize,
    tableName: "nfa_main",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);
