import { useEffect, useState } from 'react';
import { ref, onValue, push, update, remove, off } from 'firebase/database';
import { database } from '../config/firebase';

export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  result?: string;
  createdBy?: string;
  target?: string;
  previousStatus?: string;
  // New fields for enhanced task details
  priority?: string;
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  notes?: string;
}

export function useAutomationTasks() {
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tasksRef = ref(database, 'automationTasks');
    setLoading(true);
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        const arr: AutomationTask[] = Object.entries(value).map(([id, task]: [string, any]) => ({ id, ...task }));
        setTasks(arr);
      } else {
        setTasks([]);
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      setError('Failed to fetch automation tasks');
      setLoading(false);
    });
    return () => {
      off(tasksRef);
      unsubscribe();
    };
  }, []);

  // Add a new task
  const addTask = async (task: Omit<AutomationTask, 'id'>) => {
    const tasksRef = ref(database, 'automationTasks');
    await push(tasksRef, task);
  };

  // Update a task
  const updateTask = async (id: string, updates: Partial<AutomationTask>) => {
    const taskRef = ref(database, `automationTasks/${id}`);
    await update(taskRef, updates);
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    const taskRef = ref(database, `automationTasks/${id}`);
    await remove(taskRef);
  };

  return { tasks, loading, error, addTask, updateTask, deleteTask };
} 