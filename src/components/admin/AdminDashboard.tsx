import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-navy-900 mb-8">대시보드</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 포트폴리오 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4">포트폴리오 관리</h3>
          <p className="text-gray-600 mb-6">메인 홈페이지에 노출되는 포트폴리오 이미지를 추가, 수정, 삭제합니다.</p>
          <Link to="/sd-master/portfolio" className="inline-block bg-navy-900 text-white px-4 py-2 rounded hover:bg-navy-800 transition-colors">
            관리하기
          </Link>
        </div>

        {/* E북 호스팅 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4">E북 호스팅 관리</h3>
          <p className="text-gray-600 mb-6">고객에게 제공할 E북(도록) 링크를 생성하고 관리합니다.</p>
          <Link to="/sd-master/ebook" className="inline-block bg-navy-900 text-white px-4 py-2 rounded hover:bg-navy-800 transition-colors">
            관리하기
          </Link>
        </div>
      </div>
    </div>
  );
}
