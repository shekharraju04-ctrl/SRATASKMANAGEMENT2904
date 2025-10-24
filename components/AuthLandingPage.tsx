import React from 'react';

interface AuthLandingPageProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({ onOpenSignIn, onOpenSignUp }) => {
  return (
    <main className="flex flex-col items-center justify-center text-center p-8" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">
        Welcome to <span className="text-primary-600 dark:text-primary-400">📊 AcctFlow</span>
      </h1>
      <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300">
        The modern, AI-powered task management application designed for chartered accountants. Streamline your workflow, manage tasks efficiently, and leverage AI to break down complex jobs.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={onOpenSignUp}
          className="inline-block rounded-md bg-primary-600 px-12 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Get Started
        </button>
        <button
          onClick={onOpenSignIn}
          className="inline-block rounded-md bg-white dark:bg-gray-700 px-12 py-3 text-sm font-semibold text-primary-600 dark:text-primary-300 shadow-lg transition hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Sign In
        </button>
      </div>
    </main>
  );
};
