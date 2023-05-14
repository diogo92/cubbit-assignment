import * as mongoose from "mongoose";
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BucketModel, ObjectModel } from "../../src/models/app.model";
import express = require("express");
import { controller } from "../../src/controllers/app.controller";


describe('Bucket controller', () => {

  let mongoServer: MongoMemoryServer;
  let app: any;

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
    await BucketModel.deleteMany({});
    await ObjectModel.deleteMany({});
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/', controller);
  });


  it('should create a new bucket', async () => {
    const response = await request(app).put('/test-bucket');
    expect(response.status).toBe(200);
    const bucket = await BucketModel.findOne({ name: 'test-bucket' });
    expect(bucket).toBeTruthy();
  });

  it('should upload an object to a bucket', async () => {
    const bucket = await BucketModel.create({ name: 'test-bucket' });
    const response = await request(app)
      .put('/test-bucket/test-key')
      .set('content-md5', 'test-etag');
    expect(response.status).toBe(200);
    const object = await ObjectModel.findOne({ key: 'test-key', bucketId: bucket.id });
    expect(object).toBeTruthy();
    expect(object!.eTag).toBe('test-etag');
  });

  it('should list objects in a bucket', async () => {
    const bucket = await BucketModel.create({ name: 'test-bucket' });
    await ObjectModel.create({ key: 'test-key-1', bucketId: bucket.id, eTag: 'test-etag-1' });
    await ObjectModel.create({ key: 'test-key-2', bucketId: bucket.id, eTag: 'test-etag-2' });
    const response = await request(app).get('/test-bucket');
    expect(response.status).toBe(200);
    expect(response.text).toContain('test-key-1');
    expect(response.text).toContain('test-key-2');
    expect(response.text).toContain('test-etag-1');
    expect(response.text).toContain('test-etag-2');
  });

  it('should return 404 when bucket does not exist', async () => {
    const response = await request(app).put('/non-existent-bucket/object');
    expect(response.status).toBe(404);
  });
});