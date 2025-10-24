
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
import { SearchResultsModal } from './components/SearchResultsModal';
import useMockData, { assignees, clients, projects, mockTaskTemplates } from './hooks/useMockData';
import { findTasksByQuery } from './services/geminiService';
import { Status, Priority } from './types';
import type { Task, Subtask, Column, NewTaskData, TaskWithDetails, SortBy, User, Attachment, Comment } from './types';

export default function App() {
  const { tasks: initialTasks, setTasks: setAllTasks } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [mainView, setMainView] = useState<'kanban' | 'gantt'>('kanban');
  const [viewMode, setViewMode] = useState<'client' | 'project'>('client');
  const [selectedFilterId, setSelectedFilterId] = useState<string>(clients[0]?.id || '');
  const [sortBy, setSortBy] = useState<SortBy>('default');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Settings state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [longPendingDays, setLongPendingDays] = useState<number>(0);

  // AI Search State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<TaskWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    // Check for persisted user session
    try {
      const storedUser = localStorage.getItem('acctflow_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      const storedLongPendingDays = localStorage.getItem('acctflow_longPendingDays');
      if (storedLongPendingDays) {
        const days = parseInt(storedLongPendingDays, 10);
        if (!isNaN(days)) {
            setLongPendingDays(days);
        }
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'client') {
      setSelectedFilterId(clients[0]?.id || '');
    } else {
      setSelectedFilterId(projects[0]?.id || '');
    }
  }, [viewMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auth handlers
  const handleSignUp = useCallback((email: string, password: string) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('acctflow_users') || '{}');
      if (storedUsers[email]) {
        setAuthError('An account with this email already exists.');
        return;
      }
      // NOTE: In a real app, hash and salt the password. This is for mock purposes only.
      storedUsers[email] = { password }; 
      localStorage.setItem('acctflow_users', JSON.stringify(storedUsers));
      
      const newUser = { email };
      localStorage.setItem('acctflow_user', JSON.stringify(newUser));
      setCurrentUser(newUser);
      setIsSignUpModalOpen(false);
      setAuthError(null);
    } catch (error) {
        console.error("Sign up failed:", error);
        setAuthError("An unexpected error occurred during sign up.");
    }
  }, []);

  const handleSignIn = useCallback((email: string, password: string) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('acctflow_users') || '{}');
      if (storedUsers[email] && storedUsers[email].password === password) {
        const user = { email };
        localStorage.setItem('acctflow_user', JSON.stringify(user));
        setCurrentUser(user);
        setIsSignInModalOpen(false);
        setAuthError(null);
      } else {
        setAuthError('Invalid email or password.');
      }
    } catch (error) {
        console.error("Sign in failed:", error);
        setAuthError("An unexpected error occurred during sign in.");
    }
  }, []);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('acctflow_user');
    setCurrentUser(null);
  }, []);

  const openSignInModal = () => {
      setAuthError(null);
      setIsSignUpModalOpen(false);
      setIsSignInModalOpen(true);
  }
  const openSignUpModal = () => {
      setAuthError(null);
      setIsSignInModalOpen(false);
      setIsSignUpModalOpen(true);
  }

  // Settings Handlers
  const handleOpenSettingsModal = () => setIsSettingsModalOpen(true);
  const handleCloseSettingsModal = () => setIsSettingsModalOpen(false);
  const handleSaveSettings = (newLongPendingDays: number) => {
    setLongPendingDays(newLongPendingDays);
    localStorage.setItem('acctflow_longPendingDays', newLongPendingDays.toString());
    handleCloseSettingsModal();
  };
  
  const allTasksWithDetails = useMemo((): TaskWithDetails[] => {
     return initialTasks.map(task => {
        const client = clients.find(c => c.id === task.clientId);
        const project = projects.find(p => p.id === task.projectId);
        return {
            ...task,
            clientName: client?.name || 'Unknown Client',
            projectName: project?.name || 'Unknown Project',
        };
    });
  }, [initialTasks]);


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
            // Add a default sort by start date for consistency
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
    }

    return newColumns;
  }, [displayedTasks, sortBy]);

  const handleOpenAIAssistant = useCallback((task: TaskWithDetails) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);
  
  const handleOpenEditModal = useCallback((task: TaskWithDetails) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleCreateTask = useCallback((newTaskData: NewTaskData) => {
    const { totalFee, subtaskStrings, attachments: newAttachmentsData, ...restOfData } = newTaskData;

    const newSubtasks: Subtask[] = (subtaskStrings || []).map(text => ({
        id: `subtask-${Date.now()}-${Math.random()}-${text.slice(0, 5)}`,
        text,
        completed: false,
    }));
    
    // FIX: Add unique IDs to new attachments to conform to the `Attachment` type.
    const newAttachments: Attachment[] = (newAttachmentsData || []).map(att => ({
        ...att,
        id: `attach-${Date.now()}-${Math.random()}`,
    }));

    const newTask: Task = {
      ...restOfData,
      id: `task-${Date.now()}-${Math.random()}`,
      status: Status.ToDo,
      subtasks: newSubtasks,
      comments: [],
      attachments: newAttachments,
    };

    if (totalFee && totalFee > 0) {
      newTask.financials = { totalFee: totalFee };
    }

    setAllTasks(prevTasks => [newTask, ...prevTasks]);
    handleCloseCreateModal();
  }, [setAllTasks, handleCloseCreateModal]);
  
  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setAllTasks(prevTasks => 
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
    // Also update the selected task if it's being edited
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
  }, [setAllTasks]);
  
  const handleCloseAndUpdate = useCallback((updatedTask: Task) => {
     handleUpdateTask(updatedTask);
     handleCloseEditModal();
  }, [handleUpdateTask, handleCloseEditModal]);

  const handleApplyAIChanges = useCallback((taskId: string, changes: { title?: string; subtasks?: Omit<Subtask, 'id' | 'completed'>[] }) => {
    setAllTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const taskToUpdate = { ...task };
          
          if (changes.title) {
              taskToUpdate.title = changes.title;
          }

          if (changes.subtasks) {
              const existingSubtaskTexts = new Set(taskToUpdate.subtasks.map(st => st.text));
              const uniqueNewSubtasks = changes.subtasks
                .filter(nst => !existingSubtaskTexts.has(nst.text))
                .map(nst => ({
                  ...nst,
                  id: `subtask-${Date.now()}-${Math.random()}`,
                  completed: false,
                }));
              taskToUpdate.subtasks = [...taskToUpdate.subtasks, ...uniqueNewSubtasks];
          }
          return taskToUpdate;
        }
        return task;
      });
    });
    handleCloseModal();
  }, [setAllTasks, handleCloseModal]);
  
  const handleToggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setAllTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      });
    });
  }, [setAllTasks]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;

    setSearchQuery(query);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setIsSearchModalOpen(true);

    try {
        const matchingIds = await findTasksByQuery(query, initialTasks);
        const matchingTasks = allTasksWithDetails.filter(task => matchingIds.includes(task.id));
        setSearchResults(matchingTasks);
    } catch (err: any) {
        setSearchError(err.message || 'An unknown error occurred during the search.');
    } finally {
        setIsSearching(false);
    }
  }, [initialTasks, allTasksWithDetails]);

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
            <Dashboard 
              allTasks={initialTasks}
              clients={clients}
              projects={projects}
              onTaskClick={handleOpenEditModal}
              longPendingDays={longPendingDays}
            />
            {mainView === 'kanban' ? (
                <KanbanBoard 
                    columns={columns} 
                    onOpenAIAssistant={handleOpenAIAssistant}
                    onOpenEditModal={handleOpenEditModal}
                    onToggleSubtask={handleToggleSubtask}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    allTasks={initialTasks}
                />
            ) : (
                <GanttChart 
                    tasks={displayedTasks}
                    allTasks={allTasksWithDetails}
                    onTaskClick={handleOpenEditModal}
                />
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
            allTasks={initialTasks}
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
