'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function ToastProvider() {
  const [position, setPosition] = useState<'top-right' | 'bottom-center'>('top-right');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPosition('bottom-center'); // mobile
      } else {
        setPosition('top-right'); // desktop
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <Toaster position={position} toastOptions={{ duration: 2000 }} />;
}
