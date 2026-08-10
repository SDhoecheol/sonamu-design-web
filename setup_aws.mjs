import { S3Client, CreateBucketCommand, PutBucketWebsiteCommand, PutBucketPolicyCommand, PutPublicAccessBlockCommand, PutBucketCorsCommand, PutBucketOwnershipControlsCommand } from '@aws-sdk/client-s3';
import { IAMClient, CreateUserCommand, PutUserPolicyCommand, CreateAccessKeyCommand } from '@aws-sdk/client-iam';
import fs from 'fs';

const REGION = 'ap-northeast-2'; // 서울 리전
const BUCKET_NAME = 'sonamu-ebooks-' + Math.floor(Math.random() * 10000); // 전 세계 고유 이름 필요
const ADMIN_ACCESS_KEY = '삭제됨(보안)';
const ADMIN_SECRET_KEY = '삭제됨(보안)';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ADMIN_ACCESS_KEY,
    secretAccessKey: ADMIN_SECRET_KEY
  }
});

const iamClient = new IAMClient({
  region: 'us-east-1', // IAM은 글로벌 서비스
  credentials: {
    accessKeyId: ADMIN_ACCESS_KEY,
    secretAccessKey: ADMIN_SECRET_KEY
  }
});

async function run() {
  console.log(`🚀 AWS S3 버킷 [${BUCKET_NAME}] 생성 중...`);
  
  try {
    // 1. 버킷 생성
    await s3Client.send(new CreateBucketCommand({
      Bucket: BUCKET_NAME,
      CreateBucketConfiguration: { LocationConstraint: REGION }
    }));
    console.log('✅ 버킷 생성 완료');

    // 2. 퍼블릭 엑세스 차단 해제 (퍼블릭 버킷으로 만들기 위해)
    await s3Client.send(new PutPublicAccessBlockCommand({
      Bucket: BUCKET_NAME,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
    }));
    console.log('✅ 퍼블릭 액세스 차단 해제 완료');
    
    // ACL 활성화 (객체 소유권 제어)
    await s3Client.send(new PutBucketOwnershipControlsCommand({
      Bucket: BUCKET_NAME,
      OwnershipControls: {
        Rules: [{ ObjectOwnership: 'ObjectWriter' }]
      }
    }));
    console.log('✅ 객체 소유권 설정 완료');

    // 3. 정적 웹사이트 호스팅 활성화
    await s3Client.send(new PutBucketWebsiteCommand({
      Bucket: BUCKET_NAME,
      WebsiteConfiguration: {
        IndexDocument: { Suffix: 'index.html' },
        ErrorDocument: { Key: 'error.html' }
      }
    }));
    console.log('✅ 정적 웹사이트 호스팅 활성화 완료');

    // 4. 버킷 정책 설정 (누구나 읽을 수 있게)
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [{
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
      }]
    };
    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }));
    console.log('✅ 버킷 퍼블릭 읽기 권한(Policy) 부여 완료');

    // 5. CORS 설정 (관리자 페이지 프론트엔드에서 직접 업로드하기 위해)
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [{
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'], // 나중에 운영 도메인으로 제한 가능
          ExposeHeaders: ['ETag']
        }]
      }
    }));
    console.log('✅ CORS 설정 완료');

    // 6. 보안을 위해 업로드 전용 제한된 IAM 계정 생성
    const userName = 'sonamu-ebook-uploader';
    console.log(`\n🔒 보안 계정 [${userName}] 생성 중... (대표님의 관리자 키 노출 방지)`);
    
    try {
      await iamClient.send(new CreateUserCommand({ UserName: userName }));
    } catch (e) {
      if (e.name !== 'EntityAlreadyExistsException') throw e;
      console.log('계정이 이미 존재하여 기존 계정에 정책을 덮어씌웁니다.');
    }

    // 7. 업로드 전용 계정에 최소 권한 부여 (오직 해당 버킷에 업로드만 가능)
    const userPolicy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Action: ['s3:PutObject', 's3:PutObjectAcl'],
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
      }]
    };
    await iamClient.send(new PutUserPolicyCommand({
      UserName: userName,
      PolicyName: 'S3UploadOnlyPolicy',
      PolicyDocument: JSON.stringify(userPolicy)
    }));
    
    // 8. 키 발급
    const keyData = await iamClient.send(new CreateAccessKeyCommand({ UserName: userName }));
    const restrictedAccessKey = keyData.AccessKey.AccessKeyId;
    const restrictedSecretKey = keyData.AccessKey.SecretAccessKey;
    console.log('✅ 안전한 업로드 전용 보안 키 발급 완료');

    // 9. .env.local 파일에 키 자동 저장
    const envContent = `\n# AWS S3 Ebook Upload Configuration
VITE_AWS_REGION=${REGION}
VITE_AWS_BUCKET=${BUCKET_NAME}
VITE_AWS_ACCESS_KEY_ID=${restrictedAccessKey}
VITE_AWS_SECRET_ACCESS_KEY=${restrictedSecretKey}\n`;

    fs.appendFileSync('.env.local', envContent);
    console.log('\n🎉 모든 AWS 인프라 세팅이 성공적으로 완료되었습니다!');
    console.log(`👉 생성된 버킷: ${BUCKET_NAME}`);
    console.log('👉 .env.local 파일에 안전한 키 저장 완료!');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
}

run();
