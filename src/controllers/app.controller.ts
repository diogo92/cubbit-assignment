
import * as express from 'express';
import { createBucket, findBucketByName, getObjectByKey, getObjectContent, getObjectList, putObject } from '../services/app.service';

export const controller = express.Router();

/**
 * Create a new bucket
 * @name PUT /:bucket
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {void} - Status 200 OK
 */
controller.put("/:bucket", async (req, res) => {
  const bucketName = req.params.bucket;
  await createBucket(bucketName);
  res.status(200).send();
});

/**
 * Upload an object to a bucket
 * @name PUT /:bucket/:key(*)
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {void} - Status 200 OK ETag: ETag
 */
controller.put("/:bucket/:key(*)", async (req, res) => {
  const etag = req.headers["content-md5"] as string;
  const bucketName = req.params.bucket;
  const key = req.params.key;
  const bucket = await findBucketByName(bucketName);
  console.log(req.body);
  if (!bucket) {
    res.sendStatus(404);
    return;
  }

  await putObject(key, bucket.id, etag, req.body);
  res.set("Content-Type", "application/xml");
  res.setHeader('ETag', etag!);
  res.status(200).send();
});

/**
 * List objects in a bucket
 * @name GET /:bucket
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {void} - Status 200 OK - Body: ListBucketResult
 */
controller.get("/:bucket", async (req, res) => {
  const bucketName = req.params.bucket;
  const marker = req.query["marker"] || "";
  const maxKeys = req.query["max-keys"] || "1000";
  const prefix = req.query["prefix"] || "";
  const foundBucket = await findBucketByName(bucketName);

  if (!foundBucket) {
    res.sendStatus(404);
    return;
  }

  const contents = await getObjectList(foundBucket.id);
  const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
      <ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
        <Name>${bucketName}</Name>
        <Prefix>${prefix}</Prefix>
        <Marker>${marker}</Marker>
        <MaxKeys>${maxKeys}</MaxKeys>
        <IsTruncated>false</IsTruncated>
        ${contents.map((content: { Key: any; LastModified: any; ETag: any; Size: any; }) => `
          <Contents>
            <Key>${content.Key}</Key>
            <LastModified>${content.LastModified}</LastModified>
            <ETag>${content.ETag}</ETag>
            <Size>${content.Size}</Size>
          </Contents>
        `).join('')}
      </ListBucketResult>`;

  res.set("Content-Type", "application/xml");
  res.status(200).send(responseXml);
});

/**
 * Get an object from a bucket
 * @name GET /:bucket/:key(*)
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {void} - Status 200 OK - Body: file content
 */
controller.get("/:bucket/:key(*)", async (req, res) => {
  const bucketName = req.params.bucket;
  const key = req.params.key;
  const rangeHeader = req.headers.range;
  const bucket = await findBucketByName(bucketName);
  if (!bucket) {
    res.sendStatus(404);
    return;
  }

  const object = await getObjectByKey(key, bucket.id);
  if (!object) {
    res.sendStatus(404);
    return;
  }
  const objectContent = await getObjectContent(object.id);
  if (!objectContent) {
    res.sendStatus(500);
    return;
  }

  let contentLength = objectContent.length;
  let start = 0;
  let end = contentLength - 1;

  if (rangeHeader) {
    const [startStr, endStr] = rangeHeader.replace("bytes=", "").split("-");
    start = parseInt(startStr, 10);
    end = endStr ? parseInt(endStr, 10) : contentLength - 1;
    contentLength = end - start + 1;

    res.set("Content-Range", `bytes ${start}-${end}/${objectContent.length}`);
    res.status(206);
  } else {
    res.status(200);
  }

  res.set("Content-Type", object.contentType);
  res.set("Content-Length", contentLength.toString());
  res.set("Last-Modified", object.lastModified.toUTCString());
  res.set("ETag", object.eTag);
  res.send(objectContent.slice(start, end + 1));
});