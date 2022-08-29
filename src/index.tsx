/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';
import { Toaster } from 'solid-toast';

import { QueryClient, QueryClientProvider } from '../../solid-query/src'

const client = new QueryClient();

render(() => (
  <QueryClientProvider client={client}>
    <Toaster gutter={16} position='top-center' />
    <App />
  </QueryClientProvider>
), document.getElementById('root') as HTMLElement);
