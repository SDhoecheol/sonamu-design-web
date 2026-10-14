import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
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
    if (typeof body === 'string') {
      body = JSON.parse(body);
    } else if (!body) {
       const buffers = [];
       for await (const chunk of req) {
         buffers.push(chunk);
       }
       body = JSON.parse(Buffer.concat(buffers).toString());
    }

    const { folderId } = body || {};
    // 2. strict folderId validation (경로 순회 및 와일드카드 방지)
    if (!folderId || typeof folderId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(folderId)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: '유효한 folderId(영숫자, 하이픈, 언더스코어)가 필요합니다.' }));
    }

    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET;

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
