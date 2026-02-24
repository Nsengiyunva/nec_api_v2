import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaUser extends Model {
  public id!: number;
}

NfaUser.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },

    email_address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    role: DataTypes.STRING,
    passcode: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.STRING,

    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    organisation: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    gender: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    user_role: DataTypes.STRING,
    plantation: DataTypes.STRING,
    belongsTo: DataTypes.STRING
  },
  {
    sequelize,
    tableName: "nfa_users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);
