import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type EstimationItem = Database['public']['Tables']['estimation_items']['Row'];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<ProjectInsert, 'user_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => 
        prev.map(project => 
          project.id === id ? data : project
        )
      );
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  };

  const getProjectEstimation = async (projectId: string): Promise<EstimationItem[]> => {
    try {
      const { data, error } = await supabase
        .from('estimation_items')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching estimation items:', error);
      return [];
    }
  };

  const getProjectWithEstimation = async (projectId: string) => {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Get estimation items
      const { data: estimationItems, error: itemsError } = await supabase
        .from('estimation_items')
        .select('*')
        .eq('project_id', projectId);

      if (itemsError) throw itemsError;

      return {
        project,
        estimationItems: estimationItems || []
      };
    } catch (error) {
      console.error('Error fetching project with estimation:', error);
      return null;
    }
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProjectEstimation,
    getProjectWithEstimation,
    refetch: fetchProjects,
  };
}