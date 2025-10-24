import React from 'react';
import type { TaskWithDetails, Priority } from '../types';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  results: TaskWithDetails[];
  isLoading: boolean;
  error: string | null;
  onTaskClick: (task: TaskWithDetails) => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const LoadingSpinner = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>;

const priorityStyles: Record<Priority, { bg: string; text: string; }> = {
  ['Low']: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
  ['Medium']: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-300' },
  ['High']: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-300' },
  ['Urgent']: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-300' },
};

const getDueDateStyle = (dueDate: string): { text: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dueDate.split('-').map(Number);
    const taskDueDate = new Date(year, month - 1, day);
    const timeDiff = taskDueDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff < 0) return { text: 'text-red-500' };
    if (dayDiff <= 2) return { text: 'text-yellow-500' };
    return { text: 'text-gray-600 dark:text-gray-300' };
};


export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ isOpen, onClose, query, results, isLoading, error, onTaskClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl transform transition-all max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Search Results for: <span className="text-primary-600 dark:text-primary-400">"{query}"</span>
            </h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
              <CloseIcon />
            </button>
          </div>

          <div className="mt-4 overflow-y-auto" style={{maxHeight: 'calc(80vh - 150px)'}}>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 dark:text-gray-300">Gemini is searching...</p>
              </div>
            )}
            {error && (
              <div className="text-danger-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-md text-center">
                <p className="font-semibold">Search Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {!isLoading && !error && (
              results.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map(task => (
                    <li key={task.id} onClick={() => onTaskClick(task)} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 truncate">{task.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{task.clientName} - {task.projectName}</p>
                        </div>
                        <div className="flex items-center space-x-4 ml-4">
                          <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${priorityStyles[task.priority].bg} ${priorityStyles[task.priority].text}`}>{task.priority}</div>
                          <div className={`flex items-center text-sm font-medium ${getDueDateStyle(task.dueDate).text}`}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <img src={task.assignee.avatarUrl} alt={task.assignee.name} className="w-6 h-6 rounded-full mr-2" />
                            <span className="hidden sm:inline">{task.assignee.name}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  No tasks found matching your search.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
