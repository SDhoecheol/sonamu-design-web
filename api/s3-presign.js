import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    let body = req.body;
    if (!body) {
       const buffers = [];
       for await (const chunk of req) {
         buffers.push(chunk);
       }
       body = JSON.parse(Buffer.concat(buffers).toString());
    }

    const { files, folderId } = body; 

    let region = process.env.AWS_REGION || process.env.VITE_AWS_REGION;
    // Vercel에서 AWS_REGION 환경변수를 지웠거나 누락한 경우, Vercel 시스템의 기본 리전(us-east-1)이 들어오게 됩니다.
    // 이 경우 S3가 301 Redirect를 발생시키고 브라우저가 CORS 에러(Failed to fetch)를 내뿜게 되므로 서울 리전으로 강제 고정합니다.
    if (!region || region.includes('us-east-1')) {
      region = 'ap-northeast-2';
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.VITE_AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET || process.env.VITE_AWS_BUCKET;
    const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN || process.env.VITE_AWS_CLOUDFRONT_DOMAIN;

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

    const urls = [];

    for (const file of files) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `${folderId}/${file.path}`,
        ContentType: file.type || 'application/octet-stream',
      });
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      
      const finalUrl = cloudfrontDomain 
        ? `https://${cloudfrontDomain}/${folderId}/${file.path}`
        : `https://${bucketName}.s3.${region}.amazonaws.com/${folderId}/${file.path}`;
        
      urls.push({ path: file.path, uploadUrl, finalUrl });
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ urls }));
  } catch (error) {
    console.error('S3 Presign Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
}
