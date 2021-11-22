from django.forms.models import ModelForm
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Alternativa, AppAuthUser, AuthGroup, Pregunta, Tematica, Avatar


class UsuarioAdmin(admin.ModelAdmin):
    list_display = ["id", "first_name", "last_name", "email", "is_active", "is_superuser", "is_staff"]
    list_Editable = ["is_active"]
    search_fields = ["first_name", "last_name"]
    list_filter = ["is_active"]
    ordering = ['id']
    list_per_page = 20

class AvatarAdmin(admin.ModelAdmin):
    list_display = ["id", "nombre","avatar"]    
    list_Editable = ["nombre"]
    search_fields = ['nombre']
    list_filter = ["nombre"]
    ordering = ['id']
    list_per_page = 10    

class AlternativaInLineAdmin(admin.TabularInline):
    model = Alternativa

class PreguntaInLineAdmin(admin.TabularInline):
    model = Pregunta

class PreguntaAdmin(admin.ModelAdmin):
    inlines = [AlternativaInLineAdmin]

class TematicaAdmin(admin.ModelAdmin):
    inlines = [PreguntaInLineAdmin]


admin.site.register(Pregunta, PreguntaAdmin)
admin.site.register(Tematica, TematicaAdmin)
admin.site.register(AppAuthUser, UsuarioAdmin)
admin.site.register(Avatar,AvatarAdmin)


