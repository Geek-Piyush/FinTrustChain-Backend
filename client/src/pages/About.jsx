import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="main-content bg-white/6 py-12">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container-max mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About <span className="neon-text">FinTrustChain</span>
            </h1>
            <p className="text-lg text-gray-300">
              FinTrustChain is a decentralized-inspired trust scoring and loan
              matchmaking platform that helps lenders and receivers connect
              directly. We combine signature verification, trust indexes and
              community endorsements to minimize friction and fraud in
              small-value lending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold neon-text mb-4">
                Our Mission
              </h2>
              <p className="text-gray-300">
                To make credit accessible by building transparent trust signals
                and simple tools for lenders and borrowers. We believe in
                empowering communities through peer-to-peer lending backed by
                reputation and mutual trust.
              </p>
            </div>

            <div className="card p-6 rounded-lg">
              <h2 className="text-2xl font-semibold neon-text mb-4">
                How it Works
              </h2>
              <ol className="list-decimal ml-6 text-gray-300 space-y-2">
                <li>Sign up and verify your e-signature image</li>
                <li>Build trust through endorsements and on-time repayments</li>
                <li>Browse or create loan brochures</li>
                <li>Apply with guarantors and settle via the platform</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* How FinTrustChain Works Section */}
      <section className="text-white py-12 relative overflow-hidden">
        <span className="bg-primary-1 absolute inset-x-0 top-0 h-[50%] z-0"></span>
        <span className="bg-dark absolute inset-x-0 bottom-0 h-[50%] z-0"></span>

        <div className="relative z-10 container-max mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
            <span>How </span>
            <span className="neon-text font-bold">FinTrustChain</span>
            <span> Works?</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="/image 1.png"
                alt="TrustIndex"
                className="w-14 h-14 mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-center">
                What is TrustIndex?
              </h3>
              <p className="text-sm font-medium leading-relaxed text-center">
                The TrustIndex (TI) is a score from 0–950 that measures your
                financial reliability on FinTrustChain.
              </p>
              <ul className="mt-4 text-sm font-semibold space-y-1 text-left">
                <li>• Repayment → TI Gain</li>
                <li>• Default → TI Loss</li>
                <li>• Endorsers & Guarantors share impact</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="/image 2.png"
                alt="Endorsement"
                className="w-14 h-14 mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-center">
                Endorsement
              </h3>
              <ul className="text-sm font-semibold space-y-1 text-left">
                <li>• Community trust votes</li>
                <li>• Endorse up to 4 monthly</li>
                <li>• Mutual TI gain/loss</li>
                <li>• Repaying on time boosts endorsers' TI</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="/image 3.png"
                alt="Guarantor Role"
                className="w-14 h-14 mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-center">
                Guarantor's Role
              </h3>
              <ul className="text-sm font-semibold space-y-1 text-left">
                <li>• Backup for borrower</li>
                <li>• Shares TI impact</li>
                <li>
                  • Covers 50% of due amount if receiver defaults (after 28
                  days)
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="/image 4.png"
                alt="Lending"
                className="w-14 h-14 mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-center">
                Barrier-Free Lending
              </h3>
              <ul className="text-sm font-semibold space-y-1 text-left">
                <li>• Lenders post brochures</li>
                <li>• Receivers apply (up to 3)</li>
                <li>• FCFS pairing</li>
                <li>• 3-way digital contract & e-sign</li>
                <li>• Automated repayment</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="/image 5.png"
                alt="TI Effects"
                className="w-14 h-14 mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-center">
                TI Effects Summary
              </h3>
              <ul className="text-sm font-semibold space-y-1 text-left">
                <li>• Repay on time → TI↑ (for all)</li>
                <li>• Default → TI↓ (for all)</li>
                <li>• Endorse someone → Mutual TI connection</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="container-max mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center neon-text mb-6">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 rounded">
              <p className="text-gray-300">
                "FinTrustChain helped me access a small loan when banks said no.
                The endorsement system is solid."
              </p>
              <div className="mt-4 font-medium text-white">— A. Kumar</div>
            </div>
            <div className="card p-6 rounded">
              <p className="text-gray-300">
                "As a lender, I can manage risk better using the Trust Index.
                Platform is lightweight and trustworthy."
              </p>
              <div className="mt-4 font-medium text-white">— S. Mehta</div>
            </div>
            <div className="card p-6 rounded">
              <p className="text-gray-300">
                "Fast onboarding and the e-sign feature is very convenient.
                Support was responsive."
              </p>
              <div className="mt-4 font-medium text-white">— R. Patel</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container-max mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-6">
            Join our community and experience trust-based lending
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="btn-neon px-6 py-3 rounded-md font-semibold"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-md text-white border border-white/6 hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
