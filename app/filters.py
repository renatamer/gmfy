import django_filters

from .models import AppAuthUser, Avatar, Pregunta, Ranking,Tematica

class AvatarFilter(django_filters.FilterSet):
    class Meta:
        model = Avatar
        fields = ('id','nombre')

class AppAuthUserFilter(django_filters.FilterSet):
    class Meta:
        model = AppAuthUser
        fields = ('first_name','last_name','is_active')

class PreguntaFilter(django_filters.FilterSet):
    class Meta:
        model = Pregunta
        fields = ('pregunta','tematica_id_tematica')

class TematicaFilter(django_filters.FilterSet):
    class Meta:
        model = Tematica
        fields = ('nombre','fecha')

class RankingFilter(django_filters.FilterSet):
    class Meta:
        model = Ranking
        fields = ('resultado_id','puntos','participante')


        