from decimal import Decimal

import graphene
from graphql.language.ast import FloatValue, IntValue


class DecimalField(graphene.Scalar):
    class Meta:
        name = "Decimal"

    @staticmethod
    def coerce_decimal(value):
        return Decimal(str(value))

    serialize = coerce_decimal
    parse_value = coerce_decimal

    @staticmethod
    def parse_literal(ast):
        if isinstance(ast, IntValue) or isinstance(ast, FloatValue):
            num = Decimal(str(ast.value))
            return num
