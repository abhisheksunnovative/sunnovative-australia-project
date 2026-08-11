import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    date: { type: String },
    author: { type: String },
    readTime: { type: String },
    image: { type: String },
    summary: { type: String },
    paragraphs: [{ type: String }],
    keyTakeaways: [{ type: String }],
    faqs: [
      {
        q: { type: String },
        a: { type: String },
      },
    ],
    country: { type: String, default: "india", index: true },
    projectType: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);
