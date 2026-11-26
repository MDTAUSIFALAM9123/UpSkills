import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import { ArrowUpRight, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

const companyLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Our Courses', href: '/courses' },
  { name: 'Pricing', href: '/courses' },
  { name: 'Contact Us', href: 'mailto:upskills854@gmail.com' },
  { name: 'FAQs', href: '/about' },
];

const supportLinks = [
  { name: 'Help & Support', href: 'mailto:upskills854@gmail.com' },
  { name: 'Become an Instructor', href: 'mailto:upskills854@gmail.com' },
  { name: 'Learning Resources', href: '/courses' },
  { name: 'Terms & Conditions', href: '/terms-and-conditions' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
];

const socialLinks = [
  {
    icon: FaFacebook,
    href: 'https://www.facebook.com',
    label: 'Facebook',
  },
  {
    icon: FaTwitter,
    href: 'https://www.twitter.com',
    label: 'Twitter',
  },
  {
    icon: FaLinkedin,
    href: 'https://www.linkedin.com',
    label: 'LinkedIn',
  },
  {
    icon: FaInstagram,
    href: 'https://www.instagram.com/upskills854?utm_source=ig_web_button_share_sheet&bqrl=ZDNlZDc0MzIxNw==',
    label: 'Instagram',
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-100 text-gray-900">
      <div className="relative mx-auto max-w-7xl px-6 pt-14 sm:px-10 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand Section */}
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/Logo.png"
                alt="UpSkills Logo"
                width={150}
                height={65}
                className="h-auto w-[145px] object-contain"
              />
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-gray-600">
              UpSkills is your gateway to quality online education. Discover practical courses,
              develop valuable skills and take the next step towards a better tomorrow.
            </p>

            {/* Social Links */}
            <div className="mt-7 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#750AE9] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:bg-[#750AE9] hover:text-white hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <Icon size={17} />
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-base font-bold tracking-wide text-gray-900">Company</h3>

            <div className="mt-3 h-1 w-9 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" />

            <ul className="mt-6 space-y-4">
              {companyLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-purple-600"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-base font-bold tracking-wide text-gray-900">Support</h3>

            <div className="mt-3 h-1 w-9 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" />

            <ul className="mt-6 space-y-4">
              {supportLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex w-fit items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-purple-600"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-base font-bold tracking-wide text-gray-900">Get in Touch</h3>

            <div className="mt-3 h-1 w-9 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" />

            <div className="mt-6 space-y-5">
              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-white text-[#750AE9] transition-all duration-300 hover:bg-[#750AE9] hover:text-white">
                  <MapPin size={18} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">Our Location</p>
                  <p className="mt-1 text-sm leading-6 text-gray-600">Bihar Sharif, Bihar, India</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-white text-[#750AE9] transition-all duration-300 hover:bg-[#750AE9] hover:text-white">
                  <Mail size={18} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">Email Address</p>
                  <Link
                    href="mailto:upskills854@gmail.com"
                    className="mt-1 block text-sm break-all text-gray-600 transition-colors hover:text-purple-600"
                  >
                    upskills854@gmail.com
                  </Link>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-white text-[#750AE9] transition-all duration-300 hover:bg-[#750AE9] hover:text-white">
                  <Phone size={18} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">Phone Number</p>
                  <Link
                    href="tel:+918340593996"
                    className="mt-1 block text-sm text-gray-600 transition-colors hover:text-purple-600"
                  >
                    +91 8340593996
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex items-center justify-center border-t border-gray-300 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} <span className="font-bold text-gray-900">UpSkills</span>.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
