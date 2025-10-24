import React, { useState, useCallback, useEffect } from 'react';
import type { Task, Subtask } from '../types';
import { generateSubtasks, generateTaskTitle } from '../services/geminiService';

interface AIAssistantModalProps {
  task: Task;
  onClose: () => void;
  onApplyAIChanges: (taskId: string, changes: { title?: string; subtasks?: Omit<Subtask, 'id' | 'completed'>[] }) => void;
}

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ task, onClose, onApplyAIChanges }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [suggestedTitle, setSuggestedTitle] = useState<string>('');
  const [useSuggestedTitle, setUseSuggestedTitle] = useState(false);
  
  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch title and subtasks in parallel
      const [generatedSubtasks, generatedTitle] = await Promise.all([
        generateSubtasks(task.title, task.description),
        task.description ? generateTaskTitle(task.description) : Promise.resolve('')
      ]);

      setSubtasks(generatedSubtasks);
      
      if (generatedTitle) {
        setSuggestedTitle(generatedTitle);
        // Automatically check the box if the title is different
        if (generatedTitle.trim().toLowerCase() !== task.title.trim().toLowerCase()) {
          setUseSuggestedTitle(true);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to generate suggestions. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [task.title, task.description]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleApplyClick = useCallback(() => {
    const changes: { title?: string; subtasks?: Omit<Subtask, 'id' | 'completed'>[] } = {};
    if (useSuggestedTitle && suggestedTitle) {
      changes.title = suggestedTitle;
    }
    if (subtasks.length > 0) {
      changes.subtasks = subtasks.map(text => ({ text }));
    }
    onApplyAIChanges(task.id, changes);
  }, [subtasks, suggestedTitle, useSuggestedTitle, task.id, onApplyAIChanges]);

  const hasSuggestions = suggestedTitle || subtasks.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all" role="dialog" aria-modal="true">
        <div className="p-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <span className="text-2xl mr-3">✨</span> AI Assistant
            </h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
              <CloseIcon />
            </button>
          </div>
          
          <div className="mt-4 h-[22rem] flex flex-col">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 dark:text-gray-300">Gemini is thinking...</p>
                <p className="text-sm text-gray-400">This might take a moment.</p>
              </div>
            )}
            {error && <div className="text-danger-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</div>}
            
            {!isLoading && !error && (
              <div className="overflow-y-auto pr-2 flex-grow">
                {suggestedTitle && (
                    <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Suggested Title</p>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                           <label className="flex items-start">
                                <input 
                                    type="checkbox" 
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1" 
                                    checked={useSuggestedTitle}
                                    onChange={() => setUseSuggestedTitle(prev => !prev)}
                                />
                                <div className="ml-3">
                                    <span className="text-gray-800 dark:text-gray-200 font-semibold">{suggestedTitle}</span>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 line-through mt-1">Original: {task.title}</span>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {subtasks.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Suggested Sub-tasks</p>
                    <ul className="space-y-3">
                      {subtasks.map((text, index) => (
                        <li key={index} className="flex items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                          <span className="text-primary-500 mr-3 font-bold">•</span>
                          <span className="text-gray-800 dark:text-gray-200">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {!hasSuggestions && (
                     <div className="flex items-center justify-center h-full text-gray-500">No suggestions were generated.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyClick}
            disabled={isLoading || error !== null || !hasSuggestions}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};