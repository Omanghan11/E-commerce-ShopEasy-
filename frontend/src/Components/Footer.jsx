import React from 'react'

function Footer() {
  return (
    <div>
      {/* Main Footer Content */}
      <div className='bg-gray-800 p-6 lg:p-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Grid Layout - Responsive */}
          <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
            
            {/* Know Us Section */}
            <div className='space-y-3'>
              <h3 className='text-white font-bold text-lg mb-4'>Know Us</h3>
              <ul className='space-y-2'>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  About ShopEasy
                </li>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Careers at ShopEasy
                </li>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  ShopEasy Privacy Policy
                </li>
              </ul>
            </div>

            {/* Connect With Us Section */}
            <div className='space-y-3'>
              <h3 className='text-white font-bold text-lg mb-4'>Connect With Us</h3>
              <ul className='space-y-2'>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Facebook
                </li>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Twitter
                </li>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Instagram
                </li>
              </ul>
            </div>

            {/* Download App Section */}
            <div className='space-y-3'>
              <h3 className='text-white font-bold text-lg mb-4'>Download Our App</h3>
              <div className='space-y-2'>
                <p className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Available on Android
                </p>
                <p className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Available on iOS
                </p>
              </div>
            </div>

            {/* Help Section */}
            <div className='space-y-3'>
              <h3 className='text-white font-bold text-lg mb-4'>Help</h3>
              <ul className='space-y-2'>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Customer Service
                </li>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Returns & Refunds
                </li>
                <li className='text-gray-300 hover:text-white hover:bg-blue-600 px-2 py-1 rounded transition-all duration-200 cursor-pointer'>
                  Contact Us
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className='bg-gray-900 px-6 py-4 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <p className='text-white text-sm lg:text-base mb-2'>
            &copy; 2023 ShopEasy. All rights reserved.
          </p>
          <p className='text-gray-400 text-xs lg:text-sm'>
            <span className='hover:text-white cursor-pointer transition-colors duration-200'>Terms of Service</span>
            <span className='mx-2'>|</span>
            <span className='hover:text-white cursor-pointer transition-colors duration-200'>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Footer



