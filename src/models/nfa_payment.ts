import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NfaPayment extends Model {
  public id!: number;
}

NfaPayment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    amount_due: DataTypes.STRING,
    amount_paid: DataTypes.STRING,
    created_by: DataTypes.STRING,
    farmerID: DataTypes.STRING,
    hectares_allocated: DataTypes.STRING,
    licenseID: DataTypes.STRING,
    instalment: DataTypes.STRING,
    name: DataTypes.STRING,
    payment_year: DataTypes.STRING,
    period: DataTypes.STRING,
    rateperha: DataTypes.STRING,
    range: DataTypes.STRING,
    reserve: DataTypes.STRING,
    sector: DataTypes.STRING,
    parentID: DataTypes.BIGINT,
    baseline: DataTypes.BIGINT,
    opening_balance: DataTypes.BIGINT,
    amount_available: DataTypes.BIGINT,
    amount_planned: DataTypes.BIGINT,
    reference_id: DataTypes.BIGINT,

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "nfa_payment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
