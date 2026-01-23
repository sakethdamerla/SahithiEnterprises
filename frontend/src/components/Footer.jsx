import { Link } from 'react-router-dom';

/**
 * Footer component with company info and links
 * Displays at the bottom of every page
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Sahithi Enterprises</h3>
            {/* <p className="text-sm">
              Your trusted partner for quality products and exceptional service. We provide top-notch electronics, tyres, and power solutions.
            </p> */}
          </div>

          {/* Available Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Available Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/category/electronics" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="text-primary-500">›</span> Electronics Sales & Service
                </Link>
              </li>
              <li>
                <Link to="/category/tyres" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="text-primary-500">›</span> Tyre Sales & Fittings
                </Link>
              </li>
              <li>
                <Link to="/category/power" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="text-primary-500">›</span> Inverters & Battery Support
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="text-primary-500">›</span> Car Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              {/* <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>contact@sahithienterprises.com</span>
              </li> */}
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>+91 6301776156</span>
              </li>
              {/* <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>123 Main Road, Benz Circle, Vijayawada, Andhra Pradesh - 520010</span>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            &copy; {currentYear} EnterpriseShop. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-gray-400">
            Designed & Developed by <span className="text-white font-medium">Saketh Damerla</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
