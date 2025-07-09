"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
var asyncHandler = function (fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// Express v5’s typings are stricter, and specifically the router method overloads are now strongly
// typed to handle both middleware functions and sub-applications.
// When TypeScript sees your handler returning a Promise and you directly pass that to router.get(),
// it’s confused whether you’re trying to pass a middleware function or a sub-application (Application)
//
// This happens because Express v5 introduced a new overload:
//
// (path: PathParams, subApplication: Application): T;
//
// TypeScript now thinks you might be passing a sub-application instead of a handler function,
// and because your function returns a Promise, it gets misinterpreted in some cases.
//asyncHandler makes the async function conform to the expected RequestHandler type.
//
// It eliminates TypeScript’s confusion between middleware functions and sub-applications.
//
// It correctly propagates errors to your next function (so you can have a global error handler).
