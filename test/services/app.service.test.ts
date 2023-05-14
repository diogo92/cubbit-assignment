import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as appModel from "../../src/models/app.model";
import * as appService from "../../src/services/app.service";



describe("App Service", () => {

  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {

    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await appModel.BucketModel.deleteMany({});
    await appModel.ObjectModel.deleteMany({});
  });

  describe("createBucket", () => {
    it("creates a new bucket", async () => {
      const bucketName = "test-bucket";
      const bucketId = await appService.createBucket(bucketName);
      expect(bucketId).toBeDefined();
      const bucket = await appModel.BucketModel.findById(bucketId);
      expect(bucket).toBeDefined();
      expect(bucket?.name).toBe(bucketName);
    });
  });

  describe("findBucketByName", () => {
    it("finds an existing bucket by name", async () => {
      const bucketName = "test-bucket";
      const bucket = new appModel.BucketModel({ name: bucketName });
      await bucket.save();
      const foundBucket = await appService.findBucketByName(bucketName);
      expect(foundBucket).toBeDefined();
      expect(foundBucket?.id).toBe(bucket.id);
      expect(foundBucket?.name).toBe(bucketName);
    });

    it("returns null when a bucket is not found", async () => {
      const bucketName = "test-bucket";
      const foundBucket = await appService.findBucketByName(bucketName);
      expect(foundBucket).toBeNull();
    });
  });

  describe("putObject", () => {
    it("adds a new object to a bucket", async () => {
      const bucketName = "test-bucket";
      const bucketId = await appService.createBucket(bucketName);
      const key = "test-object";
      const eTag = "test-etag";
      const objectId = await appService.putObject(key, bucketId, eTag, null);
      expect(objectId).toBeDefined();
      const object = await appModel.ObjectModel.findById(objectId);
      expect(object).toBeDefined();
      expect(object?.key).toBe(key);
      expect(object?.bucketId.toString()).toBe(bucketId);
      expect(object?.eTag).toBe(eTag);
    });
  });

  describe("getObjectList", () => {
    it("returns a list of objects in a bucket", async () => {
      const bucketName = "test-bucket";
      const bucketId = await appService.createBucket(bucketName);
      const key1 = "test-object-1";
      const eTag1 = "test-etag-1";
      const key2 = "test-object-2";
      const eTag2 = "test-etag-2";
      await appService.putObject(key1, bucketId, eTag1, null);
      await appService.putObject(key2, bucketId, eTag2, null);
      const objectList = await appService.getObjectList(bucketId);
      expect(objectList.length).toBe(2);
      expect(objectList[0].Key).toBe(key2);
      expect(objectList[0].ETag).toBe(eTag2);
      expect(objectList[1].Key).toBe(key1);
      expect(objectList[1].ETag).toBe(eTag1);
    });

    it("returns an error when bucket is not found", async () => {
      const bucketId = "test-bucket-id";
      await expect(appService.getObjectList(bucketId)).rejects.toThrow();
    });
  });
});