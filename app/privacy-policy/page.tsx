"use client";

import Link from "next/link";
import Header from "../components/ui/Header";
import { PiArrowLeftBold } from "react-icons/pi";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col text-center bg-main px-2 lg:px-0">
      <Header sessions={[]} setSessions={() => {}} showAuth={false} />
      <div className="flex-grow max-w-4xl mx-auto border-l border-r border-b border-primary/10 p-8 text-left leading-loose">
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-full text-primary/70 hover:bg-muted hover:text-primary transition-all duration-300"
          aria-label="Home"
        >
          <PiArrowLeftBold size={30} />
        </Link>
        <h1 className="text-3xl font-medium my-10">Privacy Policy</h1>
        <p className="text-primary/70 italic mb-8">Effective: April 17, 2025</p>
        <h2 className="text-2xl font-medium my-6">Welcome to Searchity!</h2>
        <p className="text-primary/70 mb-8">
          This Privacy Policy explains how Searchity ("Searchity," "we," "our," or "us") collects, uses, and protects
          your personal information when you use our services, including our website and associated software applications (collectively, the "Service").
        </p>
        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <p className="mb-2">
          We may collect information from you when you use our Service. This includes:
        </p>
        <ul className="list-disc list-inside ml-6 mb-6">
          <li>Personal information you provide when registering or contacting us (e.g., email address).</li>
          <li>Search queries and data associated with your use of the service.</li>
          <li>Technical information about your device, browser, and usage of the Service.</li>
        </ul>
        <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
        <p className="mb-2">
          The information we collect is used for the following purposes:
        </p>
        <ul className="list-disc list-inside ml-6 mb-6">
          <li>To provide and improve the functionality of our Service.</li>
          <li>To personalize your experience and enhance the effectiveness of our search results.</li>
          <li>To communicate with you regarding service updates, support, and promotional materials (if opted-in).</li>
        </ul>
        <h2 className="text-xl font-semibold mb-2">3. Data Retention</h2>
        <p className="mb-6">
          We retain your personal information and search history for as long as necessary to provide the Service. You can request to delete your stored data at any time by contacting us directly. However, some data may be retained for legal or administrative reasons.
        </p>
        <h2 className="text-xl font-semibold mb-2">4. How We Protect Your Information</h2>
        <p className="mb-6">
          We implement reasonable security measures to protect your personal information from unauthorized access, alteration, or destruction. However, no method of data transmission over the internet is completely secure, and we cannot guarantee the absolute security of your information.
        </p>
        <h2 className="text-xl font-semibold mb-2">5. Sharing Your Information</h2>
        <p className="mb-2">
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
        </p>
        <ul className="list-disc list-inside ml-6 mb-6">
          <li>To trusted service providers who help us operate the Service.</li>
          <li>To comply with legal obligations or protect our rights.</li>
        </ul>
        <h2 className="text-xl font-semibold mb-2">6. Third-Party Links</h2>
        <p className="mb-6">
          Our Service may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review the privacy policies of any third-party sites before providing any personal information.
        </p>
        <h2 className="text-xl font-semibold mb-2">7. Changes to This Privacy Policy</h2>
        <p className="mb-6">
          We may update this Privacy Policy from time to time. If we do, we will update the effective date at the top of this page. Continued use of the Service after such changes indicates your acceptance of the updated policy.
        </p>
      </div>
      <footer className="w-full max-w-4xl mx-auto border-l border-r border-primary/10 py-4 text-xs font-medium">
        Searchity © 2025
      </footer>
    </div>
  );
}