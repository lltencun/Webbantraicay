import { assets } from "../assets/assets"

const Footer = () => {
  return (
    <footer className="relative">
      {/* Main Footer */}
      <div className="relative overflow-hidden">
        {/* Background with diagonal cut */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#121926]"></div>
          <div
            className="absolute top-0 right-0 bottom-0 bg-[#00A67E]"
            style={{
              width: "30%",
              clipPath: "polygon(100% 0, 0 0, 100% 100%)",
              right: 0,
              top: 0,
              height: "100%",
            }}
          ></div>
        </div>

        {/* More compact footer structure */}
        <div className="container mx-auto relative z-10 py-8">
          <div className="flex flex-col sm:grid grid-cols-3 gap-6 px-5 sm:px-10 text-white">
            {/* Logo & Message - Keeping your original content */}
            <div>
              <img src={assets.logo || "/placeholder.svg"} className="w-12 mb-3 bg-[#121926] rounded-full p-1" alt="Logo" />
              <p className="leading-relaxed text-sm">
                Thank you for choosing our shop! Your support inspires us to provide the best products and services.
              </p>
            </div>

            {/* Navigation - Keeping your original content */}
            <div>
              <p className="text-base font-semibold mb-2">MY_STORE</p>
              <ul className="flex flex-col gap-1 text-sm">
                <li className="hover:text-gray-300 cursor-pointer">
                  <a href="/">Home</a>
                </li>
                <li className="hover:text-gray-300 cursor-pointer">
                  <a href="/store">Store</a>
                </li>
                <li className="hover:text-gray-300 cursor-pointer">
                  <a href="/about">About Us</a>
                </li>
                <li className="hover:text-gray-300 cursor-pointer">
                  <a href="/contact">Report a Problem</a>
                </li>
              </ul>
            </div>

            {/* Contact Info - Keeping your original content */}
            <div>
              <p className="text-base font-semibold mb-2">GET IN TOUCH</p>
              <ul className="flex flex-col gap-1 text-sm">
                <li>📞 0784 351 925</li>
                <li>✉️ DH52108695@student.stu.edu.vn</li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom - More compact */}
          <div className="mt-6 flex justify-between items-center text-white px-5 sm:px-10 text-sm">
            <div>© 2025 MY_STORE. All Rights Reserved.</div>
            <div className="flex space-x-3">
              <a href="#" className="bg-blue-600 p-1.5 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="bg-blue-400 p-1.5 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="bg-red-600 p-1.5 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
