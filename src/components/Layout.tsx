import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/applications', label: 'Applications' },
    { path: '/permissions', label: 'Permissions' }
  ];

  const baseUrl = 'https://microsoft-info.merill.net';
  const canonicalUrl = `${baseUrl}${location.pathname}`;

  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-gray-900" aria-label="Microsoft Info Home">
                    Microsoft Info
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8" role="menubar">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      role="menuitem"
                      aria-current={location.pathname === item.path ? 'page' : undefined}
                      className={`${
                        location.pathname === item.path
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" role="main">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto" role="contentinfo">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              Data updated daily through automation. View the project on{' '}
              <a 
                href="https://github.com/merill/microsoft-info" 
                className="text-indigo-600 hover:text-indigo-500"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View project on GitHub (opens in new tab)"
              >
                GitHub
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}