FIELD_CACHE = {}


def Nullable(cls, **kwargs):
    if cls in FIELD_CACHE:
        return FIELD_CACHE[cls](**kwargs)

    class new(cls):
        class Meta:
            name = f"Nullable{cls._meta.name}"

        @staticmethod
        def serialize(value):
            if not value:
                return None
            return cls.serialize(value)

        @staticmethod
        def parse_value(value):
            if not value:
                return ""
            return cls.parse_value(value)

    new.__name__ = f"Nullable{type(cls).__name__}"
    new.__doc__ = cls.__doc__
    FIELD_CACHE[cls] = new
    return new(**kwargs)
