import React from 'react';

const Footer = () => {
	return (
		<footer className="flex justify-between px-10 w-full mt-auto py-4 bg-background border-t border-outline-variant/15">
          <div className="font-label text-xs uppercase tracking-widest text-on-secondary-container opacity-70">
            /* © 2026 Code Trip - System Status: Optimal */
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Security', 'Terms'].map((link) => (
              <a
                key={link}
                className="font-label text-xs uppercase tracking-widest text-on-secondary-container opacity-70 hover:opacity-100 hover:underline"
                href="#"
              >
                {link}
              </a>
            ))}
          </div>
        </footer>
	);
};

export default Footer;