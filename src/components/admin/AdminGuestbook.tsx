import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AdminGuestbook() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ebook_guestbook')
      .select(`
        *,
        ebooks ( title )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('방명록 데이터를 불러오는데 실패했습니다.');
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 이 방명록을 삭제하시겠습니까?')) return;

    const { error } = await supabase.from('ebook_guestbook').delete().eq('id', id);
    if (error) {
      console.error(error);
      toast.error('삭제에 실패했습니다.');
    } else {
      toast.success('방명록이 삭제되었습니다.');
      setEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-navy-900">방명록 관리</h2>
        <button onClick={fetchEntries} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">refresh</span>
          새로고침
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">불러오는 중...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">등록된 방명록이 없습니다.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-50 border-b border-gray-200 text-navy-900">
                <th className="p-4 font-bold text-sm">작성일</th>
                <th className="p-4 font-bold text-sm">E북 제목</th>
                <th className="p-4 font-bold text-sm">작성자</th>
                <th className="p-4 font-bold text-sm w-1/2">내용</th>
                <th className="p-4 font-bold text-sm text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-700 truncate max-w-[150px]">
                    {entry.ebooks?.title || '알 수 없음'}
                  </td>
                  <td className="p-4 text-sm font-bold text-navy-900">
                    {entry.author}
                  </td>
                  <td className="p-4 text-sm text-gray-700 break-words whitespace-pre-wrap">
                    {entry.content}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
