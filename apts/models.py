from django.db import models


class Apartment(models.Model):
    SQUARE_METERS = models.IntegerField()
    ROOMS = models.IntegerField()
    LOCATION = models.CharField(blank=True, max_length=256)
    NOTES = models.CharField(blank=True, max_length=512)
    COSTS = models.ManyToManyField("Cost", blank=True)
    LINK = models.CharField(blank=True, max_length=256)

    def total_cost(self) -> int:
        total = 0
        for cost in self.COSTS.all():
            total += cost.PRICE
        return total


class Cost(models.Model):
    NAME = models.CharField(max_length=50)
    TYPE = models.ForeignKey("CostType", null=True, on_delete=models.CASCADE)
    PRICE = models.IntegerField(null=True)
    PRICE_IS_ESTIMATED = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.NAME is None and self.TYPE is not None:
            self.NAME = self.TYPE.NAME
        super(Cost, self).save(*args, **kwargs)


class CostType(models.Model):
    NAME = models.CharField(max_length=50, unique=True)
