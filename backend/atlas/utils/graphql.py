import sentry_sdk


class TracingMiddleware(object):
    def resolve(self, _next, root, info, *args, **kwargs):
        span = sentry_sdk.Hub.current.start_span(
            # transaction=str(info.path[0]) if len(info.path) == 1 else None,
            op="graphql.resolve",
            description=".".join(str(p) for p in info.path),
        )
        span.__enter__()
        # XXX(dcramer): we cannot use .then() on the promise here as the order of
        # execution is a stack, meaning the first resolved call in a list ends up
        # not popping off of the tree until every other child span has been created
        # (which is not actually how the execution tree looks)
        try:
            return _next(root, info, *args, **kwargs)
        finally:
            span.__exit__(None, None, None)
