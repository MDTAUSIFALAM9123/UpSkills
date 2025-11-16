export default function Footer() {
  return (
    <footer className=" bg-gray-100 px-20 py-10 items-center">
      <div className="flex justify-center min-h-xl">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
          <div>
            <h1 className="text-xl font-bold text-purple-700">UpSkills</h1>
            <p className="mt-4 text-gray-600">
              Geek is feature-rich components and beautifully Bootstrap UIKit for developers, built
              with bootstrap responsive framework.
            </p>
            <div className="flex pt-10 gap-4">
              <a href="https://www.facebook.com" target="_blank">
                <img
                  src="https://img.icons8.com/?size=100&id=118467&format=png&color=7950F2"
                  alt="facebook-logo"
                  className="w-[25px]"
                />
              </a>
              <a href="https://www.twitter.com" target="_blank">
                <img
                  src="https://img.icons8.com/?size=100&id=8824&format=png&color=7950F2"
                  alt="twitter-logo"
                  className="w-[25px]"
                />
              </a>
              <a href="https://www.github.com" target="_blank">
                <img
                  src="https://img.icons8.com/?size=100&id=3tC9EQumUAuq&format=png&color=7950F2"
                  alt="github-logo"
                  className="w-[25px]"
                />
              </a>
            </div>
          </div>

          <div>
            <div>
              <h3 className="text-1g font-semibold text-gray-800">Company</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="">Pricing</a>
                </li>
                <li>
                  <a href="">Blog</a>
                </li>
                <li>
                  <a href="">Careers</a>
                </li>
                <li>
                  <a href="">Contract</a>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-1g font-semibold text-gray-800">Support</h3>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>
                <a href="#">Help and Support</a>
              </li>
              <li>
                <a href="">Become instructor</a>
              </li>
              <li>
                <a href="">Get the app</a>
              </li>
              <li>
                <a href="">FAQ'S</a>
              </li>
              <li>
                <a href="">Tutorial</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-1g font-semibold text-gray-800">Get in Touch</h3>
            <p className="mt-4 text-gray-600"> 339 McDermott Points Hettingerhaven, NV 15283</p>
            <p className="mt-2 text-gray-600">
              Emai: <a href="mailto:upskill854@gmail.com"> upskill854@gmail.com</a>
            </p>
            <p className="mt-2 text-gray-600">
              Phone: <strong>(000) 123 456 789</strong>
            </p>
            <div className="flex mt-4 space-x-2">
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

      <div className="border-t mt-10 pt-5 text-center text-sm text-gray-500">
        <p>&copy;; 2025 UpSkills-UI</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#">Privacy Policy</a>
          <a href="#"> Cookie Notice</a>
          <a href="#"> Do Not Sell My Personal Information</a>
          <a href="#"> Terms Of Use</a>
        </div>
      </div>
    </footer>
  );
}
