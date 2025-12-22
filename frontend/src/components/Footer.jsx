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
            <h3 className="text-white text-lg font-bold mb-4">EnterpriseShop</h3>
            <p className="text-sm">
              Your trusted partner for quality products and exceptional service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/category/electronics" className="hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/category/tyres" className="hover:text-white transition-colors">
                  Tyres
                </Link>
              </li>
              <li>
                <Link to="/category/power" className="hover:text-white transition-colors">
                  Inverters & Batteries
                </Link>
              </li>
            </ul>
          </div>

    

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: </li>
              <li>Phone:</li>
              <li>Address: </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
          <p>
            &copy; {currentYear} EnterpriseShop. All rights reserved. Built with React & Vite.
          </p>
        </div>
      </div>
    </footer>
  );
}
