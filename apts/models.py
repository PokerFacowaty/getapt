from django.db import models


class Apartment(models.Model):
    SQUARE_METERS = models.IntegerField()
    ROOMS = models.IntegerField()
    LOCATION = models.CharField(blank=True, max_length=256)
    NOTES = models.CharField(blank=True, max_length=512)
    COSTS = models.ManyToManyField("Cost")

    def total_cost(self) -> int:
        total = 0
        for cost in self.COSTS:
            total += cost.PRICE
        return total


class Cost(models.Model):
    NAME = models.CharField(max_length=50)
    PRICE = models.IntegerField(null=True)
    ESTIMATED_PRICE = models.IntegerField(null=True)
    # Where to copy the price from if it's not known
    COPY = "CP"
    DEFAULT = "DF"
    NO_PRICE_CHOICES = [(COPY, "Copy from another cost"),
                        (DEFAULT, "Use a default value")]
    NO_PRICE = models.CharField(max_length=20, choices=NO_PRICE_CHOICES,
                                default=DEFAULT)
    PRICE_TO_COPY = models.ForeignKey("Cost", null=True,
                                      on_delete=models.CASCADE)
    DEFAULT_PRICE = models.IntegerField(null=True)

    def save(self, *args, **kwargs):
        if (self.PRICE is None and self.NO_PRICE == "CP"
           and self.PRICE_TO_COPY is not None):
            self.PRICE = self.PRICE_TO_COPY.PRICE
        elif (self.PRICE is None and self.NO_PRICE_CHOICES == "DF"):
            self.PRICE = self.DEFAULT_PRICE
        super(Cost, self).save(*args, **kwargs)
