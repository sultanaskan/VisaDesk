import { prisma } from "../config/prisma.js";
export async function listCountries(req,res){res.json({success:true,data:await prisma.country.findMany({where:{isActive:true},orderBy:{name:"asc"}})});}
export async function listCategories(req,res){res.json({success:true,data:await prisma.visaCategory.findMany({where:{isActive:true},orderBy:{name:"asc"}})});}
export async function listCenters(req,res){const where={isActive:true};if(req.query.countryId)where.countryId=Number(req.query.countryId);res.json({success:true,data:await prisma.visaCenter.findMany({where,include:{country:true},orderBy:{name:"asc"}})});}
export async function createCountry(req,res){const item=await prisma.country.create({data:req.validated.body});res.status(201).json({success:true,data:item});}
export async function createCategory(req,res){const item=await prisma.visaCategory.create({data:req.validated.body});res.status(201).json({success:true,data:item});}
export async function createCenter(req,res){const item=await prisma.visaCenter.create({data:req.validated.body});res.status(201).json({success:true,data:item});}
