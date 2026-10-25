'use client';

import { useRouter, usePathname } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';

export default function Navroute() {
  const router = useRouter();
  const pathname = usePathname();

  const routeName = pathname
    .split('/')
    .filter(Boolean)
    .filter(
      segment =>
        !/^[0-9]+$/.test(segment) && // Numeric ID
        !segment.startsWith('#') && // #Cmvjp428c001dhh8hpod4cxfy
        !/^c[a-z0-9]{20,}$/i.test(segment) && // CUID
        !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment) // UUID
    )
    .pop();

  const title = routeName
    ? routeName.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    : 'Home';

  return (
    <div className="bg-primaryColor flex h-14 w-full items-center gap-3 px-4 md:hidden">
      <button type="button" onClick={() => router.back()} aria-label="Go back">
        <IoArrowBack className="text-3xl text-white" />
      </button>

      <h1 className="text-2xl font-semibold text-white">{title}</h1>
    </div>
  );
}
