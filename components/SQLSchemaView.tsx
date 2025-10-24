import React, { useState, useEffect, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatSQLQuery } from '../services/geminiService';
import { runRawQuery } from '../services/api';

const ClipboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>);
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347c.75.411.75 1.559 0 1.97l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" /></svg>);
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>);
const LoadingSpinner = () => (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>);

const SchemaViewer: React.FC = () => {
    const [sqlContent, setSqlContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        fetch('/supabase_schema.sql')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(text => {
                setSqlContent(text);
                setIsLoading(false);
            })
            .catch(err => {
                setError('Failed to load SQL schema file. Make sure `public/supabase_schema.sql` exists.');
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
        <>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Database Schema</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Copy and run this script in your Supabase project's SQL Editor to set up the required tables and policies.</p>
                </div>
                <button onClick={handleCopy} disabled={!sqlContent} className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 dark:focus:ring-offset-gray-800">
                    {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                    {isCopied ? 'Copied!' : 'Copy SQL'}
                </button>
            </div>
            <div className="bg-gray-900 rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                {isLoading ? <div className="p-8 text-center text-gray-400">Loading schema...</div>
                 : error ? <div className="p-8 text-center text-red-400">{error}</div>
                 : <SyntaxHighlighter language="sql" style={tomorrow} customStyle={{ margin: 0 }}>{sqlContent}</SyntaxHighlighter>}
            </div>
        </>
    );
};

const QueryRunner: React.FC = () => {
    const [query, setQuery] = useState('SELECT * FROM tasks LIMIT 10;');
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    
    const headers = results && results.length > 0 ? Object.keys(results[0]) : [];

    const handleRunQuery = async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        const { data, error: queryError } = await runRawQuery(query);
        if (queryError) {
            setError(queryError.message || 'An unknown error occurred.');
        } else {
            setResults(data);
        }
        setIsLoading(false);
    };

    const handleFormatQuery = async () => {
        setIsFormatting(true);
        try {
            const formattedSql = await formatSQLQuery(query);
            setQuery(formattedSql);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsFormatting(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">SQL Query Runner</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Execute queries directly against your database.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleFormatQuery} disabled={isFormatting || !query} className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary-700 dark:text-primary-300 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/50 dark:hover:bg-primary-800/50 rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50">
                        {isFormatting ? <LoadingSpinner/> : <SparklesIcon />}
                        Format Query
                    </button>
                    <button onClick={handleRunQuery} disabled={isLoading || !query} className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200 disabled:bg-gray-400">
                        {isLoading ? <LoadingSpinner/> : <PlayIcon />}
                        Run Query
                    </button>
                </div>
            </div>

            <div className="bg-red-100 dark:bg-red-900/40 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-md relative mb-4" role="alert">
                <strong className="font-bold">Warning!</strong>
                <span className="block sm:inline ml-2">Queries are run with your user permissions. Destructive queries (DELETE, UPDATE, DROP) will affect your live data.</span>
            </div>

            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="-- Enter your SQL query here"
                className="w-full h-40 p-2 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />

            <div className="mt-4 flex-grow overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {isLoading && <div className="p-8 text-center text-gray-500">Running query...</div>}
                {error && <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/30 rounded-md"><pre className="whitespace-pre-wrap">{error}</pre></div>}
                {results && (
                    results.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>{headers.map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>)}</tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {results.map((row, i) => (
                                    <tr key={i}>{headers.map(h => <td key={h} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"><pre className="whitespace-pre-wrap font-sans">{JSON.stringify(row[h], null, 2)}</pre></td>)}</tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <div className="p-8 text-center text-gray-500">Query executed successfully, but returned no rows.</div>
                )}
            </div>
        </div>
    );
};


export const SQLSchemaView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'schema' | 'query'>('schema');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-8 h-[calc(100vh-10rem)] flex flex-col">
             <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button type="button" onClick={() => setActiveTab('schema')} className={`${ activeTab === 'schema' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                        Schema
                    </button>
                    <button type="button" onClick={() => setActiveTab('query')} className={`${ activeTab === 'query' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                        Query
                    </button>
                </nav>
            </div>
            <div className="flex-grow min-h-0">
                {activeTab === 'schema' && <SchemaViewer />}
                {activeTab === 'query' && <QueryRunner />}
            </div>
        </div>
    );
};
