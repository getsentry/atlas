import hashlib
import logging

import sentry_sdk
from graphene_file_upload.django import FileUploadGraphQLView

logger = logging.getLogger("atlas")


def get_operation_name(params):
    operation_name = params.get("operationName")
    if operation_name:
        return operation_name
    return "unnamed operation ({})".format(hashlib.sha1(params["query"]).hexdigest())


class EnhancedGraphQLView(FileUploadGraphQLView):
    # https://github.com/graphql-python/graphene-django/issues/124
    def execute_graphql_request(self, request, params, *args, **kwargs):
        """Extract any exceptions and send them to Sentry"""
        with sentry_sdk.configure_scope() as scope:
            scope.transaction = "{} {}".format(request.path, get_operation_name(params))
        result = super().execute_graphql_request(request, params, *args, **kwargs)
        if result and result.errors:
            for error in result.errors:
                if hasattr(error, "original_error"):
                    try:
                        raise error.original_error
                    except Exception as e:
                        logger.exception(e)
                        sentry_sdk.capture_exception(e)
                else:
                    logger.error(error)
                    sentry_sdk.capture_message(error, "error")
        return result
