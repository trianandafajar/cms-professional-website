import type { Endpoint } from 'payload'

export const healthEndpoint: Endpoint = {
  path: '/health',
  method: 'get',
  handler: async (req) => {
    const { payload } = req

    let databaseOk = false

    try {
      const result = await payload.find({
        collection: 'users',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      databaseOk = Array.isArray(result.docs)
    } catch {
      databaseOk = false
    }

    return Response.json({
      status: databaseOk ? 'ok' : 'degraded',
      api: true,
      database: databaseOk,
    })
  },
}
