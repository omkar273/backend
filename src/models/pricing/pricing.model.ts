import { model, Schema } from "mongoose";

export interface IPricingTier {
    min_flats: number;
    max_flats: number;
    price_per_flat: number;
}

export interface IPricingModel extends Document {
    name: string;
    description: string;
    feaures: string[];
    unavailable_features: string[];
    isActive: boolean;
    pricing_tiers: IPricingTier[];
    monthly_package_discount: number;
    quarterly_package_discount: number;
    annual_package_discount: number;
    freeTier: boolean;
}

const pricingModelSchema = new Schema<IPricingModel>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    feaures: [
        {
            type: String,
            default: [],
        },
    ],
    unavailable_features: [
        {
            type: String,
            default: [],
        },
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    pricing_tiers: {
        type: [
            {
                min_flats: {
                    type: Number,
                    required: true,
                },
                max_flats: {
                    type: Number,
                    required: true,
                },
                price_per_flat: {
                    type: Number,
                    required: true,
                },
            },
        ],
        default: [],
    },
    monthly_package_discount: {
        type: Number,
        default: 0,
    },
    quarterly_package_discount: {
        type: Number,
        default: 0,
    },
    annual_package_discount: {
        type: Number,
        default: 0,
    },
    freeTier: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const PricingModel = model<IPricingModel>("PricingModel", pricingModelSchema);

export default PricingModel;