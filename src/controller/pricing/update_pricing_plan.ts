// Update a pricing model
import asyncHandler from './../../utils/asynchandler.js';
import { Request, Response } from 'express';
import { IPricingModel } from 'src/models/pricing/pricing.model.js';
import ApiError from './../../utils/api_error.js';
import PricingModel from './../../models/pricing/pricing.model.js';
import ApiResponse from './../../utils/api_success.js';

const updatePricingModel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body as Partial<IPricingModel>; // Allow partial updates

    // Validate pricing tiers if provided
    if (updates.pricing_tiers) {
        const invalidTier = updates.pricing_tiers.some((tier: any) => {
            return (
                typeof tier.min_flats !== "number" ||
                typeof tier.max_flats !== "number" ||
                typeof tier.price_per_flat !== "number"
            );
        });

        if (invalidTier) {
            throw new ApiError(
                "Each pricing tier must have valid 'min_flats', 'max_flats', and 'price_per_flat' fields.",
                400
            );
        }
    }

    const pricingModel = await PricingModel.findByIdAndUpdate(id, updates, {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation rules are enforced
    });

    if (!pricingModel) {
        throw new ApiError("Pricing model not found.", 404);
    }

    res
        .status(200)
        .json(new ApiResponse({ pricingModel }, "Pricing model updated successfully."));
});
