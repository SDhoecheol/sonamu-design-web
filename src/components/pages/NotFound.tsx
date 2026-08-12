import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h1 className="text-9xl font-black text-navy-900 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">페이지를 찾을 수 없습니다</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        요청하신 페이지가 사라졌거나 잘못된 경로입니다.
      </p>
      <Link 
        to="/" 
        className="bg-navy-900 text-white px-8 py-3 rounded-full font-bold hover:bg-navy-800 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
