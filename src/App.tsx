import { Component, createEffect, createSignal, Accessor, For, Show, Suspense, onMount, Index } from 'solid-js';
import { FaSolidBell } from 'solid-icons/fa'
import { HiOutlineSearch } from 'solid-icons/hi'
import { HiOutlineAdjustments } from 'solid-icons/hi'
import { FaSolidPlus } from 'solid-icons/fa'
import { HiSolidCheck } from 'solid-icons/hi'
import { getTasks, createTask, TaskProps, updateTask } from './api';
import { RiSystemLoader4Fill } from 'solid-icons/ri';
import { createMutation, createQuery, useQueryClient } from '../../solid-query/src'
import toast from 'solid-toast';
import autoAnimate from '@formkit/auto-animate';
import { createMotion } from "@motionone/solid";
// @ts-ignore
import { Key } from './Key';

const Header: Component = () => {
  return (
    <>
      <div class='text-gray-300 flex items-center gap-3 mb-4'>
        <h1 class='font-bold text-2xl' >Hello Aryan</h1>
        <h1 class='font-semibold text-2xl' >👋</h1>
        <div class="flex-1" ></div>
        <div class="relative">
          <div class="bg-slate-300 translate-x-3.5 h-2 w-2 absolute rounded-full border-4 border-red-500" ></div>
          <FaSolidBell size={22}/>
        </div>
      </div>
      <div class="bg-primary-lightGray gap-4 mb-4 rounded-md text-gray-400 py-3 px-4 flex items-center" >
        <div>
          <HiOutlineSearch size={20} />
        </div>
        <div class="text-sm flex-1">Search tasks or projects</div>
        <div class="rotate-90 opacity-70">
          <HiOutlineAdjustments size={20} />
        </div>
      </div>
    </>
  )
}

const AddTaskButton: Component = () => {

  const [showModal, setShowModal] = createSignal(false);
  const queryClient = useQueryClient();

  const mutation = createMutation(createTask, {
    onMutate: async (task) => {
      await queryClient.cancelQueries(['todos'])

      const previousTasks = queryClient.getQueryData<TaskProps[]>(['todos']);

      if (previousTasks) {
        queryClient.setQueryData(['todos'], [task, ...previousTasks,])
      } else {
        queryClient.setQueryData(['todos'], [task])
      }

      return { previousTasks: previousTasks || [] }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['todos'])
    },
    onError: (error: { message: string; }, variables, context) => {
      console.log(error)
      setTimeout(() => {
        toast.error(error.message, {
          style: {
            'background-color': '#2C3748',
            'color': '#d1d5db',
          },
          className: 'border-2 border-gray-600',
          duration: 4000,
          iconTheme: {
            primary: '#dc2626'
          }
        })
      }, 500)
      if (context) {
        queryClient.setQueryData(['todos'], context.previousTasks)
      }
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = (formData.get('title') || '') as string;
    const description = (formData.get('description') || '') as string;

    const previousTasks = queryClient.getQueryData<TaskProps[]>(['todos']);
    const previousLength = previousTasks ? previousTasks.length : 0;

    mutation.mutate({ title, description, complete: false, id: `${previousLength + 1}` });
    form.reset();
    setShowModal(false);
  }

  createEffect(() => {
    if (showModal()) {
      document.getElementById('title')?.focus();
    }
  })

  return (
    <>
      <div class="mt-4 flex justify-end" >
        <button 
          onClick={() => setShowModal(true)} 
          class="text-gray-100 flex items-center justify-center bg-blue-600 hover:bg-blue-600/80 rounded-full h-14 w-14 font-bold">
          <FaSolidPlus size={24} />
        </button>
      </div>
      <Show when={showModal()}>
        <div class="bg-gray-900/80 flex items-center justify-center backdrop-blur-sm absolute rounded-lg w-full h-full left-0 top-0" >
          <div class='bg-primary-lightGray flex flex-col text-gray-300/80 h-[300px] w-[88%] rounded-md p-4'>
            <div class="flex">
              <div class='font-semibold flex-1 text-lg'>Add New Task</div>
              <button onClick={() => setShowModal(false)} class='font-semibold rotate-45 hover:text-gray-300/80'>
                <FaSolidPlus />
              </button>
            </div>

            <form onSubmit={handleSubmit} class='flex-1 pt-4 flex flex-col' >
              <div>
                <label for="title" class='text-gray-300' >Title</label>
                <input id="title" name="title" class='focus:outline-none focus:border-sky-500 focus:ring-0 focus:ring-sky-500 w-full border-2 border-gray-600 rounded-md mt-1.5 p-1.5 mb-4 bg-gray-700' type='text' />
                <label for="description" class='text-gray-300' >Description</label>
                <input id="description" name="description" class='focus:outline-none focus:border-sky-500 focus:ring-0 focus:ring-sky-500 w-full border-2 border-gray-600 rounded-md mt-1.5 p-1.5 bg-gray-700' type='text' />
              </div>
              <div class='flex-1 flex items-end justify-end' >
                <input class="px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded font-semibold bg-blue-600 text-white" type="submit" value="Create" />
              </div>
            </form>
          </div>
        </div>
      </Show>
    </>
  )
}

const TaskList: Component = () => {

  const todosQuery = createQuery<TaskProps[]>(
    () => ['todos'],
    () => getTasks()
  )

  return (
    <>
      <div class="flex items-center mb-4">
        <h1 class="text-gray-300 flex-1 text-2xl font-medium" >Recent Tasks</h1>
        <div class="text-gray-300/80 text-sm font-semibold">
          <Show when={todosQuery.isFetching}>
            <div class="flex items-center gap-1">
              <RiSystemLoader4Fill class="h-5 w-5 text-gray-500 animate-spin" />
              <div>Background Sync</div>
            </div>
          </Show>
        </div>
      </div>    
      <Show when={todosQuery.data}>
        <div ref={el => onMount(() => {
          autoAnimate(el)
        })} class="flex flex-col gap-4">
          
          <Key each={todosQuery.data!} by={(todos: TaskProps) => todos.id}>
            {(task: Accessor<TaskProps>) => (
              <Task {...task()}  />
            )}
          </Key>
          
        </div>
      </Show>
    </>
  )
}

const Spinner: Component = () => {
  return (
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <RiSystemLoader4Fill class="h-10 w-10 text-gray-500 animate-spin" />
    </div>
  )
}

const App: Component = () => {
  return (
    <div class="bg-primary-background h-screen flex items-center justify-center">
      <div id="main" class="h-[616px] w-[428px] flex flex-col relative bg-primary-foreground rounded-lg border-2 border-gray-700 p-6">

        <Header />

        <div class="flex-1 overflow-scroll relative">
          <Suspense fallback={<Spinner />}>
            <TaskList />
          </Suspense>
        </div>
        
        <AddTaskButton />
        
        
      </div>
      


    </div>
  );
};

const Task: Component<TaskProps> = (props) => {

  const queryClient = useQueryClient();

  const mutation = createMutation(updateTask, {
    onMutate: async (task) => {
      await queryClient.cancelQueries(['todos'])

      const previousTasks: TaskProps[] = structuredClone(queryClient.getQueryData<TaskProps[]>(['todos']));

      if (previousTasks) {
        const index = previousTasks.findIndex(t => t.id === task.id);
        
        previousTasks[index] = task;
        queryClient.setQueryData(['todos'], [...previousTasks]);
      } 

      return { previousTasks }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['todos'])
    }
  })

  const handleComplete = () => {
    mutation.mutate({
      ...props,
      complete: !props.complete
    })
  }

  return (
    <div class="bg-primary-lightGray flex gap-5 flex-1 items-center rounded-lg px-4 py-5">
      <div class='flex-1 flex flex-col gap-1' >
        <div class="font-semibold text-gray-300" >{props.title}</div>
        <div class="text-gray-300/80 text-sm">
          {props.description}
        </div>
      </div>
      <div>
        <button onClick={handleComplete} class={`h-10 w-10 border-[6px] ${props.complete ? 'bg-[#41CA8Fd0]' : ''} border-primary-background rounded-full flex items-center justify-center`} >
          {props.complete ? <HiSolidCheck class=" stroke-2 " size={16} color="white"/> : null}
        </button>
      </div>
    </div>
  );
};

export default App;
