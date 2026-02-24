import { Request, Response } from "express";
import { Farmer, NfaBlockDetail, NfaMain, NfaGroupMember, NfaHectareDetail, NfaIndividual, NfaNok, NfaSpouseDetail  } from "../models";
import { sequelize } from "../models";
import { literal } from "sequelize";
// Create
export const createFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.create(req.body);
    res.status(201).json({ success: true, farmer });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Get all
export const getFarmers = async (_req: Request, res: Response) => {
  try {
    const farmers = await Farmer.findAll();
    res.json({ success: true, farmers });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Get one
export const getFarmerById = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findByPk(req.params.id);
    if (!farmer)
      return res
        .status(404)
        .json({ success: false, message: "Farmer not found" });

    res.json({ success: true, farmer });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Update
export const updateFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.findByPk(req.params.id);
    if (!farmer)
      return res
        .status(404)
        .json({ success: false, message: "Farmer not found" });

    await farmer.update(req.body);

    res.json({ success: true, farmer });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};


export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const ranges_query = `
      SELECT 
        (CASE WHEN b.range = 'OTHER' THEN b.range_other ELSE b.range END) AS \`range\`,
        a.farmer_category,
        COUNT(a.id) AS farmers
      FROM nfa_main a
      LEFT JOIN nfa_block_details b ON a.id = b.parentID
      GROUP BY 
        (CASE WHEN b.range = 'OTHER' THEN b.range_other ELSE b.range END),
        a.farmer_category;
    `;

    const category_query = `
      SELECT farmer_category, COUNT(id) AS farmers 
      FROM nfa_main 
      GROUP BY farmer_category;
    `;

    const type_query = `
      SELECT farmer_type, COUNT(id) AS farmers 
      FROM nfa_main 
      GROUP BY farmer_type;
    `;

    const gender_query = `
      SELECT gender, COUNT(a.id) AS farmers 
      FROM nfa_main a
      LEFT JOIN nfa_individual b ON a.id = b.parentID
      WHERE gender IS NOT NULL
      GROUP BY gender;
    `;

    // Run queries
    const [ranges] = await sequelize.query(ranges_query);
    const [categories] = await sequelize.query(category_query);
    const [types] = await sequelize.query(type_query);
    const [gender] = await sequelize.query(gender_query);

    return res.json({
      success: true,
      ranges,
      categories,
      types,
      gender
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, error });
  }
};

export const fetchFarmers = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT DISTINCT
        a.physical_address,
        a.postal_address,
        a.tin,
        a.documentID,
        a.issue_date,
        a.stage,
        a.director_comments,
        a.executive_comments,
        a.id,
        d.gender,
        b.period,
        a.licenseID,
        a.updated_at,
        a.primary_contact,
        a.farmer_category,
        a.email_address,
        a.name,
        a.farmer_type,
        a.clientID,
        b.total_area_planted,
        b.hectares_allocated,
        b.rateperha,
        c.block_number,
        (CASE WHEN c.\`range\` = 'OTHER' THEN c.range_other ELSE c.\`range\` END) AS \`range\`,
        (CASE WHEN c.sector = 'OTHER' THEN c.sector_other ELSE c.sector END) AS sector,
        (CASE WHEN c.beat = 'OTHER' THEN c.beat_other ELSE c.beat END) AS beat,
        (CASE WHEN c.reserve = 'OTHER' THEN c.reserve_other ELSE c.reserve END) AS reserve
      FROM nfa_main a
      LEFT JOIN nfa_hectare_details b ON a.id = b.parentID
      LEFT JOIN nfa_block_details c ON a.id = c.parentID
      LEFT JOIN nfa_individual d ON a.id = d.parentID
      WHERE a.status != "DELETED"
      ORDER BY a.id DESC
    `;

    const [farmers] = await sequelize.query(query);

    return res.json({
      success: true,
      records: farmers
    });

  } catch (error) {
    console.error("fetchAllFarmers Error:", error);
    return res.status(500).json({ success: false, error });
  }
};

