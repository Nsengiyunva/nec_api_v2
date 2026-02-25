import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Admin extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public otherNames!: string;
  public gender!: string;
  public dob!: string;
  public primaryContact!: string;
  public secondaryContact!: string;
  public physicalAddress!: string;
  public postalAddress!: string;
  public role!: string;
  public department!: string;
  public status!: string;
  public station!: string;
  public user_type!: string;
}
 
Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },

    otherNames: {
      type: DataTypes.STRING,
      allowNull: false
    },

    gender: {
      type: DataTypes.STRING,
      allowNull: false
    },

    dob: {
      type: DataTypes.STRING,
      allowNull: false
    },

    user_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    primaryContact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    secondaryContact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    physicalAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    postalAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    role: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    station: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
  },
  {
    sequelize,
    tableName: "nec_user"
  }
);
