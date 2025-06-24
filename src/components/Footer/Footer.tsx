import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/src/assets/images/footer.jpg")',
          filter: 'brightness(0.25)'
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Us Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-poppins">About Us</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              RR Group is a leading provider of innovative IT infrastructure solutions. 
              We specialize in cloud services, system monitoring, and enterprise-level support 
              for businesses worldwide.
            </p>
            <div className="flex space-x-4 pt-4">
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Careers Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-poppins">Careers</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Current Openings
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Benefits & Culture
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Learning & Development
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Why Join Us
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-poppins">Customer Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Help Center
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Submit a Ticket
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Knowledge Base
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                System Status
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-poppins">Contact Us</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <MapPin size={18} className="text-blue-400" />
                <span>123 Tech Street, Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-400" />
                <span>support@rrgroup.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 RR Group. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 