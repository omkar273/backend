import { Request, Response } from "express";
import asyncHandler from "../../utils/asynchandler.js";
import ApiError from "../../utils/api_error.js";
import ApiResponse from "../../utils/api_success.js";
import PricingModel, { IPricingModel } from "../../models/pricing/pricing.model.js";

const getPricingModels = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Optional ID for fetching a specific model
    const { isActive } = req.query; // Optional query parameter to filter by status

    if (id) {
        const pricingModel = await PricingModel.findById(id);
        if (!pricingModel) {
            throw new ApiError("Pricing model not found.", 404);
        }

        res
            .status(200)
            .json(new ApiResponse({ pricingModel }, "Pricing model retrieved successfully."));
        return
    }

    // Query to get all models, optionally filtering by `isActive`
    const filter: Record<string, any> = {};
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }

    const pricingModels = await PricingModel.find(filter);

    res
        .status(200)
        .json(new ApiResponse({ pricingModels }, "Pricing models retrieved successfully."));
    return;
});

export default getPricingModels;