from django.conf.urls import url
from django.urls import path

from .views import *

urlpatterns = [
    path('', landing, name="landing"),
    path('', login, name="login"),
    path('home/', home, name="home"),    
    path('perfil/<id>/', perfil, name="perfil"),  
    path('registroUsuario/', registroUsuario, name="registroUsuario"),
    path('modificarUsuario/<id>/', modificarUsuario, name="modificarUsuario"),
    path('eliminarUsuario/<id>/', eliminarUsuario, name="eliminarUsuario"),
    path('page1/', page1, name="page1"),
    path('adminU/', adminU, name="adminU"),
    path('AdminTrivia/', AdminTrivia, name="AdminTrivia"),
    path('RegistroTrivia/',RegistroTrivia, name="RegistroTrivia"),
    path('ModificarTrivia/<id>/', ModificarTrivia, name="ModificarTrivia"),
    path('EliminarTrivia/<id>/', EliminarTrivia, name="EliminarTrivia"),
    path('ListarPreguntas/', ListarPreguntas, name="ListarPreguntas"),
    path('AdminPreguntas', AdminPreguntas, name="AdminPreguntas"),
    path('RegistroPregunta/',RegistroPregunta, name="RegistroPregunta"),
    path('ModificarPregunta/<id>/', ModificarPregunta, name="ModificarPregunta"),
    path('EliminarPregunta/<id>/', EliminarPregunta, name="EliminarPregunta"),
    path('CrearGrupos/', CrearGrupos, name="CrearGrupos"), 
    path('AdministrarGrupos/', AdministrarGrupos, name="AdministrarGrupos"),
    path('EliminarGrupo/<id>/', EliminarGrupo, name="EliminarGrupo"),    
    path('ModificarGrupo/<id>/', ModificarGrupo, name="ModificarGrupo"),
    path('AsignarPermisosGrupos/', AsignarPermisosGrupos, name="AsignarPermisosGrupos"), 
    path('htmx/alternativa-form/', crear_alternativa_form, name='alternativa-form'),
    path('htmx/alternativa/<pk>/', detalle_alternativa, name='alternativa-detalle'),
    path('htmx/alternativa/<pk>/update/', update_alternativa, name='update-alternativa'),
    path('htmx/alternativa/<pk>/delete/', eliminar_alternativa, name='eliminar-alternativa'),
    path('pregunta/<pk>/', crear_alternativa, name='crear-alternativa'),
    path('adminAvatar/', adminAvatar, name="adminAvatar"),
    path('registroAvatar/', registroAvatar, name="registroAvatar"),
    path('modificarAvatar/<id>/', modificarAvatar, name="modificarAvatar"),
    path('eliminarAvatar/<id>/', eliminarAvatar, name="eliminarAvatar"),
    path('partida/', partida, name="partida"),  
    path('PartidaResultados/', PartidaResultados, name="PartidaResultados"), 

    
]
