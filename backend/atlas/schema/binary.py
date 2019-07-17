from base64 import b64encode

import graphene
from graphql.language.ast import StringValue


class BinaryField(graphene.Scalar):
    class Meta:
        name = "Binary"

    @staticmethod
    def coerce_binary(value):
        if isinstance(value, memoryview):
            return b64encode(value.tobytes()).decode("utf-8")
        elif isinstance(value, bytes):
            return b64encode(value).decode("utf-8")
        return value

    serialize = coerce_binary
    parse_value = coerce_binary

    @staticmethod
    def parse_literal(ast):
        print(type(ast))
        if isinstance(ast, StringValue):
            return ast.value
