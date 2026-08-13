import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    } else if (!body) {
       const buffers = [];
       for await (const chunk of req) {
         buffers.push(chunk);
       }
       body = JSON.parse(Buffer.concat(buffers).toString());
    }

    const { folderId } = body;
    if (!folderId) {
      throw new Error('folderId is required');
    }

    // Vercel 환경 변수나 로컬 .env에서 불러옴
    const region = process.env.VITE_AWS_REGION || process.env.AWS_REGION;
    const accessKeyId = process.env.VITE_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.VITE_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.VITE_AWS_BUCKET || process.env.AWS_BUCKET;

    if (!secretAccessKey) {
        throw new Error('AWS credentials are not configured on the server.');
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      }
    });

    // 1. 해당 폴더 하위의 모든 객체(파일) 가져오기
    let isTruncated = true;
    let continuationToken = undefined;
    let totalDeleted = 0;

    while (isTruncated) {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: `${folderId}/`,
        ContinuationToken: continuationToken
      });
      
      const listRes = await s3Client.send(listCommand);
      
      if (listRes.Contents && listRes.Contents.length > 0) {
        // 2. 찾아낸 객체들을 모아서 한 번에 삭제 요청
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: listRes.Contents.map(obj => ({ Key: obj.Key })),
            Quiet: false
          }
        });
        
        await s3Client.send(deleteCommand);
        totalDeleted += listRes.Contents.length;
      }
      
      isTruncated = listRes.IsTruncated;
      continuationToken = listRes.NextContinuationToken;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, deletedCount: totalDeleted, message: `Successfully deleted ${totalDeleted} objects from S3.` }));
  } catch (error) {
    console.error('S3 Delete Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
}
