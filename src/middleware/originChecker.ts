import { Request, Response, NextFunction } from 'express'

const isOriginAllowed = (origin: string, allowedOrigins: string[]): boolean => {
  const url = new URL(origin)

  return allowedOrigins.some((allowed) => {
    const allowedUrl = new URL(allowed)

    // Check protocol (http or https)
    if (url.protocol !== allowedUrl.protocol) {
      return false
    }

    // Check if the host of the origin URL includes the allowed origin host as a suffix
    return url.host.endsWith(`${allowedUrl.host}`)
  })
}

const originChecker = (req: Request, res: Response, next: NextFunction) => {
  // Allowed origins
  const allowedOrigins: string[] = process.env.VITE_ALLOWED_ORIGINS?.split(',') || []
  // Get the origin of the request
  const origin: string | undefined = req.headers.origin

  // Check if the origin is in the list of allowed origins
  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    // If it is, then we just call next() to move to the next middleware or route handler
    next()
  } else {
    // If it's not, then we send a 403 Forbidden response
    console.log('Origin not allowed:', origin)
    res.status(403).send('Origin not allowed')
  }
}
export default originChecker
