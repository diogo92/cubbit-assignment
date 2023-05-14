import * as mongoose from "mongoose";

// Define Bucket Schema
export interface IBucket extends mongoose.Document {
    name: string;
    createdAt: Date;
}

const bucketSchema = new mongoose.Schema<IBucket>({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Define Bucket Model
export const BucketModel = mongoose.model<IBucket>("Bucket", bucketSchema);


// Define Object Schema
export interface IObject extends mongoose.Document {
    key: string;
    bucketId: mongoose.Schema.Types.ObjectId;
    eTag: string;
    createdAt: Date;
    content: Buffer;
}

const objectSchema = new mongoose.Schema<IObject>({
    key: { type: String, required: true },
    bucketId: { type: mongoose.Schema.Types.ObjectId, ref: "Bucket", required: true },
    eTag: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    content: { type: Buffer, required: false },
});


// Define Object Model
export const ObjectModel = mongoose.model<IObject>("Object", objectSchema);