
import React, { useState } from 'react';
import type { Client, Project, User } from '../types';

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    onOpenCreateModal: () => void;
    // FIX: Updated mainView and setMainView prop types for better type safety and to match App state.
    mainView: 'kanban' | 'gantt' | 'sql';
    setMainView: (mode: 'kanban' | 'gantt' | 'sql') => void;
    viewMode: 'client' | 'project';
    // FIX: Corrected a typo in the type definition (a misplaced single quote).
    setViewMode: (mode: 'client' | 'project') => void;
    selectedFilterId: string;
    setSelectedFilterId: (id: string) => void;
    clients: Client[];
    projects: Project[];
    currentUser: User | null;
    onOpenSignIn: () => void;
    onOpenSignUp: () => void;
    onSignOut: () => void;
    onOpenSettings: () => void;
    onSearch: (query: string) => void;
}

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.554-.221a6.75 6.75 0 0 1 3.664 0l.554.221c.55.219 1.02.684 1.11 1.226l.09.542a6.75 6.75 0 0 1 0 3.664l-.09.542c-.09.542-.56 1.007-1.11 1.226l-.554.221a6.75 6.75 0 0 1-3.664 0l-.554-.221c-.55-.219-1.02-.684-1.11-1.226l-.09-.542a6.75 6.75 0 0 1 0-3.664Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

const AiSearchBar: React.FC<{onSearch: (query: string) => void;}> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    }

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">✨</span>
            </div>
            <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Smart Search: "urgent tax tasks for Sarah Chen"'
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
        </form>
    )
}


export const Header: React.FC<HeaderProps> = ({ 
    isDarkMode, setIsDarkMode, onOpenCreateModal,
    mainView, setMainView,
    viewMode, setViewMode, selectedFilterId, setSelectedFilterId,
    clients, projects, currentUser, onOpenSignIn, onOpenSignUp, onSignOut,
    onOpenSettings, onSearch
}) => {
    
    const filterOptions = viewMode === 'client' ? clients : projects;

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20 transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">📊 AcctFlow</span>
                    </div>
                    
                    {currentUser && (
                      <div className="flex-1 flex items-center justify-center gap-x-8 px-8">
                          <AiSearchBar onSearch={onSearch} />
                          <div className="flex items-center space-x-4">
                              <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex items-center">
                                  <button onClick={() => setMainView('kanban')} className={`px-3 py-1 text-sm font-semibold rounded-md ${mainView === 'kanban' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Board</button>
                                  <button onClick={() => setMainView('gantt')} className={`px-3 py-1 text-sm font-semibold rounded-md ${mainView === 'gantt' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Gantt</button>
                                  <button onClick={() => setMainView('sql')} className={`px-3 py-1 text-sm font-semibold rounded-md ${mainView === 'sql' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow' : 'text-gray-600 dark:text-gray-300'}`}>SQL Tools</button>
                              </div>
                              {mainView !== 'sql' && (
                                <>
                                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex items-center">
                                        <button onClick={() => setViewMode('client')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'client' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Client</button>
                                        <button onClick={() => setViewMode('project')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'project' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Project</button>
                                    </div>
                                    <select 
                                        value={selectedFilterId}
                                        onChange={(e) => setSelectedFilterId(e.target.value)}
                                        className="w-56 block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        {filterOptions.map(option => (
                                            <option key={option.id} value={option.id}>{option.name}</option>
                                        ))}
                                    </select>
                                </>
                              )}
                          </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                        {currentUser ? (
                            <>
                                <button
                                    onClick={onOpenCreateModal}
                                    className="hidden sm:flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                                >
                                    <PlusIcon />
                                    New Task
                                </button>
                                <button
                                    onClick={onOpenSettings}
                                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                                    aria-label="Open settings"
                                >
                                    <CogIcon />
                                </button>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                                    aria-label="Toggle dark mode"
                                >
                                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                                </button>
                                <div className="flex items-center space-x-3">
                                    <span className='hidden sm:inline font-medium text-gray-700 dark:text-gray-300 truncate max-w-28' title={currentUser.email}>{currentUser.email}</span>
                                    <button
                                        onClick={onSignOut}
                                        className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    aria-label="Toggle dark mode"
                                >
                                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                                </button>
                                <button
                                    onClick={() => setMainView('sql')}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                >
                                    Database Setup
                                </button>
                                <button
                                    onClick={onOpenSignIn}
                                    className="px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-300"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={onOpenSignUp}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};