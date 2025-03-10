import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardIcon from '../../public/icons/dashboard.svg';
import ChatIcon from '../../public/icons/bot.svg';
import HistoryIcon from '../../public/icons/doc.svg';

const Sidebar = ({ isSidebarOpen }) => {
  const router = useRouter();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: DashboardIcon,
      href: '/',
    },
    {
      name: 'Chat',
      icon: ChatIcon,
      href: '/chat',
    },
    {
      name: 'Conversations',
      icon: HistoryIcon,
      href: '/conversations',
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <Link href="/">
          <div className="flex items-center pl-2.5 mb-5">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              EmbedChain
            </span>
          </div>
        </Link>
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <div
                  className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                    router.pathname === item.href
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span className="ml-3">{item.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar; 