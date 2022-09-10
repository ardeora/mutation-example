import { Component, createEffect, createSignal, Accessor, For, Show, Suspense, onMount, Index } from 'solid-js';
import { FaSolidBell } from 'solid-icons/fa'
import { HiOutlineSearch } from 'solid-icons/hi'
import { HiOutlineAdjustments } from 'solid-icons/hi'
import { FaSolidPlus } from 'solid-icons/fa'
import { HiOutlineArrowSmLeft } from 'solid-icons/hi'
import { HiOutlineShoppingBag } from 'solid-icons/hi'
import { getTasks, createTask, TaskProps, updateTask } from './api';
import { RiSystemLoader4Fill } from 'solid-icons/ri';
import { createMutation, createInfiniteQuery, useIsMutating, createQuery, useQueryClient, useIsFetching } from '../../solid-query/src'
import toast from 'solid-toast';
import autoAnimate from '@formkit/auto-animate';
import { SiNike } from 'solid-icons/si'
import { Portal } from 'solid-js/web';
import { createVisibilityObserver } from "@solid-primitives/intersection-observer";

const URL = 'https://infinite-query-server.vercel.app/api/products'

interface ProductDetail {
  name: string;
  description: string;
  image: string;
  price: number;
}

interface ProductPayload {
  nextId: number | null;
  previousId: number | null;
  products: ProductDetail[]
}

const App: Component = () => {

  const productsQuery = createInfiniteQuery<ProductPayload>(
    () => ['products'],
    async ({ pageParam = 0 }) => {
      return await fetch(`${URL}/${pageParam}`).then(d => d.json())
    }, 
    {
      getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
      getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
    }
  )


  let el: HTMLDivElement | undefined;
  const visible = createVisibilityObserver({ threshold: 1 })(() => el);

  createEffect(() => {
    if(visible() && productsQuery.hasNextPage) {
      productsQuery.fetchNextPage()
    }
  })

  return (
    <>
      <div class="bg-white h-screen flex flex-col gap-4 items-center justify-center">
        <div class="aspect-square  flex justify-center items-center p-20 relative rounded-lg">
          <div class="absolute inset-0 rounded-lg overflow-hidden">
            <img src="/img/gradient.png" class="w-full h-full opacity-40 border border-red-200 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" ></img>
          </div>

          <div id="main" class="h-[616px] w-[386px] relative bg-gray-50 rounded-lg border-2 border-[#FF660070] overflow-clip shadow-md shadow-orange-400/30">
            <div class='h-full overflow-scroll' >
              <Header />
              <div ref={el => onMount(() => autoAnimate(el))}  class="grid min-h-full grid-cols-2 px-4 gap-4 mt-4">
                <div id="col-1"></div>
                <div id="col-2"></div>
                <Show when={productsQuery.data}>
                  <For each={productsQuery.data!.pages}>
                    {
                      (pages) => (
                          <For each={pages.products}>
                            {
                              (product, idx) => idx() % 2 == 0 ? (
                                <Portal mount={document.getElementById('col-1')!}>
                                  <ProductCard {...product} />
                                </Portal>
                              ) : (
                                <Portal mount={document.getElementById('col-2')!}>
                                  <ProductCard {...product} />
                                </Portal>
                              )
                            }
                          </For>
                      )
                    }
                  </For>
                </Show>
              </div>
              <div
                ref={el}
                class=" text-[#FF6600] h-32 flex items-center justify-center"
              >{productsQuery.hasNextPage ? 'Loading...' : 'End of List'}</div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

const Header: Component = () => {

  const isFetching = useIsFetching()

  return (
    <>
      <div class='text-gray-300 z-10 bg-gray-50/80 backdrop-blur-md flex p-4 sticky top-0 border-b-2 pb-4 items-center gap-3'>
        <div class="h-9 w-9 flex items-center justify-center border-2 border-gray-200 rounded-lg ">
          <HiOutlineArrowSmLeft size={24} class="text-gray-500" />
        </div>
        <div class="flex-1 flex justify-center">
          <SiNike size={36} color="#FF6600"/>
        </div>
        <div class="h-9 w-9 flex items-center justify-center border-2 border-gray-200 rounded-lg ">
          <HiOutlineShoppingBag size={20} class="text-gray-500" />
        </div>
        
        <Show when={isFetching()} >
          <div class="absolute left-0 top-full w-full h-12 backdrop-blur-md bg-gradient-to-b from-gray-50 to-transparent" >
          </div>
          <div class="absolute -translate-y-full rounded-full left-0 top-full w-full h-1.5 bg-gradient-to-r from-transparent via-[#FF6600] to-transparent -translate-x-full animate-[shimmer_1.25s_infinite]" >
          </div>
        </Show>
        
      </div>
      <div class="px-4 pt-3 flex gap-3 mb-3 ">
        <div class="flex-1 border-2 gap-4 rounded-md text-gray-400 py-2.5 px-2.5 flex items-center" >
          <div>
            <HiOutlineSearch size={20} />
          </div>
          <div class="text-sm flex-1">Search for product name</div>
        </div>
        <div class="rotate-90 h-11 w-11 flex items-center justify-center border-2 rounded-md">
          <HiOutlineAdjustments size={22} class="text-gray-500" />
        </div>
      </div>
      <div class="px-4">
        <h1 class="font-bold text-2xl" >New Arrivals</h1>
        <p class="text-sm text-[#FF6600] font-medium" >Nike Original 2022</p>
      </div>
    </>
  )
}

const ProductCard: Component<ProductDetail> = (props) => {
  return (
    <div class='bg-[#f6f6f6] mb-4 rounded-md p-1 border shadow-sm'>
      <div class="rounded aspect-square relative overflow-hidden" >
        <img class="animate-enter" src={props.image + '.jpg'} onError={(e) => e.currentTarget.src = props.image + '.webp'} ></img>
      </div>
      <div class="pb-2">
        <p class='px-1 mb-1 text-sm text-[#FF6600] leading-tight' >{props.description}</p>
        <p class="px-1 text-lg font-semibold leading-tight" >{props.name}</p>

        <div class='px-1 mt-2'>
          <p class="font-medium">${props.price}</p>
        </div>
      </div>
      
    </div>
  )
}

export default App;
