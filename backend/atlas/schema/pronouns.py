import graphene
from graphql.language.ast import StringValue


class PronounsField(graphene.Scalar):
    class Meta:
        name = "Pronouns"

    @staticmethod
    def coerce_pronouns(value):
        if not value:
            return ""
        bits = value.split("/")
        if len(bits) == 3:
            return " / ".join(bits)

    serialize = coerce_pronouns
    parse_value = coerce_pronouns

    @staticmethod
    def parse_literal(ast):
        if isinstance(ast, StringValue):
            bits = ast.value.split("/")
            if len(bits) == 3:
                return " / ".join(bits)
