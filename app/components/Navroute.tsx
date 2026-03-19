import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';

export default function Navroute() {
  const router = useRouter();

  return (
    <div className="bg-primaryColor flex h-14 w-full items-center px-4 md:hidden">
      <button onClick={() => router.back()}>
        <IoArrowBack className="text-3xl text-white" />
      </button>
    </div>
  );
}
