import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Farmer extends Model {
  public id!: number;
  public name!: string;
  public district!: string;
  public phone!: string;
  public age?: number;
  public farm_size?: string;
}

Farmer.init(
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

    district: {
      type: DataTypes.STRING,
      allowNull: false
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    farm_size: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "farmers"
  }
);
