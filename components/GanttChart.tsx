
import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { TaskWithDetails } from '../types';
import { Status } from '../types';

interface GanttChartProps {
    tasks: TaskWithDetails[];
    allTasks: TaskWithDetails[];
    onTaskClick: (task: TaskWithDetails) => void;
}

const statusColors: Record<Status, string> = {
  [Status.ToDo]: 'bg-blue-500',
  [Status.InProgress]: 'bg-yellow-500',
  [Status.InReview]: 'bg-purple-500',
  [Status.PendingClient]: 'bg-orange-500',
  [Status.Done]: 'bg-green-500',
};

const getDaysDiff = (d1: Date, d2: Date) => {
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, allTasks, onTaskClick }) => {
    // FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
    const [dependencyLines, setDependencyLines] = useState<React.ReactElement[]>([]);
    const taskElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
    const containerRef = useRef<HTMLDivElement | null>(null);

    const { dateRange, startDate, totalDays } = useMemo(() => {
        if (tasks.length === 0) {
            const today = new Date();
            const tomorrow = addDays(today, 1);
            return { dateRange: [today, tomorrow], startDate: today, totalDays: 1};
        }
        
        const startDates = tasks.map(t => new Date(t.startDate));
        const dueDates = tasks.map(t => new Date(t.dueDate));
        
        const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dueDates.map(d => d.getTime())));

        const totalDays = getDaysDiff(minDate, maxDate) + 1;

        const dateArr = [];
        for (let i = 0; i <= totalDays; i++) {
            dateArr.push(addDays(minDate, i));
        }

        return { dateRange: dateArr, startDate: minDate, totalDays };
    }, [tasks]);

    useEffect(() => {
        const calculateLines = () => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            
            // FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
            const newLines: React.ReactElement[] = [];
            tasks.forEach(task => {
                if (task.dependsOn) {
                    const prerequisiteTask = allTasks.find(t => t.id === task.dependsOn);
                    if (!prerequisiteTask) return;

                    const fromElement = taskElementsRef.current[task.dependsOn];
                    const toElement = taskElementsRef.current[task.id];

                    if (fromElement && toElement) {
                        const fromRect = fromElement.getBoundingClientRect();
                        const toRect = toElement.getBoundingClientRect();
                        
                        const x1 = fromRect.right - containerRect.left;
                        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
                        const x2 = toRect.left - containerRect.left;
                        const y2 = toRect.top + toRect.height / 2 - containerRect.top;

                        newLines.push(
                            <path
                                key={`${task.dependsOn}-${task.id}`}
                                d={`M ${x1} ${y1} L ${x1 + 10} ${y1} L ${x1 + 10} ${y2} L ${x2} ${y2}`}
                                stroke="#a0aec0"
                                strokeWidth="2"
                                fill="none"
                                markerEnd="url(#arrow)"
                            />
                        );
                    }
                }
            });
            setDependencyLines(newLines);
        }
        
        // Timeout to allow DOM to render before calculating positions
        const timer = setTimeout(calculateLines, 100);
        
        window.addEventListener('resize', calculateLines);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateLines);
        };

    }, [tasks, allTasks, totalDays]);

    if (tasks.length === 0) {
        return (
            <div className="mt-8 p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No tasks to display</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no tasks for the selected filter.</p>
            </div>
        )
    }

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 overflow-x-auto">
            <div className="grid min-w-[1200px]" style={{ gridTemplateColumns: `250px repeat(${totalDays}, 1fr)` }}>
                {/* Header: Task Names */}
                <div className="sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-b border-gray-200 dark:border-gray-700 p-2 font-semibold text-gray-700 dark:text-gray-300">Task</div>
                {/* Header: Dates */}
                {dateRange.map((date, index) => (
                    <div key={index} className="text-center border-b border-gray-200 dark:border-gray-700 p-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                    </div>
                ))}
                
                {/* Separator Row */}
                 <div className="sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700"></div>
                 {dateRange.map((_, index) => (
                    <div key={`gridline-${index}`} className="border-r border-gray-200 dark:border-gray-700 h-full"></div>
                ))}

                {/* Task Rows */}
                <div className="col-start-2 col-span-full row-start-2 row-span-full relative" ref={containerRef}>
                    <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none z-0">
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#a0aec0" />
                            </marker>
                        </defs>
                        {dependencyLines}
                    </svg>
                </div>
                {tasks.map((task, index) => {
                    const taskStartDate = new Date(task.startDate);
                    const taskDueDate = new Date(task.dueDate);

                    const startCol = getDaysDiff(startDate, taskStartDate) + 1;
                    const duration = getDaysDiff(taskStartDate, taskDueDate) + 1;
                    const endCol = startCol + duration;

                    return (
                        <React.Fragment key={task.id}>
                            <div className="sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700 p-2 text-sm truncate flex items-center" title={task.title}>
                                <img src={task.assignee.avatarUrl} alt={task.assignee.name} className="w-5 h-5 rounded-full mr-2 flex-shrink-0" />
                                {task.title}
                            </div>
                            <div className="relative border-r border-gray-200 dark:border-gray-700 h-12 flex items-center" style={{ gridColumn: `2 / span ${totalDays}` }}>
                                <div
                                    // FIX: Wrapped callback ref in a block to ensure a void return type, resolving the assignment error.
                                    ref={el => { taskElementsRef.current[task.id] = el; }}
                                    onClick={() => onTaskClick(task)}
                                    className="h-8 absolute z-10 rounded-md flex items-center px-2 cursor-pointer hover:opacity-80 transition-opacity"
                                    style={{
                                        gridColumnStart: startCol,
                                        gridColumnEnd: endCol,
                                        width: `calc(${duration} / ${totalDays} * 100%)`,
                                        left: `calc(${startCol - 1} / ${totalDays} * 100%)`,
                                    }}
                                >
                                    <div className={`w-full h-full ${statusColors[task.status]} rounded flex items-center`}>
                                        <p className="text-white text-xs font-semibold truncate px-2">{task.title}</p>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
