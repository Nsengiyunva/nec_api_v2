import { Payroll } from "./payroll";
import { PayrollComment } from "./payroll_comment";
import { Admin } from "./nec_user";
import { PayrollStatusHistory } from "./payroll_history";
import { Staff } from "./staff";
import { StaffChild } from "./staff_child";
import { StaffSpouse } from "./staff_spouse";

export const models = { Payroll, PayrollComment, Admin, PayrollStatusHistory, Staff, StaffChild, StaffSpouse };

// ASSOCIATIONS — run **after all models imported**
PayrollComment.belongsTo(Payroll, { foreignKey: "payrollId" });
PayrollComment.belongsTo(Admin, { foreignKey: "userId", as: "user" });
Payroll.hasMany(PayrollComment, { foreignKey: "payrollId", as: "comments" });

// Staff associations — children/spouses reference the staff's business
// `staff_id` code (not the numeric `id` primary key), matching the legacy schema.
Staff.hasMany(StaffChild, { foreignKey: "staff_id", sourceKey: "staff_id", as: "children" });
StaffChild.belongsTo(Staff, { foreignKey: "staff_id", targetKey: "staff_id", as: "staff" });

Staff.hasMany(StaffSpouse, { foreignKey: "staff_id", sourceKey: "staff_id", as: "spouses" });
StaffSpouse.belongsTo(Staff, { foreignKey: "staff_id", targetKey: "staff_id", as: "staff" });