import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="items-center bg-gray-100 px-8 py-8 sm:px-20">
      <div className="min-h-xl flex justify-center">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 py-4 md:grid-cols-4">
          <div>
            <Link href="/">
              <Image
                src="/Logo.png"
                alt="Shopu Logo"
                width={150}
                height={100}
                className="object-contain"
              />
            </Link>
            <p className="mt-4 text-gray-600">
              Upskills is a powerful and feature-packed learning platform with a clean, modern
              interface, designed to deliver seamless learning experiences across all devices.
            </p>
            <div className="flex gap-4 pt-10">
              <Link href={'https://www.facebook.com'} target="_blank">
                <FaFacebook size={24} className="cursor-pointer text-[#7540CD]" />
              </Link>
              <Link href={'https://www.twitter.com'} target="_blank">
                <FaTwitter size={24} className="cursor-pointer text-[#7540CD]" />
              </Link>
              <Link href={'https://www.linkedin.com'} target="_blank">
                <FaLinkedin size={24} className="cursor-pointer text-[#7540CD]" />
              </Link>
            </div>
          </div>

          <div>
            <div>
              <h3 className="text-1g font-semibold text-gray-800">Company</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>
                  <Link href="#">About</Link>
                </li>
                <li>
                  <Link href="#">Pricing</Link>
                </li>
                <li>
                  <Link href="#">Blog</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
                <li>
                  <Link href="#">Contact</Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-1g font-semibold text-gray-800">Support</h3>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>
                <Link href="#">Help & Support</Link>
              </li>
              <li>
                <Link href="#">Become Instructor</Link>
              </li>
              <li>
                <Link href="#">Get the App</Link>
              </li>
              <li>
                <Link href="#">FAQs</Link>
              </li>
              <li>
                <Link href="#">Tutorials</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-1g font-semibold text-gray-800">Get in Touch</h3>
            <p className="mt-4 text-gray-600"> 339 McDermott Points Hettingerhaven, NV 15283</p>
            <p className="mt-2 text-gray-600">
              Emai: <Link href="mailto:upskill854@gmail.com"> upskill854@gmail.com</Link>
            </p>
            <p className="mt-2 text-gray-600">
              Phone: <strong>(000) 123 456 789</strong>
            </p>
            <div className="mt-4 flex space-x-2">
              <a href="">
                <img
                  src="https://www.avaza.com/wp-content/uploads/2020/06/App-store.webp"
                  alt="App Store"
                  className="w-32"
                />
              </a>
              <a href="">
                {' '}
                <img
                  src="https://www.gulfjobpaper.com/wp-content/uploads/2023/09/App-Gulf-Job-Paper.webp"
                  alt="Google Play"
                  className="w-32"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="text-md mt-4 border-t pt-5 text-center text-gray-500">
        <p>&copy; 2025 UpSkills</p>
      </div>
    </footer>
  );
}
