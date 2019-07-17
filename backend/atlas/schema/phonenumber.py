import graphene
import phonenumbers
from graphql.language.ast import StringValue

FORMAT = phonenumbers.PhoneNumberFormat.INTERNATIONAL


class PhoneNumberField(graphene.Scalar):
    class Meta:
        name = "PhoneNumber"

    @staticmethod
    def coerce_phone_number(value):
        return phonenumbers.format_number(phonenumbers.parse(value, None), FORMAT)

    serialize = coerce_phone_number
    parse_value = coerce_phone_number

    @staticmethod
    def parse_literal(ast):
        if isinstance(ast, StringValue):
            return phonenumbers.format_number(
                phonenumbers.parse(ast.value, None), FORMAT
            )
