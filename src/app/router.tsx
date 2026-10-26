import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import HomePage from '../pages/HomePage'
import TestPage from '../pages/TestPage'
import ResultPage from '../pages/ResultPage'
import NotFoundPage from '../pages/NotFoundPage'

/** Data router нужен для восстановления прокрутки. */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tests/:slug', element: <TestPage /> },
      { path: 'tests/:slug/result', element: <ResultPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
