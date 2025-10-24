import React, { useState, useMemo } from 'react';
import type { Task, TaskWithDetails } from '../types';
import { Priority, Status } from '../types';

interface TaskCardProps {
  task: TaskWithDetails;
  onOpenAIAssistant: (task: TaskWithDetails) => void;
  onOpenEditModal: (task: TaskWithDetails) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  allTasks: Task[];
}

const priorityStyles: Record<Priority, { bg: string; text: string; border: string }> = {
  [Priority.Low]: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-400' },
  [Priority.Medium]: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-500' },
  [Priority.High]: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-300', border: 'border-yellow-500' },
  [Priority.Urgent]: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-300', border: 'border-red-500' },
};

const getDueDateStyle = (dueDate: string): { text: string; bg: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to the start of the day

    const [year, month, day] = dueDate.split('-').map(Number);
    // Note: JS Date month is 0-indexed (0 for Jan, 11 for Dec)
    const taskDueDate = new Date(year, month - 1, day);

    const timeDiff = taskDueDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff < 0) {
        // Overdue: The due date is in the past.
        return { text: 'text-red-600 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/50' }; 
    }
    if (dayDiff <= 2) {
        // Due soon: The task is due today, tomorrow, or the day after.
        return { text: 'text-yellow-600 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/50' };
    }
    // Upcoming: The due date is more than 2 days away.
    return { text: 'text-gray-600 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-700' };
};


const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h18" />
    </svg>
);

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

const LockClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 transition-transform duration-200">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.404 1.223-.629 1.942-.629.659 0 1.326.216 1.872.629m-2.133 9.397L10.5 15.15m0 0c-1.105-.82-1.105-2.16 0-2.986m1.123 2.986L13.5 15.15" />
    </svg>
);


const SubtaskProgressBar: React.FC<{ task: Task }> = ({ task }) => {
    if (task.subtasks.length === 0) return null;

    const completedCount = task.subtasks.filter(st => st.completed).length;
    const totalCount = task.subtasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="mt-3">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Sub-tasks</span>
                <span>{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onOpenAIAssistant, onOpenEditModal, onToggleSubtask, allTasks }) => {
  const { bg, text, border } = priorityStyles[task.priority];
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [showAllSubtasks, setShowAllSubtasks] = useState(false);
  const [isFinancialsVisible, setIsFinancialsVisible] = useState(false);
  
  const dueDateStyle = getDueDateStyle(task.dueDate);

  const dependency = useMemo(() => {
    if (!task.dependsOn) return null;
    const prerequisiteTask = allTasks.find(t => t.id === task.dependsOn);
    if (!prerequisiteTask) return null;
    return {
        isComplete: prerequisiteTask.status === Status.Done,
        title: prerequisiteTask.title,
    };
  }, [task.dependsOn, allTasks]);

  const isBlocked = !!dependency && !dependency.isComplete;

  const handleCardClick = () => {
    if (isBlocked) return;
    onOpenEditModal(task);
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDescriptionVisible(prev => !prev);
  };
  
  const toggleShowAllSubtasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAllSubtasks(prev => !prev);
  };
  
  const toggleFinancials = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFinancialsVisible(prev => !prev);
  };

  const descriptionSnippet = task.description.length > 100 
    ? `${task.description.substring(0, 100)}...`
    : task.description;
    
  const subtasksToShow = showAllSubtasks ? task.subtasks : task.subtasks.slice(0, 3);
  
  const formatCurrency = (amount?: number) => amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '$0.00';

  return (
    <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-4 border-l-4 ${border} ${isBlocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleCardClick}
    >
        <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>{task.engagementType}</span>
            <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${bg} ${text}`}>{task.priority}</div>
        </div>
      
        <h3 className="font-bold text-md mt-2 text-gray-900 dark:text-gray-100">{task.title}</h3>

        {task.description && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <p className="whitespace-pre-wrap">
                    {isDescriptionVisible ? task.description : descriptionSnippet}
                </p>
                {task.description.length > 100 && (
                    <button 
                        onClick={toggleDescription} 
                        className="text-primary-600 dark:text-primary-400 hover:underline text-xs font-semibold mt-1 focus:outline-none"
                    >
                        {isDescriptionVisible ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{task.clientName}</p>

        {dependency && (
             <div className="mt-3 p-2 rounded-md bg-gray-100 dark:bg-gray-700/50 text-xs flex items-center text-gray-600 dark:text-gray-300">
                {isBlocked ? <LockClosedIcon /> : <LinkIcon />}
                <span className="ml-1.5 font-semibold">{isBlocked ? 'Blocked by:' : 'Depends on:'}</span>
                <span className="ml-1 truncate flex-1 text-right">{dependency.title}</span>
            </div>
        )}
        
        {task.financials && (
            <div className="mt-3 text-xs" onClick={toggleFinancials}>
                <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 flex justify-between items-center font-semibold">
                    <div className="flex items-center">
                        <DollarIcon />
                        <span>Fee: {formatCurrency(task.financials.amountReceived)} / {formatCurrency(task.financials.totalFee)}</span>
                    </div>
                    <div className={`flex items-center transition-transform duration-200 ${isFinancialsVisible ? 'rotate-180' : ''}`}>
                       <ChevronDownIcon />
                    </div>
                </div>
                {isFinancialsVisible && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-b-md text-gray-700 dark:text-gray-300 space-y-2 text-xs" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between"><strong>Total Fee:</strong> <span>{formatCurrency(task.financials.totalFee)}</span></div>
                        <hr className="border-gray-200 dark:border-gray-600"/>
                        <div className="flex justify-between"><strong>Amount Received:</strong> <span>{formatCurrency(task.financials.amountReceived)}</span></div>
                        {task.financials.receivedDate && <div className="flex justify-between text-gray-500"><span>- Received Date:</span> <span>{new Date(task.financials.receivedDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span></div>}
                        {task.financials.receivedBy && <div className="flex justify-between text-gray-500"><span>- Received By:</span> <span>{task.financials.receivedBy}</span></div>}
                        <hr className="border-gray-200 dark:border-gray-600"/>
                        <div className="flex justify-between font-bold"><strong>Balance Due:</strong> <span>{formatCurrency((task.financials.totalFee || 0) - (task.financials.amountReceived || 0))}</span></div>
                    </div>
                )}
            </div>
        )}


        {task.subtasks.length > 0 && (
            <div className='mt-3 space-y-2' onClick={e => e.stopPropagation()}>
                {subtasksToShow.map(subtask => (
                     <div key={subtask.id} className="flex items-center group rounded-md p-1 -m-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <input 
                            id={`subtask-${subtask.id}`}
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={(e) => {
                                e.stopPropagation();
                                onToggleSubtask(task.id, subtask.id);
                            }}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:ring-offset-gray-800 cursor-pointer"
                        />
                        <label 
                            htmlFor={`subtask-${subtask.id}`}
                            className={`ml-3 text-sm transition-colors duration-200 cursor-pointer ${
                                subtask.completed 
                                ? 'line-through text-gray-500 dark:text-gray-400' 
                                : 'text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                            }`}
                        >
                            {subtask.text}
                        </label>
                    </div>
                ))}
                {task.subtasks.length > 3 && (
                    <button
                        onClick={toggleShowAllSubtasks}
                        className="text-primary-600 dark:text-primary-400 hover:underline text-xs font-semibold mt-1 focus:outline-none"
                    >
                        {showAllSubtasks ? 'Show less' : `View all ${task.subtasks.length} subtasks`}
                    </button>
                )}
            </div>
        )}

        <SubtaskProgressBar task={task} />
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-3 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <img src={task.assignee.avatarUrl} alt={task.assignee.name} className="w-6 h-6 rounded-full mr-2" />
                <span>{task.assignee.name}</span>
            </div>
            <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-md ${dueDateStyle.bg} ${dueDateStyle.text}`}>
                 <CalendarIcon />
                {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' , timeZone: "UTC"})}
            </div>
        </div>
        
        <div className="mt-4" onClick={e => e.stopPropagation()}>
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAIAssistant(task);
                }}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 hover:bg-primary-200 dark:hover:bg-primary-800/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
            >
                <span className="mr-2 text-lg">✨</span>
                AI Assistant
            </button>
        </div>
    </div>
  );
};