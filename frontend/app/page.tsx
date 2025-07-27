'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { RegisterSection } from '@/components/RegisterSection';
import { CreateProposalSection } from '@/components/CreateProposalSection';
import { CurrentProposal } from '@/components/CurrentProposal';
import { StatsSection } from '@/components/StatsSection';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold">
            <span className="text-gradient">Anonymous Property Voting</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Privacy-preserving community governance powered by Fully Homomorphic Encryption (FHE)
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </section>

        {isConnected ? (
          <>
            {/* Stats Section */}
            <StatsSection />

            {/* Registration Section */}
            <RegisterSection />

            {/* Create Proposal Section */}
            <CreateProposalSection />

            {/* Current Proposal */}
            <CurrentProposal />
          </>
        ) : (
          <div className="glass-panel p-12 text-center">
            <div className="space-y-4">
              <svg
                className="w-20 h-20 mx-auto text-accent/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="text-2xl font-semibold">Connect Your Wallet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Connect your MetaMask wallet to the Sepolia testnet to participate in anonymous property voting
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Anonymous Property Voting. Powered by fhEVM v0.6.0
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/ElsieNitzsche/AnonymousPropertyVoting"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://docs.zama.ai/fhevm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-accent transition-colors"
              >
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
