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
// `constraints: false` because `users.staff_id` has no unique/index in the
// existing DB, so MySQL cannot attach a real FK constraint to it — Sequelize
// still uses staff_id correctly for joins/includes, it just won't try to add
// a DB-level foreign key (which would otherwise abort table creation).
Staff.hasMany(StaffChild, { foreignKey: "staff_id", sourceKey: "staff_id", as: "children", constraints: false });
StaffChild.belongsTo(Staff, { foreignKey: "staff_id", targetKey: "staff_id", as: "staff", constraints: false });

Staff.hasMany(StaffSpouse, { foreignKey: "staff_id", sourceKey: "staff_id", as: "spouses", constraints: false });
StaffSpouse.belongsTo(Staff, { foreignKey: "staff_id", targetKey: "staff_id", as: "staff", constraints: false });