
from ntpath import altsep
from django.contrib import messages
from django.contrib.auth.decorators import login_required

from django.core.paginator import Paginator

from django.contrib.auth.forms import UsernameField
from django.contrib.auth.models import User

from django.db.models.query import QuerySet
from django.http.response import Http404, HttpResponse, HttpResponseNotAllowed
from django.shortcuts import render, redirect, get_object_or_404

from app.filters import AppAuthUserFilter, RankingFilter, PreguntaFilter, AvatarFilter, TematicaFilter
from app.forms import AlternativaFormSet, AppAuthUserGroupsForm, AuthGroupPermissionsform
#from accounts.forms import UserAdminCreationForm
from app.models import AppAuthUser, Auth_User, AuthGroup, Pregunta, Ranking, Tematica, Alternativa, Avatar

from app.forms import  PreguntaForm, TematicaForm, AlternativaForm, UsuarioForm,AuthGroupForm, AvatarForm, PerfilModForm, UsuarioModForm
from django.db import connection

from django.core.paginator import Paginator

# Create your views here.
@login_required()
def home(request):
    usuarios = AppAuthUser.objects.all()
    data = {
        'usuarios': usuarios
    }
    return render(request, 'app/home.html', data)


def login(request):
    return render(request, 'registration/login.html')

@login_required()
def perfil(request, id):

    usuario = get_object_or_404(AppAuthUser, id=id)

    data = {
        'form': PerfilModForm(instance=usuario)
    }

    if request.method == 'POST':
        formregistro = PerfilModForm(data=request.POST, files=request.FILES, instance=usuario) 
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Modificado correctamente") #modifiocar alert
            return redirect(to="home")
        else:
            data["form"] = formregistro

    return render(request, 'app/usuario/perfil.html', data)



def PartidaResultados(request):    
    ranking = Ranking.objects.all()
    page = request.GET.get('page', 1)
    try:
        paginator = Paginator(ranking, 5)
        ranking= paginator.page(page)
    except:
        raise Http404
    
    data = {
        'ranking': ranking,
        'paginator': paginator
    }
    
    filtered_ranking = RankingFilter(
        request.GET,
        queryset=Ranking.objects.all().order_by('-puntos')
    )
    
    data['filtered_ranking'] = filtered_ranking
    paginated_filtered_Ranking = Paginator(filtered_ranking.qs, 50)
    page_number = request.GET.get('page', 1)
    page_obj = paginated_filtered_Ranking.get_page(page_number)
    data['page_obj'] = page_obj
    
    
    return render(request,'app/trivia/PartidaResultados.html', data)


@login_required()
def registroUsuario(request):
    data = {
        'form': UsuarioForm()
    }

    if request.method == 'POST':
        formregistro = UsuarioForm(data=request.POST, files=request.FILES)
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Agregado correctamente") #modifiocar alert
            return redirect(to="adminU")
        else:
            data["form"] = formregistro

    return render(request,'app/usuario/registroUsuario.html', data)


@login_required()
def modificarUsuario(request, id):

    usuario = get_object_or_404(AppAuthUser, id=id)

    data = {
        'form': UsuarioModForm(instance=usuario)
    }

    if request.method == 'POST':
        formregistro = UsuarioModForm(data=request.POST, files=request.FILES, instance=usuario) 
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Modificado correctamente") #modifiocar alert
            return redirect(to="adminU")
        else:
            data["form"] = formregistro

    return render(request, 'app/usuario/modificarUsuario.html', data)

@login_required()
def eliminarUsuario(request, id):

    usuario = get_object_or_404(AppAuthUser, id=id)
    usuario.delete()
    return redirect(to="adminU")

def page1(request):
    return render(request,'app/page1.html')

#def adminT(request):
    #return render(request,'app/adminT.html')
@login_required()
def adminU(request):
    usuarios = AppAuthUser.objects.all()
    page = request.GET.get('page', 1)

    try:
        paginator = Paginator(usuarios, 5)
        usuarios = paginator.page(page)
    except:
        raise Http404

    data = {
        'page_obj': usuarios,
        'paginator': paginator
    }
    
    filtered_AppAuthUser = AppAuthUserFilter(
        request.GET,
        queryset=AppAuthUser.objects.all()
    )

    data['filtered_AppAuthUser'] = filtered_AppAuthUser
    paginated_filtered_AppAuthUser = Paginator(filtered_AppAuthUser.qs, 3)
    page_number = request.GET.get('page', 1)
    page_obj = paginated_filtered_AppAuthUser.get_page(page_number)
    data['page_obj'] = page_obj
    return render(request,'app/usuario/adminU.html', data)


@login_required()
def AdminTrivia(request):
    trivia = Tematica.objects.all()
    page = request.GET.get('page', 1)

    try:
        paginator = Paginator(trivia, 5)
        trivia = paginator.page(page)
    except:
        raise Http404


    data = {
        'page_obj': trivia,
        'paginator': paginator
    }

    filtered_Tematica = TematicaFilter(
        request.GET,
        queryset=Tematica.objects.all()
    )

    data['filtered_Tematica'] = filtered_Tematica
    paginated_filtered_Tematica = Paginator(filtered_Tematica.qs, 5)
    page_number = request.GET.get('page', 1)
    page_obj = paginated_filtered_Tematica.get_page(page_number)
    data['page_obj'] = page_obj
    return render(request,'app/trivia/AdminTrivia.html', data)

@login_required()
def ListarPreguntas(request):
    pregunta = Pregunta.objects.all()
   


    data = {
        'pregunta': pregunta,
    }
    return render(request,'app/trivia/ListarPreguntas.html', data)

@login_required()
def RegistroTrivia(request):
    data = {
        'form': TematicaForm()
    }
    if request.method == 'POST':
        formregistro = TematicaForm(data=request.POST, files=request.FILES)
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Agregado correctamente") #modifiocar alert
            return redirect(to="AdminTrivia")
        else:
               data["form"] = formregistro
    return render(request,'app/trivia/RegistroTrivia.html', data)
    
@login_required()
def ModificarTrivia(request, id):
    
    trivia = get_object_or_404(Tematica, id_tematica=id)

    data = {
        'form': TematicaForm(instance=trivia)
    }

    if request.method == 'POST':
        formregistro = TematicaForm(data=request.POST,files=request.FILES, instance=trivia) 
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Modificado correctamente") #modifiocar alert
            return redirect(to="AdminTrivia")
        else:
            data["form"] = formregistro

    return render(request, 'app/trivia/ModificarTrivia.html', data)

@login_required()
def EliminarTrivia(request, id):

    usuario = get_object_or_404(Tematica, id_tematica=id)
    usuario.delete()
    return redirect(to="AdminTrivia")

@login_required()
def AdminPreguntas(request):
    pregunta = Pregunta.objects.all()
    page = request.GET.get('page', 1)

    try:
        paginator = Paginator(pregunta, 5)
        pregunta = paginator.page(page)
    except:
        raise Http404

    data = {
        'pregunta': pregunta,
        'paginator': paginator
    }
    
    filtered_pregunta = PreguntaFilter(
        request.GET,
        queryset=Pregunta.objects.all()
    )

    data['filtered_pregunta'] = filtered_pregunta
    paginated_filtered_pregunta = Paginator(filtered_pregunta.qs, 5)
    page_number = request.GET.get('page', 1)
    page_obj = paginated_filtered_pregunta.get_page(page_number)
    data['page_obj'] = page_obj
    return render(request,'app/trivia/AdminPreguntas.html', data)

@login_required()    
def RegistroPregunta(request): 
    data = {
        'form': PreguntaForm()
    }
    if request.method == 'POST':
        formregistro = PreguntaForm(data=request.POST, files=request.FILES)
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Agregado correctamente") #modifiocar alert
            return redirect(to="AdminPreguntas") 
        else:
               data["form"] = formregistro
    return render(request,'app/trivia/RegistroPregunta.html', data)
    
@login_required()
def ModificarPregunta(request, id):
    
    pregunta = get_object_or_404(Pregunta, id_pregunta=id)

    data = {
        'form': PreguntaForm(instance=pregunta)
    }

    if request.method == 'POST':
        formregistro = PreguntaForm(data=request.POST,files=request.FILES, instance=pregunta) 
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Modificado correctamente") #modifiocar alert
            return redirect(to="AdminPreguntas")
        else:
            data["form"] = formregistro

    return render(request, 'app/trivia/ModificarPregunta.html', data)
    

@login_required()
def EliminarPregunta(request, id):

    pregunta = get_object_or_404(Pregunta, id_pregunta=id)
    pregunta.delete()
    return redirect(to="AdminPreguntas")


@login_required()
def crear_alternativa(request, pk):
    pregunta = Pregunta.objects.get(id_pregunta=pk)
    alternativa = Alternativa.objects.filter(pregunta=pregunta)
    form = AlternativaForm(request.POST or None)
    contador = Alternativa.objects.filter(pregunta_id=pregunta).count()
    
    if request.method == "POST":
        if form.is_valid() and contador < 4:
            alternativa = form.save(commit=False)
            alternativa.pregunta = pregunta
            alternativa.save()
            messages.success(request, 'Alternativa registrada con exito')
            return redirect("alternativa-detalle", pk=alternativa.id_alternativa)
        else:
            messages.error(request, 'Solo es posible registrar 4 alternativas')
            return render(request, "app/trivia/partials/alternativa_form.html", context={
                "form": form
            })

    context = {
        "form": form,
        "pregunta": pregunta,
        "alternativa": alternativa
    }

    return render(request, "app/trivia/crear_alternativa.html", context)


def update_alternativa(request, pk):
    alternativa = Alternativa.objects.get(id_alternativa=pk)
    form = AlternativaForm(request.POST or None, instance=alternativa)

    if request.method == "POST":
        if form.is_valid():
            form.save()
            return redirect("alternativa-detalle", pk=alternativa.id_alternativa)

    context = {
        "form": form,
        "alternativa": alternativa
    }

    return render(request, "app/trivia/partials/alternativa_form.html", context)


def eliminar_alternativa(request, pk):
    alternativa = get_object_or_404(Alternativa, id_alternativa=pk)

    if request.method == "POST":
        alternativa.delete()
        return HttpResponse("")

    return HttpResponseNotAllowed(
        [
            "POST",
        ]
    )


def detalle_alternativa(request, pk):
    alternativa = get_object_or_404(Alternativa, id_alternativa=pk)
    context = {
        "alternativa": alternativa        
    }
    return render(request, "app/trivia/partials/alternativa_detalle.html", context)


def crear_alternativa_form(request):
    form = AlternativaForm()
    context = {
        "form": form
    }
    return render(request, "app/trivia/partials/alternativa_form.html", context)


@login_required()
def CrearGrupos(request):
    data = {
        'form': AuthGroupForm()
        
    }

    if request.method == 'POST':
        formregistro = AuthGroupForm(data=request.POST) 
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Agregado correctamente")
            return redirect(to="AdministrarGrupos")
        else:
            data["form"] = formregistro
   
    return render(request,'app/usuario/CrearGrupos.html', data)

@login_required()
def AdministrarGrupos(request):
    grupo = AuthGroup.objects.all()
   
    data = {
        'grupo': grupo,
    }
    return render(request,'app/usuario/AdministrarGrupos.html', data)

def EliminarGrupo(request, id):
    grupo = get_object_or_404(AuthGroup, id=id)
    grupo.delete()
    return redirect(to="AdministrarGrupos")

def ModificarGrupo(request, id):
    
    grupo = get_object_or_404(AuthGroup, id=id)

    data = {
        'form': AuthGroupForm(instance=grupo)
    }

    if request.method == 'POST':
        formregistro = AuthGroupForm(data=request.POST,instance=grupo) 
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Modificado correctamente") #modifiocar alert
            return redirect(to="AdministrarGrupos")
        else:
            data["form"] = formregistro

    return render(request, 'app/usuario/ModificarGrupo.html', data)

@login_required()
def AsignarPermisosGrupos(request):
    data = {
        'form': AuthGroupPermissionsform()
        
    }

    if request.method == 'POST':
        formregistro = AuthGroupPermissionsform(data=request.POST) 
        if formregistro.is_valid():
            formregistro.save()
            return redirect(to="AdministrarGrupos")
        else:
            data["form"] = formregistro
   
    return render(request,'app/usuario/AsignarPermisosGrupos.html', data)


@login_required()
def AdmGruposUsuarios(request):
    data = {
        'form': AppAuthUserGroupsForm()
        
    }

    if request.method == 'POST':
        formregistro = AppAuthUserGroupsForm(data=request.POST) 
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"Agregado correctamente")
            return redirect(to="VisualizarGrupos")
        else:
            data["form"] = formregistro
   
    return render(request,'app/usuario/AdmGruposUsuarios.html', data)







    
def landing(request):

    return render(request, 'app/landing.html')

@login_required()
def adminAvatar(request):    
    avatar = Avatar.objects.all()
    page = request.GET.get('page', 1)

    try:
        paginator = Paginator(avatar, 4)
        avatar = paginator.page(page)
    except:
        raise Http404

    data = {
         'page_obj': avatar,
         'paginator': paginator
    }

    filtered_avatar = AvatarFilter(
        request.GET,
        queryset=Avatar.objects.all()
    )

    data['filtered_avatar'] = filtered_avatar
    paginated_filtered_avatar = Paginator(filtered_avatar.qs, 4)
    page_number = request.GET.get('page', 1)
    page_obj = paginated_filtered_avatar.get_page(page_number)
    data['page_obj'] = page_obj
    
    return render(request,'app/avatar/adminAvatar.html', data)

@login_required()
def modificarAvatar(request,id):

    avatar = get_object_or_404(Avatar, id=id)
    data = {
        'form': AvatarForm(instance=avatar)
    }

    if request.method == 'POST':
        formregistro = AvatarForm(data=request.POST, instance=avatar) 
        if formregistro.is_valid():
            formregistro.save()
            messages.success(request,"modificado correctamente")
            return redirect(to="adminAvatar")
        else:
            data["form"] = formregistro
            messages.error(request,"no se a podido modificar")
    return render(request,'app/avatar/modificarAvatar.html', data)    

@login_required()
def registroAvatar(request):
    data = {
        'form': AvatarForm()
    }
    if request.method == 'POST':
        formregistro = AvatarForm(data=request.POST, files=request.FILES)
        if formregistro.is_valid():
            formregistro.save()
            # data["mensaje"] = "Se ha realizado el registro del avatar de forma exitosa"
            messages.success(request,"Agregado correctamente")
            return redirect(to="adminAvatar")
        else:
            data["form"] = formregistro
           
    return render(request,'app/avatar/registroAvatar.html', data)   


def eliminarAvatar(request, id):
    avatar = get_object_or_404(Avatar, id=id)
    avatar.delete()
    return redirect(to="adminAvatar")

def listarAvatar(request):
    avatars = Avatar.objects.all()   

    data = {
        'avatars': avatars,
    }
    return render(request,'app/avatar/adminAvatar.html', data)       

@login_required()
def partida(request):
    return render(request,'app/partida/partida.html') 

@login_required()
def VisualizarPermisos(request):
    grupo = request.GET.get('grupo')
    data ={
        'grupo':VisualizarGrupos(),    
    } 
    return render(request,'app/usuario/VisualizarPermisos.html', data)


def VisualizarGrupos():
    django_cursor = connection.cursor()
    cursor = django_cursor.connection.cursor()
    out_cur = django_cursor.connection.cursor()
    
    cursor.callproc("PR_LISTAR_GRUPOS_PERMISOS",[out_cur])
    
    
    lista = []
    for fila in out_cur:
        lista.append(fila)
    return lista

@login_required()
def VisualizarGruposUsuarios(request):
    usuarios = request.GET.get('usuarios')
    data ={
        'usuarios':VisualizarUsuarios(),    
    } 
    return render(request, 'app/usuario/VisualizarGrupos.html', data)


def VisualizarUsuarios():
    django_cursor = connection.cursor()
    cursor = django_cursor.connection.cursor()
    out_cur = django_cursor.connection.cursor()
    
    cursor.callproc("PR_LISTAR_USUARIOS_GRUPOS",[out_cur])
    
    
    lista = []
    for fila in out_cur:
        lista.append(fila)
    return lista