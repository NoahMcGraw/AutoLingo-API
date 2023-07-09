import express, { Request, Response, NextFunction } from 'express'

const originChecker = (req: Request, res: Response, next: NextFunction) => {
  // Allowed origins
  const allowedOrigins: string[] = process.env.VITE_ALLOWED_ORIGINS?.split(',') || []
  // Get the origin of the request
  const origin: string | undefined = req.headers.origin

  // Check if the origin is in the list of allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    // If it is, then we just call next() to move to the next middleware or route handler
    next()
  } else {
    // If it's not, then we send a 403 Forbidden response
    console.log('Origin not allowed:', origin)
    res.status(403).send('Origin not allowed')
  }
}
export default originChecker
