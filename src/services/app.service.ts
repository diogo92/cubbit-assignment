import { BucketModel, ObjectModel } from "../models/app.model";


/**
 * Create a new bucket
 * @param {string} bucketName - name of the bucket to create
 * @returns {string} - ID of the created bucket in the database
 */
export async function createBucket(bucketName: string): Promise<string> {
  const bucket = new BucketModel({ name: bucketName });
  await bucket.save();
  return bucket.id;
}

/**
 * Put an object in a bucket
 * @param {string} key - key of the object
 * @param {string} bucketId - id of the bucket put the object in
 * @param {string} eTag - eTag of the object
 * @param {any} body - content of the object
 * @returns {string} - ID of the inserted object in the database
 */
export async function putObject(key: string, bucketId: string, eTag: string, body: any): Promise<string> {
  let object: any;
  if (body && Object.keys(body).length > 0 ) {
    object = new ObjectModel({ key: key, bucketId: bucketId, eTag: eTag, content: Buffer.from(body)});
  } else {
    object = new ObjectModel({ key: key, bucketId: bucketId, eTag: eTag});
  }
  await object.save();
  return object.id;
}

/**
 * Find a bucket by its name
 * @param {string} bucketName - name of the bucket to find
 * @returns {anu} - bucket if found
 */
export async function findBucketByName(bucketName: string): Promise<any> {
  return await BucketModel.findOne({ name: bucketName });
}

/**
 * Get list of objects in a bucket
 * @param {string} bucketId - id of the bucket to get objects from
 * @returns {any} - List of objects in the bucket
 */
export async function getObjectList(bucketId: string): Promise<any> {
  const objects = await ObjectModel.find({ bucketId: bucketId }).sort({
    createdAt: "desc",
  });
  const contents = objects.map((object) => {
    return {
      Key: object.key,
      LastModified: object.createdAt.toISOString(),
      ETag: object.eTag,
      Size: 0,
    };
  });
  return contents;
}

/**
 * Get objects by its key from a specified bucket
 * @param {string} key - key of the object to find
 * @param {string} bucketId - id of the bucket to get the object from
 * @returns {any} - Object found
 */
export async function getObjectByKey(key: string, bucketId: string): Promise<any> {
  return await ObjectModel.findOne({ key, bucketId });
}

/**
 * Get content of an object
 * @param {string} objectId - id of the object to get the content from
 * @returns {Buffer | null} - Content of the object
 */
export async function getObjectContent(objectId: string): Promise<Buffer | null> {
  const object = await ObjectModel.findById(objectId);
  if (!object) {
    return null;
  }
  console.log(object);
  return object.content;
}