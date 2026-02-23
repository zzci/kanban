import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './i18n'
import './index.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const KanbanPage = lazy(() => import('./pages/KanbanPage'))
const IssueDetailPage = lazy(() => import('./pages/IssueDetailPage'))

const queryClient = new QueryClient()

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:projectId" element={<KanbanPage />} />
            <Route
              path="/projects/:projectId/issues"
              element={<IssueDetailPage />}
            />
            <Route
              path="/projects/:projectId/issues/:issueId"
              element={<IssueDetailPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>,
  )
}
