import { Payroll } from "./payroll";
import { PayrollComment } from "./payroll_comment";
import { Admin } from "./nec_user";
import { PayrollStatusHistory } from "./payroll_history";

export const models = { Payroll, PayrollComment, Admin, PayrollStatusHistory };

// ASSOCIATIONS — run **after all models imported**
PayrollComment.belongsTo(Payroll, { foreignKey: "payrollId" });
PayrollComment.belongsTo(Admin, { foreignKey: "userId", as: "user" });
Payroll.hasMany(PayrollComment, { foreignKey: "payrollId", as: "comments" });