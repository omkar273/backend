import mongoose from "mongoose";

export interface IComplaint {
  title: string;
  content: string;
  raised_by: string;
  isResolved: boolean;
  society_code: string;
  raised_by_id: mongoose.Types.ObjectId;
  photo?: string;

}

const complaintSchema = new mongoose.Schema<IComplaint>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    raised_by: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
      required: true,
    },
    society_code: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    raised_by_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);
const ComplaintSchema = mongoose.model<IComplaint>(
  "Complaint",
  complaintSchema
);
export default ComplaintSchema;