import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface StaffAttributes {
  id: number;
  email_address: string;
  role?: string;
  passcode: string;
  password: string;
  status?: string;
  department?: string;
  department_no?: string;
  position?: string;
  nssf_no?: string;
  next_of_kin?: string;
  nok_phone?: string;
  access_staff?: string;
  approved_voucher?: string;
  staff_id?: string;
  organisation?: string;
  title?: string;
  designation?: string;
  field_role?: string;
  process_captain?: string;
  first_name?: string;
  last_name?: string;
  other_names?: string;
  staffID?: string;
  process_department?: string;
  account_no?: string;
  bank_name?: string;
  dob?: string;
  employment_terms?: string;
  national_id?: string;
  nationality?: string;
  salary_scale?: string;
  primary_contact?: string;
  secondary_contact?: string;
  spouse_1_name?: string;
  spouse_2_name?: string;
  spouse_1_phone?: string;
  spouse_2_phone?: string;
  terms_of_employment?: string;
  start_date?: string;
  end_date?: string;
  gender?: string;
  type?: string;
}

type StaffCreationAttributes = Optional<StaffAttributes, "id">;

export class Staff extends Model<StaffAttributes, StaffCreationAttributes> implements StaffAttributes {
  public id!: number;
  public email_address!: string;
  public role?: string;
  public passcode!: string;
  public password!: string;
  public status?: string;
  public department?: string;
  public department_no?: string;
  public position?: string;
  public nssf_no?: string;
  public next_of_kin?: string;
  public nok_phone?: string;
  public access_staff?: string;
  public approved_voucher?: string;
  public staff_id?: string;
  public organisation?: string;
  public title?: string;
  public designation?: string;
  public field_role?: string;
  public process_captain?: string;
  public first_name?: string;
  public last_name?: string;
  public other_names?: string;
  public staffID?: string;
  public process_department?: string;
  public account_no?: string;
  public bank_name?: string;
  public dob?: string;
  public employment_terms?: string;
  public national_id?: string;
  public nationality?: string;
  public salary_scale?: string;
  public primary_contact?: string;
  public secondary_contact?: string;
  public spouse_1_name?: string;
  public spouse_2_name?: string;
  public spouse_1_phone?: string;
  public spouse_2_phone?: string;
  public terms_of_employment?: string;
  public start_date?: string;
  public end_date?: string;
  public gender?: string;
  public type?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Staff.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    email_address: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(255), allowNull: true },
    passcode: { type: DataTypes.STRING(255), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.STRING(255), allowNull: true },
    department: { type: DataTypes.STRING(50), allowNull: true },
    department_no: { type: DataTypes.STRING(15), allowNull: true },
    position: { type: DataTypes.STRING(15), allowNull: true },
    nssf_no: { type: DataTypes.STRING(255), allowNull: true },
    next_of_kin: { type: DataTypes.STRING(255), allowNull: true },
    nok_phone: { type: DataTypes.STRING(50), allowNull: true },
    access_staff: { type: DataTypes.STRING(25), allowNull: true },
    approved_voucher: { type: DataTypes.STRING(15), allowNull: true },
    staff_id: { type: DataTypes.STRING(50), allowNull: true },
    organisation: { type: DataTypes.STRING(255), allowNull: true },
    title: { type: DataTypes.STRING(255), allowNull: true },
    designation: { type: DataTypes.STRING(255), allowNull: true },
    field_role: { type: DataTypes.STRING(255), allowNull: true },
    process_captain: { type: DataTypes.STRING(50), allowNull: true },
    first_name: { type: DataTypes.STRING(255), allowNull: true },
    last_name: { type: DataTypes.STRING(255), allowNull: true },
    other_names: { type: DataTypes.STRING(255), allowNull: true },
    staffID: { type: DataTypes.STRING(255), allowNull: true },
    process_department: { type: DataTypes.STRING(255), allowNull: true },
    account_no: { type: DataTypes.STRING(255), allowNull: true },
    bank_name: { type: DataTypes.STRING(255), allowNull: true },
    dob: { type: DataTypes.STRING(255), allowNull: true },
    employment_terms: { type: DataTypes.STRING(255), allowNull: true },
    national_id: { type: DataTypes.STRING(255), allowNull: true },
    nationality: { type: DataTypes.STRING(255), allowNull: true },
    salary_scale: { type: DataTypes.STRING(255), allowNull: true },
    primary_contact: { type: DataTypes.STRING(255), allowNull: true },
    secondary_contact: { type: DataTypes.STRING(255), allowNull: true },
    spouse_1_name: { type: DataTypes.STRING(255), allowNull: true },
    spouse_2_name: { type: DataTypes.STRING(255), allowNull: true },
    spouse_1_phone: { type: DataTypes.STRING(255), allowNull: true },
    spouse_2_phone: { type: DataTypes.STRING(255), allowNull: true },
    terms_of_employment: { type: DataTypes.STRING(255), allowNull: true },
    start_date: { type: DataTypes.STRING(255), allowNull: true },
    end_date: { type: DataTypes.STRING(255), allowNull: true },
    gender: { type: DataTypes.STRING(50), allowNull: true },
    type: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
