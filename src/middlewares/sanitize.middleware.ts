import { Request, Response, NextFunction} from "express"; 
import mongoSanitize from "express-mongo-sanitize"; 


export function sanitizeInput(req: Request, res: Response, next: NextFunction){
    if(req.body) mongoSanitize.sanitize(req.body);
    if(req.params) mongoSanitize.sanitize(req.params);

    // Express 5's req.query is a getter that re-parses the raw query string on every
    // access (no caching) - mutating it in place has no effect on later reads. Freeze
    // it into a plain, writable property once so sanitization (and hpp() after this)
    // actually persists for the rest of the request.
    if (req.query) {
        const query = req.query;
        mongoSanitize.sanitize(query);
        Object.defineProperty(req, 'query', { value: query, writable: true, configurable: true });
    }

    next();
}