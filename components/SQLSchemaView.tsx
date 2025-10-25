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
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>);
const WarningIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>);

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
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Database Schema</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Copy and run this script in your Supabase project's SQL Editor to set up the required tables and policies.</p>
                </div>
                <button onClick={handleCopy} disabled={!sqlContent} className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 dark:focus:ring-offset-gray-800">
                    {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                    {isCopied ? 'Copied!' : 'Copy SQL'}
                </button>
            </div>
             <div className="mb-4 space-y-4 flex-shrink-0">
                <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/40 text-sm text-blue-800 dark:text-blue-200 flex flex-col space-y-3">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 pt-0.5">
                            <InfoIcon />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Deploying to Vercel &amp; Environment Variables</h3>
                            <p className="mt-1">To deploy this application, you must configure three environment variables in your Vercel project settings.</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold">1. Find Your Keys</h4>
                         <p className="mt-1">You need your Supabase Project URL & anon key, and your Google AI Studio API key.</p>
                        <p className="mt-1">
                            <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-100">
                                Find Supabase Keys &rarr;
                            </a>
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold">2. Set Environment Variables on Vercel</h4>
                        <p className="mt-1">In your Vercel dashboard, go to Project &gt; Settings &gt; Environment Variables and add the following:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 font-mono text-xs bg-blue-100 dark:bg-blue-900/50 p-3 rounded">
                            <li>SUPABASE_URL=&lt;Your-Supabase-Project-URL&gt;</li>
                            <li>SUPABASE_ANON_KEY=&lt;Your-Supabase-Anon-Key&gt;</li>
                            <li>API_KEY=&lt;Your-Google-AI-Studio-API-Key&gt;</li>
                        </ul>
                    </div>
                </div>
                 <div className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/40 text-sm text-yellow-800 dark:text-yellow-200 flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-0.5"> <WarningIcon /> </div>
                    <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Important Security Note</h4>
                        <p className="mt-1">This application uses the Gemini API key (<code>API_KEY</code>) directly on the client-side. For a production application, this is not secure. To protect your key, you should move API calls to serverless functions (like Vercel Functions) and keep the key on the server.</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-900 rounded-lg overflow-y-auto flex-grow min-h-0">
                {isLoading ? <div className="p-8 text-center text-gray-400">Loading schema...</div>
                 : error ? <div className="p-8 text-center text-red-400">{error}</div>
                 : <SyntaxHighlighter language="sql" style={tomorrow} customStyle={{ margin: 0 }}>{sqlContent}</SyntaxHighlighter>}
            </div>
        </div>
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
                        Schema &amp; Setup
                    </button>
                    <button type="button" onClick={() => setActiveTab('query')} className={`${ activeTab === 'query' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200' } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                        Query Runner
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
