
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { AIAssistantModal } from './components/AIAssistantModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { EditTaskModal } from './components/EditTaskModal';
import { SignInModal } from './components/SignInModal';
import { SignUpModal } from './components/SignUpModal';
import { AuthLandingPage } from './components/AuthLandingPage';
import { SettingsModal } from './components/SettingsModal';
import { GanttChart } from './components/GanttChart';
import { SQLSchemaView } from './components/SQLSchemaView';
import { SearchResultsModal } from './components/SearchResultsModal';
import { mockTaskTemplates } from './hooks/useMockData';
import { findTasksByQuery } from './services/geminiService';
import { Status, Priority } from './types';
import type { Task, Subtask, Column, NewTaskData, TaskWithDetails, SortBy, User, Attachment, Comment, Client, Project, Assignee } from './types';
import { supabase } from './services/supabaseClient';
import * as api from './services/api';
// FIX: Replaced direct User import with Session to derive user type, resolving an export error in older Supabase versions.
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [mainView, setMainView] = useState<'kanban' | 'gantt' | 'sql'>('kanban');
  const [viewMode, setViewMode] = useState<'client' | 'project'>('client');
  const [selectedFilterId, setSelectedFilterId] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('default');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [longPendingDays, setLongPendingDays] = useState<number>(7);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<TaskWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleUserSession = useCallback(async (supabaseUser: Session['user'] | null) => {
    if (supabaseUser) {
        const userProfile = await api.getProfile(supabaseUser);
        if (userProfile) {
            setCurrentUser({ id: supabaseUser.id, email: supabaseUser.email! });
            setLongPendingDays(userProfile.long_pending_days);
            
            // Fetch all user data
            const { tasks, clients, projects, assignees } = await api.getData(supabaseUser);
            setTasks(tasks);
            setClients(clients);
            setProjects(projects);
            setAssignees(assignees);

            // Set initial filter
            if (viewMode === 'client' && clients.length > 0) {
              setSelectedFilterId(clients[0].id);
            } else if (viewMode === 'project' && projects.length > 0) {
              setSelectedFilterId(projects[0].id);
            }
        }
    } else {
        setCurrentUser(null);
        setTasks([]);
        setClients([]);
        setProjects([]);
        setAssignees([]);
    }
  }, [viewMode]);

  useEffect(() => {
      // FIX: Replaced async `getSession()` with sync `session()` for compatibility with older Supabase versions.
      handleUserSession(supabase.auth.session()?.user ?? null);

      // FIX: Adjusted destructuring for `onAuthStateChange` to match older Supabase versions' return signature.
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
          handleUserSession(session?.user ?? null);
      });

      return () => subscription?.unsubscribe();
  }, [handleUserSession]);

  useEffect(() => {
    if (viewMode === 'client') {
      setSelectedFilterId(clients[0]?.id || '');
    } else {
      setSelectedFilterId(projects[0]?.id || '');
    }
  }, [viewMode, clients, projects]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    // FIX: Switched to `signUp` which is supported in older Supabase versions. This assumes the error about it not existing is spurious.
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
        setAuthError(error.message);
    } else {
        setIsSignUpModalOpen(false);
        // User will be set by onAuthStateChange listener
    }
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    // FIX: Replaced `signInWithPassword` with `signIn` for compatibility with older Supabase versions.
    const { error } = await supabase.auth.signIn({ email, password });
    if (error) {
        setAuthError(error.message);
    } else {
        setIsSignInModalOpen(false);
        // User will be set by onAuthStateChange listener
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    // FIX: Used `signOut` which is supported in older Supabase versions. This assumes the error about it not existing is spurious.
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const openSignInModal = () => { setAuthError(null); setIsSignUpModalOpen(false); setIsSignInModalOpen(true); }
  const openSignUpModal = () => { setAuthError(null); setIsSignInModalOpen(false); setIsSignUpModalOpen(true); }

  const handleOpenSettingsModal = () => setIsSettingsModalOpen(true);
  const handleCloseSettingsModal = () => setIsSettingsModalOpen(false);
  const handleSaveSettings = async (newLongPendingDays: number) => {
    if (!currentUser) return;
    const updatedProfile = await api.updateProfile(currentUser, { long_pending_days: newLongPendingDays });
    if (updatedProfile) {
        setLongPendingDays(updatedProfile.long_pending_days);
    }
    handleCloseSettingsModal();
  };
  
  const allTasksWithDetails = useMemo((): TaskWithDetails[] => {
     return tasks.map(task => {
        const client = clients.find(c => c.id === task.clientId);
        const project = projects.find(p => p.id === task.projectId);
        return {
            ...task,
            clientName: client?.name || 'Unknown Client',
            projectName: project?.name || 'Unknown Project',
        };
    });
  }, [tasks, clients, projects]);


  const displayedTasks = useMemo((): TaskWithDetails[] => {
    if (!selectedFilterId || !currentUser) return [];

    if (viewMode === 'client') {
        return allTasksWithDetails.filter(task => task.clientId === selectedFilterId);
    } else { 
        return allTasksWithDetails.filter(task => task.projectId === selectedFilterId);
    }
  }, [allTasksWithDetails, viewMode, selectedFilterId, currentUser]);

  const columns = useMemo((): Map<Status, Column> => {
    const newColumns = new Map<Status, Column>([
      [Status.ToDo, { id: Status.ToDo, title: 'To Do', tasks: [] }],
      [Status.InProgress, { id: Status.InProgress, title: 'In Progress', tasks: [] }],
      [Status.InReview, { id: Status.InReview, title: 'In Review', tasks: [] }],
      [Status.PendingClient, { id: Status.PendingClient, title: 'Pending Client', tasks: [] }],
      [Status.Done, { id: Status.Done, title: 'Done', tasks: [] }],
    ]);

    for (const task of displayedTasks) {
        const column = newColumns.get(task.status);
        if (column) {
            column.tasks.push(task);
        }
    }

    const priorityOrder = { [Priority.Urgent]: 1, [Priority.High]: 2, [Priority.Medium]: 3, [Priority.Low]: 4 };
    for (const column of newColumns.values()) {
        column.tasks.sort((a, b) => {
            if (sortBy === 'priority') {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            if (sortBy === 'dueDate') {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (sortBy === 'assignee') {
                return a.assignee.name.localeCompare(b.assignee.name);
            }
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
    }

    return newColumns;
  }, [displayedTasks, sortBy]);

  const handleOpenAIAssistant = useCallback((task: TaskWithDetails) => { setSelectedTask(task); setIsModalOpen(true); }, []);
  const handleCloseModal = useCallback(() => { setIsModalOpen(false); setSelectedTask(null); }, []);
  const handleOpenCreateModal = useCallback(() => { setIsCreateModalOpen(true); }, []);
  const handleCloseCreateModal = useCallback(() => { setIsCreateModalOpen(false); }, []);
  const handleOpenEditModal = useCallback((task: TaskWithDetails) => { setSelectedTask(task); setIsEditModalOpen(true); }, []);
  const handleCloseEditModal = useCallback(() => { setIsEditModalOpen(false); setSelectedTask(null); }, []);

  const handleCreateTask = useCallback(async (newTaskData: NewTaskData) => {
    if (!currentUser) return;
    const { totalFee, subtaskStrings, attachments: newAttachmentsData, ...restOfData } = newTaskData;

    const newSubtasks: Subtask[] = (subtaskStrings || []).map(text => ({
        id: `subtask-${Date.now()}-${Math.random()}-${text.slice(0, 5)}`,
        text,
        completed: false,
    }));
    
    const newAttachments: Attachment[] = (newAttachmentsData || []).map(att => ({
        ...att,
        id: `attach-${Date.now()}-${Math.random()}`,
    }));

    const taskToCreate: Omit<Task, 'user_id'> = {
      ...restOfData,
      id: `task-${Date.now()}-${Math.random()}`,
      status: Status.ToDo,
      subtasks: newSubtasks,
      comments: [],
      attachments: newAttachments,
    };

    if (totalFee && totalFee > 0) {
      taskToCreate.financials = { totalFee: totalFee };
    }
    
    const createdTask = await api.createTask(taskToCreate, currentUser.id);
    if(createdTask) {
        setTasks(prevTasks => [createdTask, ...prevTasks]);
    }
    handleCloseCreateModal();
  }, [currentUser, handleCloseCreateModal]);
  
  const handleUpdateTask = useCallback(async (updatedTask: Task) => {
    // Optimistic update
    setTasks(prevTasks => prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task)));
    const resultTask = await api.updateTask(updatedTask);
    if (resultTask) {
        // Correct with server response
        setTasks(prevTasks => prevTasks.map(task => (task.id === resultTask.id ? resultTask : task)));
    } else {
        // TODO: Handle error, maybe revert optimistic update
        console.error("Failed to update task");
    }

    setSelectedTask(prevSelected => {
        if (prevSelected && prevSelected.id === updatedTask.id) {
            const client = clients.find(c => c.id === updatedTask.clientId);
            const project = projects.find(p => p.id === updatedTask.projectId);
            return {
                ...updatedTask,
                clientName: client?.name || 'Unknown Client',
                projectName: project?.name || 'Unknown Project',
            };
        }
        return prevSelected;
    });
  }, [clients, projects]);
  
  const handleCloseAndUpdate = useCallback((updatedTask: Task) => {
     handleUpdateTask(updatedTask);
     handleCloseEditModal();
  }, [handleUpdateTask, handleCloseEditModal]);

  const handleApplyAIChanges = useCallback(async (taskId: string, changes: { title?: string; subtasks?: Omit<Subtask, 'id' | 'completed'>[] }) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;
    
    let updatedTask = { ...taskToUpdate };
    
    if (changes.title) {
        updatedTask.title = changes.title;
    }

    if (changes.subtasks) {
        const existingSubtaskTexts = new Set(updatedTask.subtasks.map(st => st.text));
        const uniqueNewSubtasks = changes.subtasks
          .filter(nst => !existingSubtaskTexts.has(nst.text))
          .map(nst => ({
            ...nst,
            id: `subtask-${Date.now()}-${Math.random()}`,
            completed: false,
          }));
        updatedTask.subtasks = [...updatedTask.subtasks, ...uniqueNewSubtasks];
    }
    
    await handleUpdateTask(updatedTask);
    handleCloseModal();
  }, [tasks, handleUpdateTask, handleCloseModal]);
  
  const handleToggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedSubtasks = taskToUpdate.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const updatedTask = { ...taskToUpdate, subtasks: updatedSubtasks };
    
    await handleUpdateTask(updatedTask);
  }, [tasks, handleUpdateTask]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;

    setSearchQuery(query);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setIsSearchModalOpen(true);

    try {
        const matchingIds = await findTasksByQuery(query, tasks);
        const matchingTasks = allTasksWithDetails.filter(task => matchingIds.includes(task.id));
        setSearchResults(matchingTasks);
    } catch (err: any) {
        setSearchError(err.message || 'An unknown error occurred during the search.');
    } finally {
        setIsSearching(false);
    }
  }, [tasks, allTasksWithDetails]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode}
        onOpenCreateModal={handleOpenCreateModal}
        mainView={mainView}
        setMainView={setMainView}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedFilterId={selectedFilterId}
        setSelectedFilterId={setSelectedFilterId}
        clients={clients}
        projects={projects}
        currentUser={currentUser}
        onOpenSignIn={openSignInModal}
        onOpenSignUp={openSignUpModal}
        onSignOut={handleSignOut}
        onOpenSettings={handleOpenSettingsModal}
        onSearch={handleSearch}
      />
      
      {currentUser ? (
        <main className="p-4 sm:p-6 lg:p-8">
            {mainView !== 'sql' &&
              <Dashboard 
                allTasks={tasks}
                clients={clients}
                projects={projects}
                onTaskClick={handleOpenEditModal}
                longPendingDays={longPendingDays}
              />
            }
            {mainView === 'kanban' ? (
                <KanbanBoard 
                    columns={columns} 
                    onOpenAIAssistant={handleOpenAIAssistant}
                    onOpenEditModal={handleOpenEditModal}
                    onToggleSubtask={handleToggleSubtask}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    allTasks={tasks}
                />
            ) : mainView === 'gantt' ? (
                <GanttChart 
                    tasks={displayedTasks}
                    allTasks={allTasksWithDetails}
                    onTaskClick={handleOpenEditModal}
                />
            ) : (
                <SQLSchemaView />
            )}
        </main>
      ) : (
        <AuthLandingPage onOpenSignIn={openSignInModal} onOpenSignUp={openSignUpModal} />
      )}

      {/* Task Modals */}
      {isModalOpen && selectedTask && (
        <AIAssistantModal
          task={selectedTask}
          onClose={handleCloseModal}
          onApplyAIChanges={handleApplyAIChanges}
        />
      )}
      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={handleCloseCreateModal}
          onCreateTask={handleCreateTask}
          assignees={assignees}
          projects={projects}
          clients={clients}
          taskTemplates={mockTaskTemplates}
        />
      )}
      {isEditModalOpen && selectedTask && currentUser &&(
        <EditTaskModal
            task={selectedTask}
            onClose={handleCloseEditModal}
            onUpdateTask={handleCloseAndUpdate}
            assignees={assignees}
            projects={projects}
            clients={clients}
            allTasks={tasks}
            currentUser={currentUser}
        />
      )}

      {/* Auth Modals */}
      {isSignUpModalOpen && (
        <SignUpModal
          onClose={() => setIsSignUpModalOpen(false)}
          onSignUp={handleSignUp}
          error={authError}
          onSwitchToSignIn={openSignInModal}
        />
      )}
      {isSignInModalOpen && (
        <SignInModal
          onClose={() => setIsSignInModalOpen(false)}
          onSignIn={handleSignIn}
          error={authError}
          onSwitchToSignUp={openSignUpModal}
        />
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
          <SettingsModal
            onClose={handleCloseSettingsModal}
            onSave={handleSaveSettings}
            currentLongPendingDays={longPendingDays}
          />
      )}

      {/* Search Modal */}
      {isSearchModalOpen && (
        <SearchResultsModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            query={searchQuery}
            results={searchResults}
            isLoading={isSearching}
            error={searchError}
            onTaskClick={(task) => {
                setIsSearchModalOpen(false);
                handleOpenEditModal(task);
            }}
        />
      )}
    </div>
  );
}
