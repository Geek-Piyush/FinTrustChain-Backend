import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, redirect to appropriate dashboard
    if (user) {
      if (user.currentRole === "LENDER") {
        navigate("/lender-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  // If logged in, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to dashboard...</div>
      </div>
    );
  }

  // Landing page for non-logged users
  return (
    <main className="main-content bg-white/6">
      {/* Hero */}
      <section className="pt-24">
        <div className="container-max mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mx-4 my-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                <span className="text-white">
                  Decentralized Microcredit Powered by Community{" "}
                </span>
                <br />
                <span className="neon-text-1">Trust.</span>
              </h1>

              <p className="text-gray-300 max-w-xl">
                Access loans without collateral using our Trust Index system.
                Build reputation, endorse others, and join a transparent,
                community-powered financial network.
              </p>

              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  to="/login"
                  className="inline-block btn-neon px-6 py-3 rounded-md font-semibold"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="inline-block px-6 py-3 rounded-md text-white border border-white/6"
                >
                  How it works
                </Link>
              </div>
            </div>

            <div className="w-full max-w-md rounded-xl p-2 m-auto">
              <img src="hero-i1.png" alt="FinTrustChain" />
            </div>
          </div>
        </div>
      </section>

      <section className="text-white py-12 relative overflow-hidden">
        {/* Background Split */}
        <span className="bg-primary-1 absolute inset-x-0 top-0 h-[50%] z-0"></span>
        <span className="bg-dark absolute inset-x-0 bottom-0 h-[50%] z-0"></span>

        {/* Content Layer */}
        <div className="relative z-10 container-max mx-auto px-4">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
            <span>How </span>
            <span className="neon-text font-bold">FinTrustChain</span>
            <span> Works?</span>
          </h2>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {/* 1 — What is TrustIndex */}
            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="image 1.png"
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
                <li>• Endorsers &amp; Guarantors share impact</li>
              </ul>
            </div>

            {/* 2 — Endorsement */}
            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="image 2.png"
                alt="Endorsement"
                className="w-14 h-14 mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-center">
                Endorsement
              </h3>

              <ul className="text-sm font-semibold space-y-1 text-left">
                <li>• Community trust votes.</li>
                <li>• Endorse up to 4 monthly.</li>
                <li>• Mutual TI gain/loss.</li>
                <li>• Repaying on time boosts endorsers' TI.</li>
              </ul>
            </div>

            {/* 3 — Guarantor’s Role */}
            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="image 3.png"
                alt="Guarantor Role"
                className="w-14 h-14 mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-center">
                Guarantor’s Role
              </h3>

              <ul className="text-sm font-semibold space-y-1 text-left">
                <li>• Backup for borrower.</li>
                <li>• Shares TI impact.</li>
                <li>
                  • Covers 50% of due amount if receiver defaults (after 28
                  days).
                </li>
              </ul>
            </div>

            {/* 4 — Barrier-Free Lending */}
            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img src="image 4.png" alt="Lending" className="w-14 h-14 mb-4" />
              <h3 className="font-bold text-lg mb-2 text-center">
                Barrier-Free Lending
              </h3>

              <ul className="text-sm font-semibold space-y-1 text-left">
                <li>• Lenders post brochures.</li>
                <li>• Receivers apply (up to 3).</li>
                <li>• FCFS pairing.</li>
                <li>• 3-way digital contract &amp; e-sign.</li>
                <li>• Automated repayment.</li>
              </ul>
            </div>

            {/* 5 — TI Effects Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 text-black flex flex-col items-center">
              <img
                src="image 5.png"
                alt="TI Effects"
                className="w-14 h-14 mb-4"
              />
              <h3 className="font-bold text-lg mb-2 text-center">
                TI Effects Summary
              </h3>

              <ul className="text-sm font-semibold space-y-1 text-left">
                <li>• Repay on time → TI↑ (for all).</li>
                <li>• Default → TI↓ (for all).</li>
                <li>• Endorse someone → Mutual TI connection.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="container-max mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center neon-text mb-6">
            What our users say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 rounded">
              <p className="text-gray-300">
                "FinTrustChain helped me access a small loan when banks said no.
                The endorsement system is solid."
              </p>
              <div className="mt-4 font-medium">— A. Kumar</div>
            </div>

            <div className="card p-6 rounded">
              <p className="text-gray-300">
                "As a lender, I can manage risk better using the Trust Index.
                Platform is lightweight and trustworthy."
              </p>
              <div className="mt-4 font-medium">— S. Mehta</div>
            </div>

            <div className="card p-6 rounded">
              <p className="text-gray-300">
                "Fast onboarding and the e-sign feature is very convenient.
                Support was responsive."
              </p>
              <div className="mt-4 font-medium">— R. Patel</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
