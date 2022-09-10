export interface TaskProps {
  complete: boolean;
  title: string;
  description: string;
  id: string;
}

export const database:(TaskProps)[] = [
  {
    id: '1',
    complete: false,
    title: 'Mutations Showcase',
    description: 'Show createMutation in action'
  },
  {
    id: '2',
    complete: true,
    title: 'Grocery Shopping',
    description: 'Get wings for BBQ this weekend'
  },
  {
    id: '3',
    complete: false,
    title: 'SolidJS v1.5',
    description: 'Read the Changelog'
  }, 
  
]

export const getTasks = (): Promise<TaskProps[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(structuredClone(database))
    }, 2000)
  })
}

export const createTask = (task: TaskProps): Promise<TaskProps> => {
  const timeoutTime = task.title.includes('Error') ? 2250 : 2500
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if(task.title.includes('Error')) {
        reject({ message: 'Error creating task' })
        return
      }
      database.unshift({...task, id: String(database.length + 1)})
      resolve(task)
    }, timeoutTime)
  })
}

export const updateTask = (task: TaskProps): Promise<TaskProps> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = database.findIndex(t => t.id === task.id)
      database[index] = task
      resolve(task)
    } , 1250)
  })
}
