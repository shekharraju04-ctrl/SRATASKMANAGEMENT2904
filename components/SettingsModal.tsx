import React, { useState } from 'react';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (longPendingDays: number) => void;
  currentLongPendingDays: number;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave, currentLongPendingDays }) => {
  const [days, setDays] = useState(currentLongPendingDays.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numDays = parseInt(days, 10);
    if (!isNaN(numDays) && numDays >= 0) {
      onSave(numDays);
    } else {
      onSave(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Settings
              </h3>
              <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                <CloseIcon />
              </button>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="long-pending-days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">"Long Pending" Threshold (Days)</label>
                <input 
                    type="number" 
                    id="long-pending-days" 
                    value={days} 
                    onChange={e => setDays(e.target.value)} 
                    required 
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" 
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Tasks in 'Pending Client' status that are overdue by more than this number of days will be flagged. Set to 0 to disable.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700">
                Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
