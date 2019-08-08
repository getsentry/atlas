from functools import partial

import sentry_sdk


class TracingMiddleware(object):
    def _after_resolve(self, span, info, data):
        span.__exit__(None, None, None)
        span.description = ".".join(info.path)
        return data

    def resolve(self, _next, root, info, *args, **kwargs):
        span = sentry_sdk.Hub.current.span(
            transaction=info.path[0] if len(info.path) == 1 else None,
            op=info.operation.operation,
        )
        span.__enter__()
        on_result_f = partial(self._after_resolve, span, info)
        return _next(root, info, *args, **kwargs).then(on_result_f)
