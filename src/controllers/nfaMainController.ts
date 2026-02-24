// import { Request, Response } from "express";
// import { NfaMain } from "../models/nfa_main";
// import { NfaIndividual } from "../models/nfa_individual";
// import { NfaGroupMember } from "../models/nfa_group_member";
// import { NfaBlockDetail } from "../models/nfa_block_detail";
// import { NfaHectareDetail } from "../models/nfa_hectare_detail";
// import { NfaSpouseDetail } from "../models/nfa_spouse_detail";
// import { NfaNok } from "../models/nfa_nok";
// import { NfaPayment } from "../models/nfa_payment";
// import { NfaPlanting } from "../models/nfa_planting";


// export const createFarmer = async (req: Request, res: Response) => {
//   try {
//     const { farmers } = req.body;

//     for (const farmer of farmers) {
//       // main parent table
//       const forest = await NfaMain.create({
//         licenseID: farmer.licenseID,
//         issue_date: farmer.date_of_issue,
//         expiry_date: farmer.expiry_date,
//         referenceID: farmer.id,
//         farmer_category: farmer.farmerCategory,
//         farmer_type: farmer.farmerType,
//         clientID: farmer.clientID,
//         postal_address: farmer.postalAddress,
//         physical_address: farmer.physicalAddress,
//         name: farmer.name,
//         primary_contact: farmer.primaryContact,
//         secondary_contact: farmer.secondaryContact,
//         email_address: farmer.emailAddress,
//         residential_district: farmer.residentialDistrict,
//         district_other: farmer.district_other,
//         residential_county: farmer.residentialCounty,
//         county_other: farmer.county_other,
//         residential_subcounty: farmer.residentialSubcounty,
//         subcounty_other: farmer.subcounty_other,
//         residential_parish: farmer.residentialParish,
//         parish_other: farmer.parish_other,
//         residential_village: farmer.residentialVillage,
//         village_other: farmer.village_other,
//         tin: farmer.tin,
//         status: farmer.status,
//         period: farmer.period,
//         IDType: farmer.IDType,
//         documentID: farmer.documentID,
//         comments: farmer.comments,
//         created_by: farmer.created_by,
//         created_role: farmer.created_role,
//         stage: farmer.stage,
//         created_at: new Date(),
//         updated_at: new Date(),
//       });

//       // Individuals table
//       if (farmer.farmerType === "INDIVIDUAL") {
//         await NfaIndividual.create({
//           parentID: forest.id,
//           first_name: farmer.firstName,
//           surname: farmer.lastName,
//           middle_name: farmer.others,
//           gender: farmer.gender,
//           primary_contact: farmer.primaryContact,
//           secondary_contact: farmer.secondaryContact,
//           email_address: farmer.emailAddress,
//           physical_address: farmer.physicalAddress,
//           IDType: farmer.IDType,
//           documentID: farmer.documentIDPerson,
//           marital_status: farmer.maritalStatus,
//           birth_date: farmer.dob,
//           title: farmer.title,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }

//       // Spouse table
//       if (farmer.maritalStatus === "MARRIED") {
//         await NfaSpouseDetail.create({
//           parentID: forest.id,
//           first_name: farmer.spouseFirstName,
//           surname: farmer.spouseLastName,
//           middle_name: farmer.spouseOther,
//           gender: farmer.spouseGender,
//           primary_contact: farmer.spouseTelephone,
//           secondary_contact: farmer.spouseSecondary,
//           email_address: farmer.spouseEmail,
//           physical_address: farmer.spousePhysical,
//           IDType: farmer.spouseIDType,
//           documentID: farmer.spouseID,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }

//       // Next of Kin table
//       if (farmer.nok_lastname) {
//         await NfaNok.create({
//           parentID: forest.id,
//           first_name: farmer.nok_firstname,
//           surname: farmer.nok_lastname,
//           middle_name: farmer.nok_middlename,
//           gender: farmer.nok_gender,
//           primary_contact: farmer.nok_telephone,
//           secondary_contact: farmer.nok_secondary,
//           email_address: farmer.nok_email_address,
//           nok_other: farmer.nok_other,
//           relationship: farmer.nok_relationship,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }

//       // Block details
//       if (farmer.range) {
//         await NfaBlockDetail.create({
//           parentID: forest.id,
//           range: farmer.range,
//           range_other: farmer.range_other,
//           sector: farmer.sector,
//           sector_other: farmer.sector_other,
//           beat: farmer.beat,
//           beat_other: farmer.beat_other,
//           reserve: farmer.forestReserve,
//           reserve_other: farmer.reserve_other,
//           block_number: farmer.blockNumber,
//           district: farmer.district,
//           block_other_district: farmer.block_other_district,
//           county: farmer.county,
//           block_other_county: farmer.block_other_county,
//           subcounty: farmer.subcounty,
//           block_other_subcounty: farmer.block_other_subcounty,
//           parish: farmer.parish,
//           block_other_parish: farmer.block_other_parish,
//           village: farmer.village,
//           block_other_village: farmer.block_other_village,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }

//       // Hectares information
//       if (farmer.period) {
//         await NfaHectareDetail.create({
//           parentID: forest.id,
//           period: farmer.period,
//           total_area_planted: farmer.total_area_planted,
//           hectares_allocated: farmer.hectares_assigned,
//           rateperha: farmer.rate_per_hectare,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }

//       // Planting details
//       if (farmer.seedling_source) {
//         await NfaPlanting.create({
//           parentID: forest.id,
//           seedling_source: farmer.seedling_source,
//           other_seedling_source: farmer.other_seedling_source,
//           start_year: farmer.startYear,
//           end_year: farmer.endYear,
//           objective: farmer.objective,
//           planting_rate: farmer.plantingrate,
//           funding_source: farmer.fundingsource,
//           species_planted: farmer.speciesPlanted,
//           purpose: farmer.purpose,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }

//       // Payment details
//       if (farmer.baseline) {
//         await NfaPayment.create({
//           parentID: forest.id,
//           baseline: farmer.baseline,
//           opening_balance: farmer.opening_balance,
//           amount_paid: farmer.amount_paid,
//           amount_available: farmer.amount_available,
//           amount_planned: farmer.amount_planned,
//           amount_due: farmer.amount_due,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }
//     }

//     return res.json({ success: true, message: "Farmer saved successfully" });
//   } catch (error) {
//     console.error("Error creating farmers:", error);
//     return res.status(500).json({ success: false, error });
//   }
// };


// export const getFarmer = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const main = await NfaMain.findByPk(id, {
//       include: [
//         { model: NfaIndividual, as: "individuals", required: false },
//         { model: NfaGroupMember, as: "groupMembers", required: false },
//         { model: NfaBlockDetail, as: "blockDetails", required: false },
//         { model: NfaHectareDetail, as: "hectareDetails", required: false },
//         { model: NfaSpouseDetail, as: "spouseDetail", required: false },
//         { model: NfaNok, as: "noks", required: false },

//         // Only works AFTER you add these associations
//         { model: NfaPayment, as: "paymentDetail", required: false },
//         { model: NfaPlanting, as: "plantingDetail", required: false },
//       ],
//     });

//     if (!main) {
//       return res.status(404).json({ success: false, message: "Farmer not found" });
//     }

//     return res.json({ success: true, record: main });
//   } catch (error) {
//     console.error("Error fetching farmer:", error);
//     return res.status(500).json({ success: false, error });
//   }
// };

// export const updateFarmer = async (req: Request, res: Response) => {
//   const { id } = req.params; // farmer ID
//   const { farmer } = req.body; // updated data

//   try {
//     const main = await NfaMain.findByPk(id);
//     if (!main) {
//       return res.status(404).json({ success: false, message: "Farmer not found" });
//     }

//     // Update main farmer table
//     await main.update({
//       licenseID: farmer.licenseID,
//       issue_date: farmer.date_of_issue,
//       expiry_date: farmer.expiry_date,
//       referenceID: farmer.id,
//       farmer_category: farmer.farmerCategory,
//       farmer_type: farmer.farmerType,
//       clientID: farmer.clientID,
//       postal_address: farmer.postalAddress,
//       physical_address: farmer.physicalAddress,
//       name: farmer.name,
//       primary_contact: farmer.primaryContact,
//       secondary_contact: farmer.secondaryContact,
//       email_address: farmer.emailAddress,
//       residential_district: farmer.residentialDistrict,
//       district_other: farmer.district_other,
//       residential_county: farmer.residentialCounty,
//       county_other: farmer.county_other,
//       residential_subcounty: farmer.residentialSubcounty,
//       subcounty_other: farmer.subcounty_other,
//       residential_parish: farmer.residentialParish,
//       parish_other: farmer.parish_other,
//       residential_village: farmer.residentialVillage,
//       village_other: farmer.village_other,
//       tin: farmer.tin,
//       status: farmer.status,
//       period: farmer.period,
//       IDType: farmer.IDType,
//       documentID: farmer.documentID,
//       comments: farmer.comments,
//       created_by: farmer.created_by,
//       created_role: farmer.created_role,
//       stage: farmer.stage,
//       updated_at: new Date(),
//     });

//     // Update individual if exists
//     if (farmer.farmerType === "INDIVIDUAL") {
//       const individual = await NfaIndividual.findOne({ where: { parentID: id } });
//       if (individual) {
//         await individual.update({
//           first_name: farmer.firstName,
//           surname: farmer.lastName,
//           middle_name: farmer.others,
//           gender: farmer.gender,
//           primary_contact: farmer.primaryContact,
//           secondary_contact: farmer.secondaryContact,
//           email_address: farmer.emailAddress,
//           physical_address: farmer.physicalAddress,
//           IDType: farmer.IDType,
//           documentID: farmer.documentIDPerson,
//           marital_status: farmer.maritalStatus,
//           birth_date: farmer.dob,
//           title: farmer.title,
//           updated_at: new Date(),
//         });
//       }
//     }

//     // Update spouse if married
//     if (farmer.maritalStatus?.toUpperCase() === "MARRIED") {
//       const spouse = await NfaSpouseDetail.findOne({ where: { parentID: id } });
//       if (spouse) {
//         await spouse.update({
//           first_name: farmer.spouseFirstName,
//           surname: farmer.spouseLastName,
//           middle_name: farmer.spouseOther,
//           gender: farmer.spouseGender,
//           primary_contact: farmer.spouseTelephone,
//           secondary_contact: farmer.spouseSecondary,
//           email_address: farmer.spouseEmail,
//           physical_address: farmer.spousePhysical,
//           IDType: farmer.spouseIDType,
//           documentID: farmer.spouseID,
//           updated_at: new Date(),
//         });
//       }
//       else {
//         // Create new spouse record
//         await NfaSpouseDetail.create({
//           parentID: id,
//           first_name: farmer.spouseFirstName,
//           surname: farmer.spouseLastName,
//           middle_name: farmer.spouseOther,
//           gender: farmer.spouseGender,
//           primary_contact: farmer.spouseTelephone,
//           secondary_contact: farmer.spouseSecondary,
//           email_address: farmer.spouseEmail,
//           physical_address: farmer.spousePhysical,
//           IDType: farmer.spouseIDType,
//           documentID: farmer.spouseID,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }
//     }

//     // Update NOK
//     if (farmer.nok_lastname) {
//       const nok = await NfaNok.findOne({ where: { parentID: id } });
//       if (nok) {
//         await nok.update({
//           first_name: farmer.nok_firstname,
//           surname: farmer.nok_lastname,
//           middle_name: farmer.nok_middlename,
//           gender: farmer.nok_gender,
//           primary_contact: farmer.nok_telephone,
//           secondary_contact: farmer.nok_secondary,
//           email_address: farmer.nok_email_address,
//           nok_other: farmer.nok_other,
//           relationship: farmer.nok_relationship,
//           updated_at: new Date(),
//         });
//       }
//       else {
//         await NfaNok.create({
//           parentID: id,
//           first_name: farmer.nok_firstname,
//           surname: farmer.nok_lastname,
//           middle_name: farmer.nok_middlename,
//           gender: farmer.nok_gender,
//           primary_contact: farmer.nok_telephone,
//           secondary_contact: farmer.nok_secondary,
//           email_address: farmer.nok_email_address,
//           nok_other: farmer.nok_other,
//           relationship: farmer.nok_relationship,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }
//     }

//     // Update block
//     if (farmer.range) {
//       const block = await NfaBlockDetail.findOne({ where: { parentID: id } });
//       if (block) {
//         await block.update({
//           range: farmer.range,
//           range_other: farmer.range_other,
//           sector: farmer.sector,
//           sector_other: farmer.sector_other,
//           beat: farmer.beat,
//           beat_other: farmer.beat_other,
//           reserve: farmer.forestReserve,
//           reserve_other: farmer.reserve_other,
//           block_number: farmer.blockNumber,
//           district: farmer.district,
//           block_other_district: farmer.block_other_district,
//           county: farmer.county,
//           block_other_county: farmer.block_other_county,
//           subcounty: farmer.subcounty,
//           block_other_subcounty: farmer.block_other_subcounty,
//           parish: farmer.parish,
//           block_other_parish: farmer.block_other_parish,
//           village: farmer.village,
//           block_other_village: farmer.block_other_village,
//           updated_at: new Date(),
//         });
//       }
//     }

//     // Update hectares
//     if (farmer.period) {
//       const ha = await NfaHectareDetail.findOne({ where: { parentID: id } });
//       if (ha) {
//         await ha.update({
//           period: farmer.period,
//           total_area_planted: farmer.total_area_planted,
//           hectares_allocated: farmer.hectares_assigned,
//           rateperha: farmer.rate_per_hectare,
//           updated_at: new Date(),
//         });
//       }
//       else {
//         // Create new hectare record
//         await NfaHectareDetail.create({
//           parentID: id,
//           period: farmer.period,
//           total_area_planted: farmer.total_area_planted,
//           hectares_allocated: farmer.hectares_assigned,
//           rateperha: farmer.rate_per_hectare,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }
//     }

//     // Update planting
//     if (farmer.seedling_source) {
//       const plant = await NfaPlanting.findOne({ where: { parentID: id } });
//       if (plant) {
//         await plant.update({
//           seedling_source: farmer.seedling_source,
//           other_seedling_source: farmer.other_seedling_source,
//           start_year: farmer.startYear,
//           end_year: farmer.endYear,
//           objective: farmer.objective,
//           planting_rate: farmer.plantingrate,
//           funding_source: farmer.fundingsource,
//           species_planted: farmer.speciesPlanted,
//           purpose: farmer.purpose,
//           updated_at: new Date(),
//         });
//       }
//       else {
//         // Create a new record
//         await NfaPlanting.create({
//           parentID: id,
//           seedling_source: farmer.seedling_source,
//           other_seedling_source: farmer.other_seedling_source,
//           start_year: farmer.startYear,
//           end_year: farmer.endYear,
//           objective: farmer.objective,
//           planting_rate: farmer.plantingrate,
//           funding_source: farmer.fundingsource,
//           species_planted: farmer.speciesPlanted,
//           purpose: farmer.purpose,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }
//     }

//     // Update payment
//     if (farmer.baseline) {
//       const payment = await NfaPayment.findOne({ where: { parentID: id } });
//       if (payment) {
//         await payment.update({
//           baseline: farmer.baseline,
//           opening_balance: farmer.opening_balance,
//           amount_paid: farmer.amount_paid,
//           amount_available: farmer.amount_available,
//           amount_planned: farmer.amount_planned,
//           amount_due: farmer.amount_due,
//           updated_at: new Date(),
//         });
//       }
//       else {
//         // Insert new record
//         await NfaPayment.create({
//           parentID: id,
//           baseline: farmer.baseline,
//           opening_balance: farmer.opening_balance,
//           amount_paid: farmer.amount_paid,
//           amount_available: farmer.amount_available,
//           amount_planned: farmer.amount_planned,
//           amount_due: farmer.amount_due,
//           created_at: new Date(),
//           updated_at: new Date(),
//         });
//       }
//     }

//     return res.json({ success: true, message: "Farmer updated successfully" });
//   } catch (error) {
//     return res.status(500).json({ success: false, error });
//   }
// };

// export const deactivateFarmer = async (req: Request, res: Response) => {
//   const { id } = req.body;

//   // try {
//   //   // const main = await NfaMain.findByPk(id);
//   //   const main = await NfaMain.findOne({ where: { id: id }});

//   //   // if (!main) {
//   //   //   return res.status(404).json({ success: false, message: "Farmer not found" });
//   //   // }

//   //   // // Update main farmer table
//   //   // await main.update({
//   //   //   status: "DELETED",
//   //   //   updated_at: new Date(),
//   //   // });
//   //   return res.json({ 
//   //     success: true, 
//   //     message: "Farmer removed from the system successfully",
//   //     result: main 
//   //   });
//   // } catch (error) {
//   //   return res.status(500).json({ success: false, error });
//   // }
// }


// // --------------------
// // Delete farmer by ID
// // --------------------
// export const deleteFarmer = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     // Delete related tables first
//     await NfaIndividual.destroy({ where: { parentID: id } });
//     await NfaGroupMember.destroy({ where: { parentID: id } });
//     await NfaBlockDetail.destroy({ where: { parentID: id } });
//     await NfaHectareDetail.destroy({ where: { parentID: id } });
//     await NfaSpouseDetail.destroy({ where: { parentID: id } });
//     await NfaNok.destroy({ where: { parentID: id } });

//     // Delete main farmer
//     await NfaMain.destroy({ where: { id } });

//     res.json({ message: "Farmer deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// };
