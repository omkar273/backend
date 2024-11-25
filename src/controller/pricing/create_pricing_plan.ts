import { Request, Response } from "express";
import asyncHandler from "../../utils/asynchandler.js";
import ApiError from '../../utils/api_error.js';
import PricingModel, { IPricingModel } from '../../models/pricing/pricing.model.js';
import ApiResponse from '../../utils/api_success.js';

const createPricingPlan = asyncHandler(async (req: Request, res: Response) => {
    const {
        name,
        description,
        feaures = [],
        unavailable_features = [],
        isActive = true,
        pricing_tiers = [],
        monthly_package_discount = 0,
        quarterly_package_discount = 0,
        annual_package_discount = 0,
    } = req.body as IPricingModel;

    const existingPlan = await PricingModel.findOne({ name });
    if (existingPlan) {
        throw new ApiError("A pricing plan with this name already exists.", 400);
    }

    // Validate required fields
    if (!name || !pricing_tiers.length) {
        throw new ApiError("Name and pricing tiers are required.", 400);
    }

    // Validate each pricing tier
    const invalidTier = pricing_tiers.some((tier: any) => {
        return (
            typeof tier.min_flats !== "number" ||
            typeof tier.max_flats !== "number" ||
            typeof tier.price_per_flat !== "number"
        );
    });

    if (invalidTier) {
        throw new ApiError("Each pricing tier must have valid 'min_flats', 'max_flats', and 'price_per_flat' fields.", 400);
    }

    // Create the pricing plan
    const pricingPlan = new PricingModel({
        name,
        description,
        feaures,
        unavailable_features,
        isActive,
        pricing_tiers,
        monthly_package_discount,
        quarterly_package_discount,
        annual_package_discount,
    });

    // Save to database
    await pricingPlan.save();

    res.status(201).json(new ApiResponse({ pricingPlan }, "Pricing plan created successfully."));
});

export default createPricingPlan;