import React, { useState, useCallback, useMemo } from 'react';
import type { Assignee, Task, TaskWithDetails, Project, Client, Financials, Attachment, Comment, User, Subtask } from '../types';
import { Priority, Status } from '../types';

interface EditTaskModalProps {
  task: TaskWithDetails;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  assignees: Assignee[];
  projects: Project[];
  clients: Client[];
  allTasks: Task[];
  currentUser: User;
}

type Tab = 'Details' | 'Subtasks' | 'Comments' | 'Files';

const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg> );
const WarningIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg> );
const PaperClipIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" /></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.91 2.75 6 3.704 6 4.834v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg> );
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const PencilIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>);


const engagementTypes: Task['engagementType'][] = ['Audit', 'Tax', 'Advisory', 'Bookkeeping'];

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onUpdateTask, assignees, projects, clients, allTasks, currentUser }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [projectId, setProjectId] = useState<string>(task.projectId);
    const [status, setStatus] = useState<Status>(task.status);
    const [engagementType, setEngagementType] = useState<Task['engagementType']>(task.engagementType);
    const [priority, setPriority] = useState<Priority>(task.priority);
    const [startDate, setStartDate] = useState(task.startDate);
    const [dueDate, setDueDate] = useState(task.dueDate);
    const [assignee, setAssignee] = useState<Assignee | null>(task.assignee);
    const [dependsOn, setDependsOn] = useState(task.dependsOn || '');
    const [financials, setFinancials] = useState<Financials | undefined>(task.financials);
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [editingSubtask, setEditingSubtask] = useState<{ id: string, text: string } | null>(null);
    const [comments, setComments] = useState<Comment[]>(task.comments);
    const [newComment, setNewComment] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>(task.attachments);

    const [activeTab, setActiveTab] = useState<Tab>('Details');

    const handleFinancialsChange = (field: keyof Financials, value: string | number) => { setFinancials(prev => ({ ...(prev || { totalFee: 0 }), [field]: value, })); };
    
    const selectedProject = useMemo(() => projects.find(p => p.id === projectId), [projectId, projects]);
    const clientName = useMemo(() => { const client = clients.find(c => c.id === selectedProject?.clientId); return client?.name || 'N/A'; }, [selectedProject, clients]);
    
    const isPastDueDate = useMemo(() => { if (!dueDate) return false; const today = new Date(); today.setHours(0, 0, 0, 0); const [year, month, day] = dueDate.split('-').map(Number); const taskDueDate = new Date(year, month - 1, day); return taskDueDate < today; }, [dueDate]);

    const possibleDependencies = useMemo(() => allTasks.filter(p => p.projectId === task.projectId && p.id !== task.id && p.dependsOn !== task.id), [allTasks, task.id, task.projectId]);

    const handleAddComment = () => {
        if (newComment.trim()) {
            const loggedInAssignee = assignees.find(a => a.name.toLowerCase().includes('sarah')) || assignees[0]; // Mock logged in user
            const comment: Comment = {
                id: `comment-${Date.now()}`,
                user: { name: loggedInAssignee.name, avatarUrl: loggedInAssignee.avatarUrl },
                text: newComment,
                createdAt: new Date().toISOString(),
            };
            setComments(prev => [...prev, comment]);
            setNewComment('');
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file: File) => ({
                id: `attach-${Date.now()}-${file.name}`,
                name: file.name,
                url: '#',
                size: `${(file.size / 1024).toFixed(2)} KB`,
                type: file.type || 'unknown'
            }));
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveAttachment = (fileId: string) => setAttachments(prev => prev.filter(f => f.id !== fileId));

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !projectId || !dueDate || !assignee || !selectedProject || !startDate) {
            alert('Please fill out all required fields.');
            return;
        }
        
        const updatedTask: Task = { ...task, title, description, clientId: selectedProject.clientId, projectId, status, engagementType, priority, startDate, dueDate, assignee, dependsOn: dependsOn || undefined, financials, subtasks, comments, attachments, };
        onUpdateTask(updatedTask);
    }, [title, description, projectId, engagementType, priority, startDate, dueDate, assignee, status, dependsOn, financials, subtasks, comments, attachments, onUpdateTask, selectedProject, task]);
    
    const balanceDue = (financials?.totalFee || 0) - (financials?.amountReceived || 0);

    // Subtask handlers
    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtaskText.trim()) {
            const newSubtask: Subtask = {
                id: `subtask-${Date.now()}-${Math.random()}`,
                text: newSubtaskText.trim(),
                completed: false,
            };
            setSubtasks(prev => [...prev, newSubtask]);
            setNewSubtaskText('');
        }
    };
    const handleDeleteSubtask = (subtaskId: string) => setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
    const handleToggleSubtask = (subtaskId: string) => setSubtasks(prev => prev.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st));
    const handleStartEditing = (subtask: Subtask) => setEditingSubtask({ id: subtask.id, text: subtask.text });
    const handleCancelEditing = () => setEditingSubtask(null);
    const handleSaveEditing = () => {
        if (editingSubtask) {
            setSubtasks(prev => prev.map(st => st.id === editingSubtask.id ? { ...st, text: editingSubtask.text } : st));
            setEditingSubtask(null);
        }
    };
    const subtaskProgress = useMemo(() => {
        const completed = subtasks.filter(st => st.completed).length;
        return subtasks.length > 0 ? (completed / subtasks.length) * 100 : 0;
    }, [subtasks]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl transform transition-all flex flex-col" style={{height: '90vh'}} role="dialog" aria-modal="true">
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                    <div className="p-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100"> Edit Task </h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"> <CloseIcon /> </button>
                        </div>
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                {(['Details', 'Subtasks', 'Comments', 'Files'] as Tab[]).map((tab) => (
                                    <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`${ tab === activeTab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                        {tab}
                                        {tab === 'Subtasks' && subtasks.length > 0 && <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 text-xs font-bold px-2 py-0.5 rounded-full">{subtasks.filter(st => st.completed).length}/{subtasks.length}</span>}
                                        {tab === 'Comments' && comments.length > 0 && <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 text-xs font-bold px-2 py-0.5 rounded-full">{comments.length}</span>}
                                        {tab === 'Files' && attachments.length > 0 && <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 text-xs font-bold px-2 py-0.5 rounded-full">{attachments.length}</span>}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-4">
                        {activeTab === 'Details' && (
                          <div className="space-y-4">
                            <div> <label htmlFor="title-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Title <span className="text-danger-500">*</span></label> <input type="text" id="title-edit" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> </div>
                            <div> <label htmlFor="description-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label> <textarea id="description-edit" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"></textarea> </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div> <label htmlFor="project-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project <span className="text-danger-500">*</span></label> <select id="project-edit" value={projectId} onChange={e => setProjectId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"> {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} </select> </div>
                                <div> <label htmlFor="client-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label> <input type="text" id="client-edit" value={clientName} readOnly disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-500" /> </div>
                                <div> <label htmlFor="dependsOn-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Depends On</label> <select id="dependsOn-edit" value={dependsOn} onChange={e => setDependsOn(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"> <option value="">None</option> {possibleDependencies.map(p => <option key={p.id} value={p.id}>{p.title}</option>)} </select> </div>
                                <div> <label htmlFor="status-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label> <select id="status-edit" value={status} onChange={e => setStatus(e.target.value as Status)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"> {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)} </select> </div>
                                <div> <label htmlFor="engagementType-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Engagement Type</label> <select id="engagementType-edit" value={engagementType} onChange={e => setEngagementType(e.target.value as Task['engagementType'])} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"> {engagementTypes.map(type => <option key={type} value={type}>{type}</option>)} </select> </div>
                                <div> <label htmlFor="priority-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label> <select id="priority-edit" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"> {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)} </select> </div>
                                <div> <label htmlFor="startDate-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date <span className="text-danger-500">*</span></label> <input type="date" id="startDate-edit" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> </div>
                                <div> <label htmlFor="dueDate-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date <span className="text-danger-500">*</span></label> <input type="date" id="dueDate-edit" value={dueDate} onChange={e => setDueDate(e.target.value)} required min={startDate} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> {isPastDueDate && ( <div className="mt-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/40 text-sm text-yellow-800 dark:text-yellow-200 flex items-start space-x-2"> <WarningIcon /> <p>This due date is in the past.</p> </div> )} </div>
                                <div> <label htmlFor="assignee-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignee <span className="text-danger-500">*</span></label> <select id="assignee-edit" value={assignee?.name || ''} onChange={e => { const selectedAssignee = assignees.find(a => a.name === e.target.value) || null; setAssignee(selectedAssignee); }} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"> <option value="" disabled>Select an assignee</option> {assignees.map(a => <option key={a.name} value={a.name}>{a.name}</option>)} </select> </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Financials</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div> <label htmlFor="totalFee-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Fee ($)</label> <input type="number" id="totalFee-edit" value={financials?.totalFee || ''} onChange={e => handleFinancialsChange('totalFee', parseFloat(e.target.value))} min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> </div>
                                        <div> <label htmlFor="amountReceived-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Received ($)</label> <input type="number" id="amountReceived-edit" value={financials?.amountReceived || ''} onChange={e => handleFinancialsChange('amountReceived', parseFloat(e.target.value))} min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> </div>
                                        <div> <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Balance Due ($)</label> <input type="text" value={balanceDue.toFixed(2)} readOnly disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-500" /> </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div> <label htmlFor="receivedBy-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Received By</label> <input type="text" id="receivedBy-edit" value={financials?.receivedBy || ''} onChange={e => handleFinancialsChange('receivedBy', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> </div>
                                        <div> <label htmlFor="receivedDate-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Received Date</label> <input type="date" id="receivedDate-edit" value={financials?.receivedDate || ''} onChange={e => handleFinancialsChange('receivedDate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div> <label htmlFor="balanceReceivedBy-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Balance Received By</label> <input type="text" id="balanceReceivedBy-edit" value={financials?.balanceReceivedBy || ''} onChange={e => handleFinancialsChange('balanceReceivedBy', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> </div>
                                        <div> <label htmlFor="balanceReceivedDate-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Balance Received Date</label> <input type="date" id="balanceReceivedDate-edit" value={financials?.balanceReceivedDate || ''} onChange={e => handleFinancialsChange('balanceReceivedDate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" /> </div>
                                    </div>
                                </div>
                            </div>
                          </div>
                        )}
                        {activeTab === 'Subtasks' && (
                           <div className="flex flex-col h-full">
                                <div className="mb-4">
                                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{subtasks.filter(st => st.completed).length}/{subtasks.length}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${subtaskProgress}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                                    {subtasks.map(subtask => (
                                        <div key={subtask.id} className="flex items-center group bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <input
                                                id={`subtask-edit-${subtask.id}`}
                                                type="checkbox"
                                                checked={subtask.completed}
                                                onChange={() => handleToggleSubtask(subtask.id)}
                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:ring-offset-gray-800 cursor-pointer"
                                            />
                                            {editingSubtask?.id === subtask.id ? (
                                                <input
                                                    type="text"
                                                    value={editingSubtask.text}
                                                    onChange={e => setEditingSubtask({ ...editingSubtask, text: e.target.value })}
                                                    onBlur={handleSaveEditing}
                                                    onKeyDown={e => e.key === 'Enter' && handleSaveEditing()}
                                                    className="ml-3 flex-grow bg-white dark:bg-gray-600 border border-primary-500 rounded-md px-2 py-1 text-sm"
                                                    autoFocus
                                                />
                                            ) : (
                                                <label
                                                    htmlFor={`subtask-edit-${subtask.id}`}
                                                    className={`ml-3 flex-grow text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'} cursor-pointer`}
                                                >
                                                    {subtask.text}
                                                </label>
                                            )}
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                {editingSubtask?.id === subtask.id ? (
                                                     <>
                                                        <button type="button" onClick={handleSaveEditing} className="p-1 text-green-500 hover:text-green-700"><CheckIcon /></button>
                                                        <button type="button" onClick={handleCancelEditing} className="p-1 text-gray-500 hover:text-gray-700"><CloseIcon /></button>
                                                     </>
                                                ) : (
                                                    <button type="button" onClick={() => handleStartEditing(subtask)} className="p-1 text-gray-500 hover:text-primary-600"><PencilIcon /></button>
                                                )}
                                                <button type="button" onClick={() => handleDeleteSubtask(subtask.id)} className="p-1 text-gray-500 hover:text-danger-500"><TrashIcon /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleAddSubtask} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={newSubtaskText}
                                        onChange={e => setNewSubtaskText(e.target.value)}
                                        placeholder="Add a new sub-task"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                                    />
                                    <button type="submit" className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 flex items-center"><PlusIcon /></button>
                                </form>
                           </div>
                        )}
                        {activeTab === 'Comments' && (
                            <div className="flex flex-col h-full">
                                <div className="flex-grow space-y-4 overflow-y-auto">
                                    {comments.length > 0 ? comments.map(comment => (
                                        <div key={comment.id} className="flex items-start space-x-3">
                                            <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-8 h-8 rounded-full" />
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.user.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No comments yet.</p>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-start space-x-3">
                                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 text-sm"></textarea>
                                    <button type="button" onClick={handleAddComment} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700">Post</button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Files' && (
                             <div>
                                <div className="space-y-2">
                                    {attachments.length > 0 ? attachments.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                            <div className="flex items-center min-w-0"> <PaperClipIcon /> <span className="text-sm text-gray-800 dark:text-gray-200 truncate" title={file.name}>{file.name}</span> <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">({file.size})</span> </div>
                                            <button type="button" onClick={() => handleRemoveAttachment(file.id)} className="text-danger-500 hover:text-danger-700 p-1"> <TrashIcon /> </button>
                                        </div>
                                    )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No files attached.</p>}
                                </div>
                                <label className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 cursor-pointer">
                                    <PaperClipIcon /> Attach File
                                    <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rounded-b-lg mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"> Cancel </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-gray-600"> Save Changes </button>
                    </div>
                </form>
            </div>
        </div>
    );
};