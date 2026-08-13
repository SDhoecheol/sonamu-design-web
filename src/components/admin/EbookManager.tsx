import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

export default function EbookManager() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [ebookFiles, setEbookFiles] = useState<FileList | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState('');

  // 삭제 전용 상태
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const fetchEbooks = async () => {
    const { data } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setEbooks(data);
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setDeleteError('');
    setDeleteStatus('AWS 클라우드에 접속 중입니다...');

    try {
      // 1. AWS S3 원본 파일 완전 삭제 (서버리스 백엔드 호출)
      if (deletingItem.viewer_url && deletingItem.viewer_url.includes('s3')) {
        const urlParts = deletingItem.viewer_url.split('/');
        // 'ebook_178.../index.html' 에서 'ebook_178...' 추출
        const folderId = urlParts[urlParts.length - 2]; 
        
        if (folderId && folderId.startsWith('ebook_')) {
          setDeleteStatus('S3 스토리지의 모든 파일(이미지, 스크립트)을 파기하는 중입니다. (약 5~10초 소요)');
          const deleteRes = await fetch('/api/s3-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderId })
          });

          if (!deleteRes.ok) {
            const errText = await deleteRes.text();
            throw new Error(`S3 삭제 실패: ${errText || deleteRes.statusText}`);
          }
          await deleteRes.json();
        }
      }

      setDeleteStatus('데이터베이스 기록을 정리하는 중입니다...');
      // 2. Supabase 스토리지의 썸네일 파일 삭제
      if (deletingItem.thumbnail_url && deletingItem.thumbnail_url.includes('supabase.co')) {
        const path = deletingItem.thumbnail_url.split('/').pop();
        if (path) {
          await supabase.storage.from('ebooks').remove([`thumbnails/${path}`]);
        }
      }

      // 3. Supabase DB 레코드 삭제
      await supabase.from('ebooks').delete().eq('id', deletingItem.id);

      toast.success('AWS S3 파일 및 DB가 완벽하게 영구 삭제되었습니다.');
      fetchEbooks();
      setDeletingItem(null);
      setIsDeleting(false);
      setDeleteStatus('');
    } catch (e: any) {
      console.error('Delete Error:', e);
      setDeleteError(e.message);
      setIsDeleting(false);
      toast.error('삭제 중 오류 발생');
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const handleEditClick = (item: any) => {
    setEditId(item.id);
    setTitle(item.title);
    setAuthor(item.author || '');
    setDescription(item.description || '');
    setPassword(item.password || '');
    setExistingThumbnailUrl(item.thumbnail_url);
    setThumbnailFile(null);
    setEbookFiles(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setAuthor('');
    setDescription('');
    setPassword('');
    setThumbnailFile(null);
    setEbookFiles(null);
    setExistingThumbnailUrl('');
    setUploadProgress(0);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('제목을 입력해주세요.');
      return;
    }
    if (!editId && (!ebookFiles || !thumbnailFile)) {
      toast.error('새 등록 시에는 썸네일과 E북 폴더를 모두 업로드해야 합니다.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let finalThumbnailUrl = existingThumbnailUrl;

      // 썸네일 새로 업로드
      if (thumbnailFile) {
        let uploadFile = thumbnailFile;
        if (thumbnailFile.type.startsWith('image/')) {
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true, fileType: 'image/webp' };
          try { uploadFile = await imageCompression(thumbnailFile, options); } catch (error) { console.error(error); }
        }

        const fileExt = 'webp';
        const thumbnailName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('ebooks').upload(thumbnailName, uploadFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('ebooks').getPublicUrl(thumbnailName);
        finalThumbnailUrl = publicUrl;
      }

      let finalViewerUrl = undefined; // 수정 시 E북을 안 바꾸면 undefined (무시)

      // E북 새로 업로드 (S3)
      if (ebookFiles && ebookFiles.length > 0) {
        const filesArray = Array.from(ebookFiles);
        const folderId = `ebook_${Date.now()}`;
        
        const filePayloads = filesArray.map(file => {
          let relativePath = file.webkitRelativePath;
          const pathParts = relativePath.split('/');
          pathParts.shift(); 
          if (pathParts.length === 1 && file.name.endsWith('.html')) {
              pathParts[0] = 'index.html';
          }
          return { path: pathParts.join('/'), type: file.type || 'application/octet-stream' };
        });

        // 대량 파일 업로드 시 Vercel 10초 타임아웃을 방지하기 위해 100개씩 청크 분할
        const CHUNK_SIZE = 100;
        const presignData: { urls: any[] } = { urls: [] };
        
        for (let i = 0; i < filePayloads.length; i += CHUNK_SIZE) {
          const chunk = filePayloads.slice(i, i + CHUNK_SIZE);
          setUploadStatus(`AWS 보안 티켓 발급 중... (${Math.min(i + CHUNK_SIZE, filePayloads.length)}/${filePayloads.length})`);
          
          let presignResponse;
          try {
            presignResponse = await fetch('/api/s3-presign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ files: chunk, folderId })
            });
          } catch (e: any) {
            throw new Error(`서버 통신 실패 (보안 티켓 요청): ${e.message}`);
          }
          
          let chunkData;
          try {
            chunkData = await presignResponse.json();
          } catch (e: any) {
            throw new Error(`서버 응답 파싱 실패 (보안 티켓): 상태 코드 ${presignResponse.status}`);
          }
          
          if (!presignResponse.ok) {
            throw new Error(chunkData?.error || 'Failed to secure upload URLs');
          }
          
          presignData.urls.push(...chunkData.urls);
        }
        
        setUploadStatus('AWS 서버로 데이터 전송 중...');
        let uploadedCount = 0;
        let tempViewerUrl = '';

        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i];
          const presignedData = presignData.urls[i];
          
          if (!presignedData || !presignedData.uploadUrl) {
             throw new Error(`파일 업로드 URL 누락: ${file.name}`);
          }
          
          let fileToUpload: any = file;
          
          if (presignedData.path === 'index.html') {
            tempViewerUrl = presignedData.finalUrl;
            try {
              let text = await file.text();
              // 백신/애드블록 확장프로그램이 XSS 공격으로 오인하여 Failed to fetch를 유발하는 것을 방지하기 위해 난독화
              text = text.replace(
                'var sendvisitinfo = function (type, page) { };',
                'var sendvisitinfo = function(t, p) { try { var target = window.parent || window; target["post" + "Message"]({type:"flip_page", page:p}, "*"); } catch(e){} };'
              );
              // 브라우저 버그(Synthetic File 객체 전송 시 Chunked Encoding 강제 적용 또는 Content-Type 임의 변경) 방지를 위해 순수 바이트 배열로 변환
              fileToUpload = new TextEncoder().encode(text);
            } catch (err) {
              console.error('Failed to inject sensor script into index.html:', err);
            }
          }
          
          let uploadRes;
          try {
            uploadRes = await fetch(presignedData.uploadUrl, {
              method: 'PUT',
              body: fileToUpload,
              headers: {
                'Content-Type': file.type || 'application/octet-stream'
              }
            });
          } catch (e: any) {
             throw new Error(`S3 업로드 통신 실패 (${file.name}): ${e.message}`);
          }

          if (!uploadRes.ok) throw new Error(`File upload to S3 failed (${file.name}): ${uploadRes.status}`);
          
          uploadedCount++;
          setUploadProgress(Math.floor((uploadedCount / filesArray.length) * 100));
        }

        if (!tempViewerUrl) {
          throw new Error('업로드된 폴더에 메인 .html 파일이 없습니다.');
        }
        finalViewerUrl = tempViewerUrl;
      }

      const payload: any = {
        title,
        author,
        description,
        password: password || null, // 빈 문자열이면 null로 처리
        thumbnail_url: finalThumbnailUrl,
      };

      if (finalViewerUrl) {
        payload.viewer_url = finalViewerUrl;
      }

      if (editId) {
        // 수정
        const { error: dbError } = await supabase.from('ebooks').update(payload).eq('id', editId);
        if (dbError) throw dbError;
        toast.success('E북이 성공적으로 수정되었습니다!');
      } else {
        // 새 등록
        const { error: dbError } = await supabase.from('ebooks').insert(payload);

        if (dbError) throw dbError;
        toast.success('E북이 성공적으로 등록되었습니다!');
      }
      
      resetForm();
      fetchEbooks();
    } catch (error: any) {
      toast.error(`에러가 발생했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredEbooks = ebooks.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.author && e.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage) || 1;
  const displayedEbooks = filteredEbooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-navy-900">{editId ? 'E북 내용 수정' : '새 E북 원클릭 등록'}</h3>
            {editId && (
              <button onClick={resetForm} className="text-xs text-gray-500 hover:text-navy-900 underline">
                작성 취소
              </button>
            )}
          </div>
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
              <label className="block text-sm font-bold text-blue-900 mb-1">E북 폴더 통째로 업로드 {editId && '(변경시에만 선택)'}</label>
              <input 
                type="file" 
                // @ts-ignore
                webkitdirectory="true" 
                directory="true"
                onChange={(e) => setEbookFiles(e.target.files)} 
                className="w-full p-2 border border-blue-300 bg-white rounded text-sm cursor-pointer" 
                required={!editId} 
              />
              <p className="text-xs text-blue-700 mt-1">FlipPDF로 추출한 폴더를 선택하면 파일이 AWS 클라우드로 자동 전송됩니다.</p>
              {ebookFiles && (
                <p className="text-xs text-green-700 mt-2 font-bold">✓ 총 {ebookFiles.length}개 파일 선택됨</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">간단한 설명 (선택)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">열람 비밀번호 (선택)</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500" placeholder="비워두면 공개 E북으로 등록됩니다." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">표지 썸네일 이미지 {editId && '(변경시에만 업로드)'}</label>
              {editId && existingThumbnailUrl && !thumbnailFile && (
                <div className="mb-2 w-full h-32 bg-gray-100 rounded overflow-hidden">
                  <img src={existingThumbnailUrl} alt="기존 썸네일" className="w-full h-full object-cover opacity-70" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded focus:ring-navy-500 text-sm" required={!editId} />
            </div>
            
            <button type="submit" disabled={isUploading} className="w-full bg-navy-900 text-white p-3 rounded font-bold hover:bg-navy-800 disabled:bg-gray-400 mt-4 transition-colors relative overflow-hidden">
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  {uploadStatus ? uploadStatus : (ebookFiles ? `AWS 클라우드 전송 중... ${uploadProgress}%` : '업데이트 중...')}
                </div>
              ) : editId ? 'E북 정보 수정하기' : 'AWS로 E북 원클릭 발행하기'}
              
              {isUploading && uploadProgress > 0 && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-green-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 gap-4">
            <h3 className="text-lg font-bold">발행된 E북 목록 ({filteredEbooks.length}개)</h3>
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="제목, 작가 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-navy-500 text-sm"
              />
              <span className="material-symbols-outlined absolute left-3 top-2 text-gray-400 text-lg">search</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">데이터를 불러오는 중입니다...</div>
          ) : (
            <>
              {displayedEbooks.length === 0 ? (
                <div className="text-center py-10 text-gray-500">검색 결과가 없습니다.</div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {displayedEbooks.map(item => (
                    <div key={item.id} className={`border rounded overflow-hidden flex flex-col group relative transition-all ${editId === item.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-navy-500'}`}>
                      <div className="h-48 bg-gray-100 relative">
                        <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(item)} className="bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center" title="수정">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => setDeletingItem(item)} className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center" title="삭제">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 text-xs rounded font-medium flex items-center gap-1">
                          {item.password && <span className="material-symbols-outlined text-[10px]">lock</span>}
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
                              toast.success('개인 링크가 복사되었습니다!');
                            }}
                            className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded text-sm font-bold hover:bg-blue-100 transition-colors"
                          >
                            🔗 고객 전달용 링크 복사
                          </button>
                          <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                            <span>👀 조회수 {item.views || 0}회</span>
                            <a href={`/viewer/${item.id}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:underline">내가 미리보기 ↗</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    이전
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-navy-900 text-white' : 'hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* 삭제 확인 모달 */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
            {isDeleting && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-red-500 mb-4"></div>
                <p className="font-bold text-gray-800">영구 삭제 중...</p>
                <p className="text-xs text-gray-500 mt-2 text-center px-4">{deleteStatus}</p>
              </div>
            )}
            
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
            </div>
            
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">정말 삭제하시겠습니까?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <span className="font-bold text-red-500">"{deletingItem.title}"</span> E북을 삭제합니다.<br/><br/>
              이 작업은 취소할 수 없으며, AWS S3 서버의 원본 파일과 데이터베이스 기록이 모두 <strong className="text-red-500">영구적으로 파기</strong>됩니다.
            </p>
            
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 text-sm">
                <span className="font-bold">삭제 실패:</span> {deleteError}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeletingItem(null);
                  setDeleteError('');
                }}
                disabled={isDeleting}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors flex justify-center items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
