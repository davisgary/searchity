"use client";

import Link from "next/link";
import Header from "../components/ui/Header";
import { PiArrowLeftBold } from "react-icons/pi";

export default function TermsOfUsePage() {
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
        <h1 className="text-3xl font-medium my-10">Terms of Use</h1>
        <p className="text-primary/70 italic mb-8">Effective: April 17, 2025</p>
        <h2 className="text-2xl font-medium my-6">Welcome to Searchity!</h2>
        <p className="text-primary/70 mb-8">
          These Terms of Use ("Terms") apply to your use of Searchity and its associated services, including any related software applications and websites (collectively, the "Service"). These Terms form an agreement between you and Searchity ("Searchity," "we," "our," or "us"). By using our Service, you agree to these Terms.
        </p>
        <h2 className="text-xl font-semibold mb-2">1. What We Do</h2>
          <p className="mb-6">
            Searchity uses AI to summarize and organize web search results to help you find information faster.
            Our summaries are generated automatically and may not always be perfect or up to date.
          </p>
        <h2 className="text-xl font-semibold mb-2">2. No Guarantees</h2>
          <p className="mb-6">
            We do our best to provide helpful and accurate results, but we can’t guarantee the accuracy,
            completeness, or reliability of the information. You should always verify important details independently.
          </p>
        <h2 className="text-xl font-semibold mb-2">3. Use Responsibly</h2>
          <p className="mb-6">
            You agree to use Searchity for personal, lawful purposes only. Don’t use our service to break any laws,
            spread harmful content, or overload our systems.
          </p>
        <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
          <p className="mb-6">
            All content and technology on this site, including AI-generated summaries, are owned by or licensed to
            Searchity. Please don’t copy, distribute, or modify any part of the site without permission.
          </p>
        <h2 className="text-xl font-semibold mb-2">5. Saved Searches and Liability</h2>
          <p className="mb-6">
            While we provide the option to save searches and related data, you understand that you are solely responsible for any information you choose to store in your Searchity account. We do not accept responsibility for any errors, omissions, or security breaches related to saved searches. You agree to hold Searchity harmless from any liability resulting from the use or storage of your search history.
          </p>
        <h2 className="text-xl font-semibold mb-2">6. Third-Party Links</h2>
          <p className="mb-6">
            Searchity may include links to other websites. We’re not responsible for the content or privacy
            practices of those sites.
          </p>
        <h2 className="text-xl font-semibold mb-2">7. Changes</h2>
          <p className="mb-6">
            We may update these terms from time to time. If we do, we’ll update the date at the top. Continued
            use of the site means you accept the changes.
          </p>
      </div>
      <footer className="w-full max-w-4xl mx-auto border-l border-r border-primary/10 py-4 text-xs font-medium">
        Searchity © 2025
      </footer>
    </div>
  );
}