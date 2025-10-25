
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Assignee, NewTaskData, Project, Client, Task, TaskTemplate, Attachment } from '../types';
import { Priority } from '../types';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreateTask: (task: NewTaskData) => void;
  assignees: Assignee[];
  projects: Project[];
  clients: Client[];
  taskTemplates: TaskTemplate[];
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const PaperClipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.91 2.75 6 3.704 6 4.834v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


const engagementTypes: (Task['engagementType'])[] = ['Audit', 'Tax', 'Advisory', 'Bookkeeping'];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onCreateTask, assignees, projects, clients, taskTemplates }) => {
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
    const [engagementType, setEngagementType] = useState<NewTaskData['engagementType']>('Tax');
    const [priority, setPriority] = useState<Priority>(Priority.Medium);
    const [startDate, setStartDate] = useState(today);
    const [dueDate, setDueDate] = useState(today);
    const [assignee, setAssignee] = useState<Assignee | null>(assignees[0] || null);
    const [totalFee, setTotalFee] = useState<string>('');
    const [attachments, setAttachments] = useState<Omit<Attachment, 'id'>[]>([]);

    const selectedProject = useMemo(() => projects.find(p => p.id === projectId), [projectId, projects]);
    const clientName = useMemo(() => {
        const client = clients.find(c => c.id === selectedProject?.clientId);
        return client?.name || 'N/A';
    }, [selectedProject, clients]);

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);

        if (!templateId) {
            setTitle('');
            setDescription('');
            setEngagementType('Tax');
            return;
        }

        const template = taskTemplates.find(t => t.id === templateId);
        if (template) {
            setTitle(template.title);
            setDescription(template.description);
            setEngagementType(template.engagementType);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // FIX: Explicitly type `file` as `File` to resolve properties not being found on an inferred `unknown` type.
            const newFiles = Array.from(e.target.files).map((file: File) => ({
                name: file.name,
                url: '#', // Mock URL
                size: `${(file.size / 1024).toFixed(2)} KB`,
                type: file.type || 'unknown'
            }));
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(f => f.name !== fileName));
    };

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !projectId || !dueDate || !assignee || !selectedProject || !startDate) {
            alert('Please fill out all required fields.');
            return;
        }
        
        const template = taskTemplates.find(t => t.id === selectedTemplateId);
        
        onCreateTask({
            title,
            description,
            clientId: selectedProject.clientId,
            projectId,
            engagementType,
            priority,
            startDate,
            dueDate,
            assignee,
            totalFee: totalFee ? parseFloat(totalFee) : undefined,
            subtaskStrings: template ? template.subtasks : undefined,
            attachments: attachments
        });
    }, [title, description, projectId, engagementType, priority, startDate, dueDate, assignee, totalFee, attachments, onCreateTask, selectedProject, selectedTemplateId, taskTemplates]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all" role="dialog" aria-modal="true">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Create New Task
                            </h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                                <CloseIcon />
                            </button>
                        </div>
                        
                        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div>
                                <label htmlFor="template" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start with a template</label>
                                <select id="template" value={selectedTemplateId} onChange={handleTemplateChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                                    <option value="">No Template</option>
                                    {taskTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-600"/>

                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Title <span className="text-danger-500">*</span></label>
                                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            
                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"></textarea>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project <span className="text-danger-500">*</span></label>
                                    <select id="project" value={projectId} onChange={e => setProjectId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                                    <input type="text" id="client" value={clientName} readOnly disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-500" />
                                </div>
                                <div>
                                    <label htmlFor="engagementType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Engagement Type</label>
                                    <select id="engagementType" value={engagementType} onChange={e => setEngagementType(e.target.value as NewTaskData['engagementType'])} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                                        {engagementTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                                    <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date <span className="text-danger-500">*</span></label>
                                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                 <div>
                                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date <span className="text-danger-500">*</span></label>
                                    <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required min={startDate} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                 <div>
                                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignee <span className="text-danger-500">*</span></label>
                                    <select id="assignee" value={assignee?.name || ''} onChange={e => {
                                        const selectedAssignee = assignees.find(a => a.name === e.target.value) || null;
                                        setAssignee(selectedAssignee);
                                    }} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                                        <option value="" disabled>Select an assignee</option>
                                        {assignees.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Attachments</h4>
                                <div className="space-y-2">
                                    {attachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                            <div className="flex items-center min-w-0">
                                                <PaperClipIcon />
                                                <span className="text-sm text-gray-800 dark:text-gray-200 truncate" title={file.name}>{file.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">({file.size})</span>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveAttachment(file.name)} className="text-danger-500 hover:text-danger-700 p-1">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <label className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 cursor-pointer">
                                    <PaperClipIcon />
                                    Attach File
                                    <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Financials</h4>
                                <div>
                                    <label htmlFor="totalFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Fee ($)</label>
                                    <input type="number" id="totalFee" value={totalFee} onChange={e => setTotalFee(e.target.value)} min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-gray-600"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
