import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
export async function getPrices(req,res){
 const where={isActive:true}; for(const k of ["fromCountryId","toCountryId","categoryId","centerId"])if(req.query[k])where[k]=Number(req.query[k]);
 const prices=await prisma.priorityPrice.findMany({where,include:{fromCountry:true,toCountry:true,category:true,center:true},orderBy:[{fromCountry:{name:"asc"}},{toCountry:{name:"asc"}},{category:{name:"asc"}},{center:{name:"asc"}},{level:"asc"}]});res.json({success:true,data:prices});
}
export async function requestPriority(req,res){
 const applicationId=Number(req.params.id),{level}=req.validated.body;
 const request=await prisma.$transaction(async tx=>{
  const application=await tx.application.findFirst({where:{id:applicationId,userId:req.user.id},include:{fromCountry:true,toCountry:true,category:true,center:true}});
  if(!application)throw new HttpError(404,"Application not found.");
  if(!["DRAFT","SUBMITTED"].includes(application.status))throw new HttpError(409,"Priority cannot be changed at this application stage.");
  const pending=await tx.priorityRequest.findFirst({where:{applicationId,status:"PENDING"}});if(pending)throw new HttpError(409,"A priority request is already pending for this application.");
  const price=await tx.priorityPrice.findUnique({where:{fromCountryId_toCountryId_categoryId_centerId_level:{fromCountryId:application.fromCountryId,toCountryId:application.toCountryId,categoryId:application.categoryId,centerId:application.centerId,level}}});
  if(!price||!price.isActive)throw new HttpError(400,"No active price is configured for this from-country, to-country, visa category, center and priority combination.");
  const user=await tx.user.findUnique({where:{id:req.user.id}});const available=Number(user.walletBalance)-Number(user.walletReserved),amount=Number(price.price);
  if(available<amount)throw new HttpError(402,`Insufficient available balance. Please deposit at least ${(amount-available).toFixed(2)} more.`);
  await tx.user.update({where:{id:req.user.id},data:{walletReserved:{increment:price.price}}});
  return tx.priorityRequest.create({data:{userId:req.user.id,applicationId,level,amount:price.price,priceRuleId:price.id}});
 });
 res.status(201).json({success:true,message:"Priority request submitted. The matching configured price has been reserved pending admin review.",data:request});
}
export async function adminPriorityRequests(req,res){const requests=await prisma.priorityRequest.findMany({where:req.query.status?{status:req.query.status}:{},include:{user:{select:{id:true,name:true,email:true,role:true}},application:{include:{fromCountry:true,toCountry:true,category:true,center:true,documents:true}},priceRule:true},orderBy:{createdAt:"desc"}});res.json({success:true,data:requests});}
export async function reviewPriority(req,res){
 const {decision,adminNote}=req.validated.body,requestId=Number(req.params.id);
 const result=await prisma.$transaction(async tx=>{
  const request=await tx.priorityRequest.findUnique({where:{id:requestId}});if(!request)throw new HttpError(404,"Priority request not found.");if(request.status!=="PENDING")throw new HttpError(409,"This request has already been reviewed.");
  const updated=await tx.priorityRequest.update({where:{id:requestId},data:{status:decision==="APPROVE"?"APPROVED":"REJECTED",adminNote,reviewedById:req.user.id,reviewedAt:new Date()}});
  if(decision==="APPROVE"){
   const updatedUser=await tx.user.update({where:{id:request.userId},data:{walletBalance:{decrement:request.amount},walletReserved:{decrement:request.amount}}});
   await tx.walletLedger.create({data:{userId:request.userId,type:"PRIORITY_CAPTURE",amount:request.amount,balanceAfter:updatedUser.walletBalance,referenceType:"PRIORITY_REQUEST",referenceId:request.id,description:`${request.level} priority approved for application #${request.applicationId}`}});
   await tx.application.update({where:{id:request.applicationId},data:{currentPriority:request.level}});
  }else{await tx.user.update({where:{id:request.userId},data:{walletReserved:{decrement:request.amount}}});}
  return updated;
 });res.json({success:true,message:`Priority request ${decision.toLowerCase()}d.`,data:result});
}
export async function adminUpdatePrice(req, res) {
  const { fromCountryId, toCountryId, categoryId, centerId, level, price, isActive } = req.validated.body;
  const [fromCountry, toCountry, category, center] = await Promise.all([
    prisma.country.findUnique({ where: { id: fromCountryId } }),
    prisma.country.findUnique({ where: { id: toCountryId } }),
    prisma.visaCategory.findUnique({ where: { id: categoryId } }),
    prisma.visaCenter.findUnique({ where: { id: centerId } })
  ]);

  if (!fromCountry?.isActive || !toCountry?.isActive || !category?.isActive || !center?.isActive || center.countryId !== fromCountryId) {
    throw new HttpError(400, "Choose active countries, category and center. The selected center must be located in the from country.");
  }

  const uniqueKey = { fromCountryId, toCountryId, categoryId, centerId, level };
  const item = await prisma.priorityPrice.upsert({
    where: { fromCountryId_toCountryId_categoryId_centerId_level: uniqueKey },
    update: { price: price.toFixed(2), ...(isActive === undefined ? {} : { isActive }) },
    create: { ...uniqueKey, price: price.toFixed(2), isActive: isActive ?? true },
    include: { fromCountry: true, toCountry: true, category: true, center: true }
  });
  res.json({ success: true, data: item });
}
