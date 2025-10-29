import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LogOut, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) {
      toast.error('Please enter a task');
      return;
    }

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask,
      completed: false,
      createdAt: new Date()
    };

    setTasks([task, ...tasks]);
    setNewTask('');
    toast.success('Task added successfully');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Task deleted');
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Task Manager</h1>
            <p className="text-slate-600 mt-1">Welcome, {user?.email}</p>
          </div>
          <Button onClick={signOut} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Card className="mb-6 border-2 shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>What do you need to do today?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <Button onClick={addTask} className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Tasks</CardTitle>
              <div className="text-sm text-slate-600">
                {completedCount} of {tasks.length} completed
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No tasks yet</p>
                <p className="text-sm">Add your first task to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 rounded-lg border-2 bg-white hover:shadow-md transition-shadow"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="flex-1 flex items-center gap-2">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                      <span
                        className={`${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-700'
                        } font-medium`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
