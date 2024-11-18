import { Router } from "express";
import getPricingModels from './../../controller/pricing/get_pricing_models.js';
import createPricingPlan from './../../controller/pricing/create_pricing_plan.js';


const pricingRouter = Router();

pricingRouter.route('/details').get(getPricingModels)

pricingRouter.route('details/:id').get(getPricingModels)

pricingRouter.route('create').post(createPricingPlan)

export default pricingRouter;