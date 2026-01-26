import { Review, IReview } from "../models/Review";

export const createReview = async (data: Partial<IReview>) => {
    const review = new Review(data);
    return await review.save();
};

export const getReviews = async () => {
    return await Review.find().populate("autor_id").populate("destinatario_id");
};

export const getReviewById = async (id: string) => {
    return await Review.findById(id).populate("autor_id").populate("destinatario_id");
};

export const updateReview = async (id: string, data: Partial<IReview>) => {
    return await Review.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReview = async (id: string) => {
    return await Review.findByIdAndDelete(id);
};
