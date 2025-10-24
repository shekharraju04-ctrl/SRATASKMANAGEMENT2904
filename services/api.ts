
import { supabase } from './supabaseClient';
import type { Task, Client, Project, Assignee, User } from '../types';
import type { Session } from '@supabase/supabase-js';

// Type for the profile table in Supabase
type Profile = {
  id: string;
  updated_at: string;
  email: string;
  long_pending_days: number;
};

// Helper to map snake_case from DB to camelCase in app
const taskFromSupabase = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description,
  priority: dbTask.priority,
  status: dbTask.status,
  startDate: dbTask.start_date,
  dueDate: dbTask.due_date,
  assignee: dbTask.assignee,
  subtasks: dbTask.subtasks || [],
  comments: dbTask.comments || [],
  attachments: dbTask.attachments || [],
  clientId: dbTask.client_id,
  projectId: dbTask.project_id,
  engagementType: dbTask.engagement_type,
  dependsOn: dbTask.depends_on,
  financials: dbTask.financials,
});

const taskToSupabase = (appTask: Omit<Task, 'id'>, userId: string) => ({
  user_id: userId,
  title: appTask.title,
  description: appTask.description,
  priority: appTask.priority,
  status: appTask.status,
  start_date: appTask.startDate,
  due_date: appTask.dueDate,
  assignee: appTask.assignee,
  subtasks: appTask.subtasks,
  comments: appTask.comments,
  attachments: appTask.attachments,
  client_id: appTask.clientId,
  project_id: appTask.projectId,
  engagement_type: appTask.engagementType,
  depends_on: appTask.dependsOn,
  financials: appTask.financials,
});


export const getProfile = async (user: Session['user']): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateProfile = async (user: User, updates: { long_pending_days: number }): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
};

export const getData = async (user: Session['user']): Promise<{ tasks: Task[], clients: Client[], projects: Project[], assignees: Assignee[] }> => {
  const [tasksRes, clientsRes, projectsRes, assigneesRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id),
    supabase.from('clients').select('*').eq('user_id', user.id),
    supabase.from('projects').select('*').eq('user_id', user.id),
    supabase.from('assignees').select('*').eq('user_id', user.id)
  ]);

  if (tasksRes.error || clientsRes.error || projectsRes.error || assigneesRes.error) {
    console.error('Error fetching data:', tasksRes.error || clientsRes.error || projectsRes.error || assigneesRes.error);
    return { tasks: [], clients: [], projects: [], assignees: [] };
  }
  
  const assignees = assigneesRes.data.map((a: any) => ({
    name: a.name,
    avatarUrl: a.avatar_url,
  }));

  return {
    tasks: tasksRes.data.map(taskFromSupabase),
    clients: clientsRes.data,
    projects: projectsRes.data.map((p: any) => ({ id: p.id, name: p.name, clientId: p.client_id })),
    assignees: assignees,
  };
};

export const createTask = async (task: Task, userId: string): Promise<Task | null> => {
  const { id, ...restOfTask } = task;
  const dbTask = { id, ...taskToSupabase(restOfTask, userId) };
  const { data, error } = await supabase
    .from('tasks')
    .insert(dbTask)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }
  return taskFromSupabase(data);
};

export const updateTask = async (task: Task): Promise<Task | null> => {
    // We don't know the user ID here, so we can't build the full Supabase object.
    // We will just pass the fields that can be updated by the user.
    const { id, ...updateData } = task;
    const dbUpdateData = {
        title: updateData.title,
        description: updateData.description,
        priority: updateData.priority,
        status: updateData.status,
        start_date: updateData.startDate,
        due_date: updateData.dueDate,
        assignee: updateData.assignee,
        subtasks: updateData.subtasks,
        comments: updateData.comments,
        attachments: updateData.attachments,
        client_id: updateData.clientId,
        project_id: updateData.projectId,
        engagement_type: updateData.engagementType,
        depends_on: updateData.dependsOn,
        financials: updateData.financials,
    };
    
  const { data, error } = await supabase
    .from('tasks')
    .update(dbUpdateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  return taskFromSupabase(data);
};

export const createClient = async (clientData: Omit<Client, 'id'>, userId: string): Promise<Client | null> => {
    const { data, error } = await supabase
        .from('clients')
        .insert({
            name: clientData.name,
            user_id: userId,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating client:', error);
        return null;
    }
    return data;
};

export const runRawQuery = async (query: string): Promise<{ data: any[] | null, error: any | null }> => {
    if (!query || typeof query !== 'string') {
        return { data: null, error: { message: 'Invalid query provided.' } };
    }

    const { data, error } = await supabase.rpc('execute_sql', { query });

    if (error) {
        console.error('Error running raw query:', error);
        return { data: null, error };
    }

    // The function returns a single JSON object which might contain an error key from the EXCEPTION block
    if (data && data.error) {
         return { data: null, error: { message: data.error } };
    }

    // The result from json_agg could be null if the query returns no rows.
    return { data: data || [], error: null };
};
