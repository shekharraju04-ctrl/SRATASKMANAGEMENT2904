import React, { useMemo, useState } from 'react';
import type { Task, Client, Project, TaskWithDetails } from '../types';
import { Status, Priority } from '../types';

const ToDoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75V17.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const InProgressIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.696v4.992h-4.992m0 0 3.181-3.183a8.25 8.25 0 0 1 11.667 0l3.181 3.183" /></svg>;
const InReviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const DoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const HighPriorityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 3.75 3.75 0 0 0-7.493 0 3.75 3.75 0 0 0 .495 7.468Z" /></svg>;
const LongPendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const PendingClientIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;

type DashboardStat = 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'High Priority' | 'Long Pending' | 'Pending Client';

const priorityStyles: Record<Priority, { bg: string; text: string; }> = {
  [Priority.Low]: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
  [Priority.Medium]: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-300' },
  [Priority.High]: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-300' },
  [Priority.Urgent]: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-300' },
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

interface StatCardProps {
    title: DashboardStat;
    value: number;
    icon: React.ReactNode;
    colorClasses: {
        iconBg: string;
        text: string;
    };
    isActive: boolean;
    onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClasses, isActive, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center space-x-4 cursor-pointer transition-all duration-200 ${isActive ? 'ring-2 ring-primary-500 bg-gray-50 dark:bg-gray-700/50' : 'hover:shadow-md hover:-translate-y-1'}`}
        >
            <div className={`p-3 rounded-full ${colorClasses.iconBg}`}>
                <div className={colorClasses.text}>
                   {icon}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    );
};

interface DashboardProps {
    allTasks: Task[];
    clients: Client[];
    projects: Project[];
    onTaskClick: (task: TaskWithDetails) => void;
    longPendingDays: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ allTasks, clients, projects, onTaskClick, longPendingDays }) => {
    const [selectedStat, setSelectedStat] = useState<DashboardStat | null>(null);

    const tasksWithDetails = useMemo((): TaskWithDetails[] => {
        return allTasks.map(task => {
            const client = clients.find(c => c.id === task.clientId);
            const project = projects.find(p => p.id === task.projectId);
            return {
                ...task,
                clientName: client?.name || 'Unknown Client',
                projectName: project?.name || 'Unknown Project',
            };
        });
    }, [allTasks, clients, projects]);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const highPriorityTasks = tasksWithDetails.filter(t => t.priority === Priority.High || t.priority === Priority.Urgent);
        
        let longPendingTasks: TaskWithDetails[] = [];
        if (longPendingDays > 0) {
            longPendingTasks = tasksWithDetails.filter(t => {
                if (t.status !== Status.PendingClient) return false;
                const [year, month, day] = t.dueDate.split('-').map(Number);
                const taskDueDate = new Date(year, month - 1, day);
                const timeDiff = today.getTime() - taskDueDate.getTime();
                const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
                return dayDiff > longPendingDays;
            });
        }

        return {
            'To Do': tasksWithDetails.filter(t => t.status === Status.ToDo).length,
            'In Progress': tasksWithDetails.filter(t => t.status === Status.InProgress).length,
            'In Review': tasksWithDetails.filter(t => t.status === Status.InReview).length,
            'Pending Client': tasksWithDetails.filter(t => t.status === Status.PendingClient).length,
            'Done': tasksWithDetails.filter(t => t.status === Status.Done).length,
            'High Priority': highPriorityTasks.length,
            'Long Pending': longPendingTasks.length,
        };
    }, [tasksWithDetails, longPendingDays]);

    const filteredTasks = useMemo((): TaskWithDetails[] => {
        if (!selectedStat) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (selectedStat) {
            case 'To Do':
                return tasksWithDetails.filter(t => t.status === Status.ToDo);
            case 'In Progress':
                return tasksWithDetails.filter(t => t.status === Status.InProgress);
            case 'In Review':
                return tasksWithDetails.filter(t => t.status === Status.InReview);
            case 'Pending Client':
                return tasksWithDetails.filter(t => t.status === Status.PendingClient);
            case 'Done':
                return tasksWithDetails.filter(t => t.status === Status.Done);
            case 'High Priority':
                return tasksWithDetails.filter(t => t.priority === Priority.High || t.priority === Priority.Urgent);
            case 'Long Pending':
                 if (longPendingDays > 0) {
                    return tasksWithDetails.filter(t => {
                        if (t.status !== Status.PendingClient) return false;
                        const [year, month, day] = t.dueDate.split('-').map(Number);
                        const taskDueDate = new Date(year, month - 1, day);
                        const timeDiff = today.getTime() - taskDueDate.getTime();
                        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
                        return dayDiff > longPendingDays;
                    });
                }
                return [];
            default:
                return [];
        }
    }, [selectedStat, tasksWithDetails, longPendingDays]);

    const statCardsData: { title: DashboardStat, icon: React.ReactNode, colorClasses: StatCardProps['colorClasses'] }[] = [
        { title: 'To Do', icon: <ToDoIcon />, colorClasses: { iconBg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-300' } },
        { title: 'In Progress', icon: <InProgressIcon />, colorClasses: { iconBg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-300' } },
        { title: 'In Review', icon: <InReviewIcon />, colorClasses: { iconBg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-300' } },
        { title: 'Pending Client', icon: <PendingClientIcon />, colorClasses: { iconBg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-300' } },
        { title: 'Done', icon: <DoneIcon />, colorClasses: { iconBg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-300' } },
        { title: 'High Priority', icon: <HighPriorityIcon />, colorClasses: { iconBg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-300' } },
        { title: 'Long Pending', icon: <LongPendingIcon />, colorClasses: { iconBg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-300' } },
    ];
    
    const handleStatClick = (stat: DashboardStat) => {
        if (selectedStat === stat) {
            setSelectedStat(null); // Toggle off if clicked again
        } else {
            setSelectedStat(stat);
        }
    };
    
    return (
        <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {statCardsData.map(card => {
                    if (card.title === 'Long Pending' && longPendingDays === 0) return null;
                    return (
                        <StatCard
                            key={card.title}
                            title={card.title}
                            value={stats[card.title]}
                            icon={card.icon}
                            colorClasses={card.colorClasses}
                            isActive={selectedStat === card.title}
                            onClick={() => handleStatClick(card.title)}
                        />
                    )
                })}
            </div>

            {selectedStat && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" onClick={() => setSelectedStat(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl transform transition-all max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {selectedStat} Tasks ({filteredTasks.length})
                                </h3>
                                <button type="button" onClick={() => setSelectedStat(null)} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className="mt-4 overflow-y-auto">
                               {filteredTasks.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredTasks.map(task => (
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
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No tasks to display for this category.
                                </div>
                               )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
