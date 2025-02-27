import { TfiWorld } from 'react-icons/tfi';
import Link from 'next/link';
import SignIn from './SignIn';

export default function Header() {
    return (
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center space-x-2">
          <TfiWorld className="w-8 h-8 text-white" />
          <span className="text-white text-xl font-bold">AI Search</span>
        </Link>
        <nav className="flex space-x-10 text-sm font-semibold">
          <SignIn />
        </nav>
      </header>
    );
  }