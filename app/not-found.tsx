import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col text-center">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow py-44 px-2 lg:px-0">
        <h1 className="text-primary/50 font-bold">Oops!</h1>
        <h2 className="p-6 font-extrabold tracking-tight text-5xl">404 - Page Not Found</h2>
        <p className="pb-6">It looks like you've stumbled upon a page that doesn't exist.</p>
        <Link href="/" className="font-medium leading-normal rounded-2xl border-2 border-primary px-4 py-2 active:bg-transparent transition-all duration-300 hover:scale-105">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}