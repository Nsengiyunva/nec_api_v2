import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { Payroll } from "./payroll";
import { Admin } from "./nec_user";

export class PayrollComment extends Model {
  public id!: number;
  public payrollId!: number;
  public userId!: number;
  public comment!: string;
}

PayrollComment.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    payrollId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "payroll",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "nec_users", // your admin table name
        key: "id",
      },
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "payroll_comments",
    timestamps: true, // IMPORTANT
    indexes: [
      { fields: ["payrollId"] },
      { fields: ["userId"] },
    ],
  }
);

PayrollComment.belongsTo(Payroll, { foreignKey: "payrollId", }); 

PayrollComment.belongsTo(Admin, { foreignKey: "userId", as: "user", });

Payroll.hasMany(PayrollComment, {
    foreignKey: "payrollId",
    as: "comments",
});