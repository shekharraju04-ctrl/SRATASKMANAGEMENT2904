import React, { useState, useEffect, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);


export const SQLSchemaView: React.FC = () => {
    const [sqlContent, setSqlContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        fetch('/supabase_schema.sql')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(text => {
                setSqlContent(text);
                setIsLoading(false);
            })
            .catch(err => {
                setError('Failed to load SQL schema file. Make sure it exists in the public directory.');
                setIsLoading(false);
                console.error(err);
            });
    }, []);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(sqlContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [sqlContent]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Supabase Database Schema</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Copy and run this SQL script in your Supabase project's SQL Editor to set up the required tables and policies.
                    </p>
                </div>
                <button
                    onClick={handleCopy}
                    disabled={!sqlContent}
                    className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 dark:focus:ring-offset-gray-800"
                >
                    {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                    {isCopied ? 'Copied!' : 'Copy SQL'}
                </button>
            </div>
            <div className="bg-gray-900 rounded-lg overflow-hidden max-h-[65vh] overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">Loading schema...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-400">{error}</div>
                ) : (
                    <SyntaxHighlighter language="sql" style={tomorrow} customStyle={{ margin: 0 }}>
                        {sqlContent}
                    </SyntaxHighlighter>
                )}
            </div>
        </div>
    );
};
