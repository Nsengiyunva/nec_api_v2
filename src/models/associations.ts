import { NfaMain, NfaIndividual, NfaGroupMember, NfaBlockDetail, NfaHectareDetail, NfaSpouseDetail, NfaNok, NfaPayment, NfaPlanting } from "./";

// NfaMain relationships
NfaMain.hasMany(NfaIndividual, { foreignKey: "parentID", as: "individuals" });
NfaIndividual.belongsTo(NfaMain, { foreignKey: "parentID", as: "main" });

NfaMain.hasMany(NfaGroupMember, { foreignKey: "parentID", as: "groupMembers" });
NfaGroupMember.belongsTo(NfaMain, { foreignKey: "parentID", as: "main" });

NfaMain.hasMany(NfaBlockDetail, { foreignKey: "parentID", as: "blockDetails" });
NfaBlockDetail.belongsTo(NfaMain, { foreignKey: "parentID", as: "main" });

NfaMain.hasMany(NfaHectareDetail, { foreignKey: "parentID", as: "hectareDetails" });
NfaHectareDetail.belongsTo(NfaMain, { foreignKey: "parentID", as: "main" });

NfaMain.hasOne(NfaSpouseDetail, { foreignKey: "parentID", as: "spouseDetail" });
NfaSpouseDetail.belongsTo(NfaMain, { foreignKey: "parentID", as: "main" });

NfaMain.hasMany(NfaNok, { foreignKey: "parentID", as: "noks" });
NfaNok.belongsTo(NfaMain, { foreignKey: "parentID", as: "main" });

NfaMain.hasOne(NfaPayment, { foreignKey: "parentID", as: "paymentDetail" });
NfaPayment.belongsTo(NfaMain, { foreignKey: "parentID", as: "main" });

NfaMain.hasOne(NfaPlanting, { foreignKey: "parentID", as: "plantingDetail" });
NfaPlanting.belongsTo(NfaMain, { foreignKey: "parentID", as: "main" });

