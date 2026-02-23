/**
 * Mock Data Middleware
 *
 * Intercepts sub-resource routes (issues, statuses, tags) for the default
 * project only. Project CRUD is handled by real DB-backed routes in
 * app/routes/projects.ts.
 *
 * Guard middleware rejects non-default projectIds so that new DB-persisted
 * projects are not served stale mock data. When the real database layer
 * covers all entities, remove this middleware from app.ts entirely.
 */
import { Hono } from 'hono'
import issues from '../routes/issues'
import statuses from '../routes/statuses'
import tags, { issueTagRoutes } from '../routes/tags'

const mockDataMiddleware = new Hono()

// Guard: only serve mock data for the default project's sub-resources.
// Non-default projects get 404 until those tables are migrated to DB.
mockDataMiddleware.use('/projects/:projectId/*', async (c, next) => {
  if (c.req.param('projectId') !== 'default') {
    return c.json({ success: false, error: 'Project sub-resources not available' }, 404)
  }
  return next()
})

mockDataMiddleware.route('/projects/:projectId/statuses', statuses)
mockDataMiddleware.route('/projects/:projectId/issues', issues)
mockDataMiddleware.route('/projects/:projectId/tags', tags)
mockDataMiddleware.route('/projects/:projectId/issues/:issueId/tags', issueTagRoutes)

export default mockDataMiddleware
