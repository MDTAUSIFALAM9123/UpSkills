import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';

export default function Navroute() {
  const router = useRouter();

  return (
    <div className="flex h-14 w-full items-center bg-purple-600 px-4 md:hidden">
      <button onClick={() => router.back()}>
        <IoArrowBack className="text-3xl text-white" />
      </button>
    </div>
  );
}
