from django.db.models import Aggregate, FloatField


# http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
class WilsonScore(Aggregate):
    name = "WilsonScore"
    template = (
        "CASE WHEN COUNT(%(expressions)s) > 0 THEN ((COUNT(CASE WHEN %(expressions)s > 3 THEN 1 END) + 1.9208) / (COUNT(%(expressions)s)) - "
        "1.96 * SQRT((COUNT(%(expressions)s)) / (COUNT(%(expressions)s)) + 0.9604) / "
        "(COUNT(%(expressions)s))) / (1 + 3.8416 / (COUNT(%(expressions)s))) ELSE 0 END"
    )
    output_field = FloatField()

    def convert_value(self, value, expression, connection):
        return 0.0 if value is None else value
