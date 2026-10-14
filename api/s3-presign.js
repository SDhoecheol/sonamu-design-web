import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  // 1. Supabase 관리자 인증 토큰 검증
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: '인증 토큰이 필요합니다. (Unauthorized)' }));
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: '관리자 권한이 유효하지 않습니다. (Forbidden)' }));
      }
    } catch (e) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: '인증 검증 중 오류가 발생했습니다.' }));
    }
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

    const { files, folderId } = body || {}; 

    // 2. strict folderId validation
    if (!folderId || typeof folderId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(folderId)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: '유효한 folderId가 필요합니다.' }));
    }

    // 3. files 배열 검증 및 경로 이탈(Path Traversal) 방지
    if (!Array.isArray(files) || files.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'files 목록이 비어있습니다.' }));
    }

    for (const f of files) {
      if (!f.path || typeof f.path !== 'string' || f.path.includes('..') || f.path.startsWith('/')) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: `안전하지 않은 파일 경로입니다: ${f.path}` }));
      }
    } 

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
