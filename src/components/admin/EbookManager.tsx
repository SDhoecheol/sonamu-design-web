import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export default function EbookManager() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [ebookFiles, setEbookFiles] = useState<FileList | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const fetchEbooks = async () => {
    const { data } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setEbooks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const handleDelete = async (id: string, thumbnailUrl: string) => {
    if (!window.confirm('정말 이 E북을 삭제하시겠습니까? (DB에서만 삭제되며, 실제 S3 파일은 유지됩니다)')) return;

    await supabase.from('ebooks').delete().eq('id', id);

    if (thumbnailUrl.includes('supabase.co')) {
      const filePath = thumbnailUrl.split('/ebooks/')[1];
      if (filePath) {
        await supabase.storage.from('ebooks').remove([filePath]);
      }
    }
    
    fetchEbooks();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookFiles || !title || !thumbnailFile) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. 썸네일 수파베이스 업로드
      const fileExt = thumbnailFile.name.split('.').pop();
      const thumbnailName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('ebooks')
        .upload(thumbnailName, thumbnailFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('ebooks')
        .getPublicUrl(thumbnailName);

      // 2. AWS S3에 폴더 통째로 업로드
      const s3Client = new S3Client({
        region: import.meta.env.VITE_AWS_REGION,
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        }
      });
      const bucketName = import.meta.env.VITE_AWS_BUCKET;
      
      const filesArray = Array.from(ebookFiles);
      const folderId = `ebook_${Date.now()}`;
      
      let uploadedCount = 0;
      let finalViewerUrl = '';

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        let relativePath = file.webkitRelativePath; // "폴더명/files/..."
        
        // 최상위 폴더명 제거
        const pathParts = relativePath.split('/');
        pathParts.shift(); 
        
        // 메인 html 파일을 index.html로 강제 변경 (한글 파일명 오류 방지)
        if (pathParts.length === 1 && file.name.endsWith('.html')) {
            pathParts[0] = 'index.html';
        }
        
        const finalPath = `${folderId}/${pathParts.join('/')}`;
        
        // 브라우저 호환성 문제(readableStream 에러) 방지를 위해 ArrayBuffer로 변환 후 전송
        const arrayBuffer = await file.arrayBuffer();
        
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: finalPath,
          Body: new Uint8Array(arrayBuffer),
          ContentType: file.type || 'application/octet-stream'
        }));
        
        if (pathParts.length === 1 && pathParts[0] === 'index.html') {
          finalViewerUrl = `https://${bucketName}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${finalPath}`;
        }
        
        uploadedCount++;
        setUploadProgress(Math.floor((uploadedCount / filesArray.length) * 100));
      }

      if (!finalViewerUrl) {
        throw new Error('업로드된 폴더에 메인 .html 파일이 없습니다.');
      }

      // 3. DB에 저장
      const { error: dbError } = await supabase.from('ebooks').insert({
        title,
        author,
        description,
        viewer_url: finalViewerUrl,
        thumbnail_url: thumbnailUrl,
      });

      if (dbError) throw dbError;

      alert('E북이 성공적으로 업로드 및 등록되었습니다!');
      
      setTitle('');
      setAuthor('');
      setDescription('');
      setEbookFiles(null);
      setThumbnailFile(null);
      
      fetchEbooks();
    } catch (error: any) {
      alert(`에러가 발생했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/sd-master')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-3xl font-bold text-navy-900">E북 호스팅 관리 (AWS S3 연동)</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">새 E북 원클릭 등록</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">작가명 (선택)</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500" />
            </div>
            
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <label className="block text-sm font-bold text-blue-900 mb-1">E북 폴더 통째로 업로드 *</label>
              <input 
                type="file" 
                // @ts-ignore
                webkitdirectory="true" 
                directory="true"
                onChange={(e) => setEbookFiles(e.target.files)} 
                className="w-full p-2 border border-blue-300 bg-white rounded text-sm cursor-pointer" 
                required 
              />
              <p className="text-xs text-blue-700 mt-1">FlipPDF로 추출한 폴더를 선택하면 수백 개의 파일이 AWS 클라우드로 자동 전송됩니다.</p>
              {ebookFiles && (
                <p className="text-xs text-green-700 mt-2 font-bold">✓ 총 {ebookFiles.length}개 파일 선택됨</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">간단한 설명 (선택)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">표지 썸네일 이미지 *</label>
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500 text-sm" required />
            </div>
            
            <button type="submit" disabled={isUploading} className="w-full bg-navy-900 text-white p-3 rounded font-bold hover:bg-navy-800 disabled:bg-gray-400 mt-4 transition-colors relative overflow-hidden">
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  AWS 클라우드 전송 중... {uploadProgress}%
                </div>
              ) : 'AWS로 E북 원클릭 발행하기'}
              
              {isUploading && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-green-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">발행된 E북 목록 ({ebooks.length}개)</h3>
          {loading ? (
            <div className="text-center py-10 text-gray-500">데이터를 불러오는 중입니다...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[800px] pr-2">
              {ebooks.map(item => (
                <div key={item.id} className="border border-gray-200 rounded overflow-hidden flex flex-col group relative hover:border-navy-500 transition-colors">
                  <div className="h-48 bg-gray-100 relative">
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    <button onClick={() => handleDelete(item.id, item.thumbnail_url)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="삭제">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 text-xs rounded font-medium">
                      AWS S3 Hosted
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-bold text-lg text-gray-900 mb-1 truncate">{item.title}</h4>
                    <p className="text-sm text-gray-500 mb-3 truncate">{item.author || '작가 미상'}</p>
                    <div className="mt-auto flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/viewer/${item.id}`);
                          alert('개인 링크가 복사되었습니다! 고객에게 전달하세요.');
                        }}
                        className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded text-sm font-bold hover:bg-blue-100 transition-colors"
                      >
                        🔗 고객 전달용 링크 복사
                      </button>
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                        <span>👀 조회수 {item.views}회</span>
                        <a href={`/viewer/${item.id}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:underline">내가 미리보기 ↗</a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
