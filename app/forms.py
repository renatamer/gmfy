import datetime
from typing import Optional

from django.contrib.auth.forms import UserCreationForm, UserModel
from django import forms
from django.db.models.enums import Choices
from django.forms.fields import ChoiceField

from.models import *
from django.forms.models import inlineformset_factory


# class UserAdminCreationForm(UserCreationForm):
#     """
#     A Custom form for creating new users.
#     """
    
#     class Meta:
#         model = get_user_model()
#         fields = ['email']
        
ESTADO = (
    ('', 'Elige un estado...'),
    ('0', 'Inactivo'),
    ('1', 'Activo')
)

class UsuarioForm(UserCreationForm):

    first_name = forms.CharField(
        label = "Nombres",
        widget=forms.TextInput(attrs={"placeholder": "Introducir nombres", "class": "form-input", "size": "30"})
    )

    last_name = forms.CharField(
        label = "Apellidos",
        widget=forms.TextInput(attrs={"placeholder": "Introducir apellidos", "class": "form-input", "size": "30"})
    )

    email = forms.CharField(
        label = "Correo electrónico",
        widget=forms.EmailInput(attrs={"placeholder": "Introducir correo", "class": "form-input", "size": "30"})
    )

    is_active = forms.ChoiceField(
        label = "Estado",
        choices=ESTADO,
        widget=forms.Select(attrs={"class": "form-select"})
    )
    
    password = forms.CharField(
        label = "",
        widget=forms.HiddenInput(),required = False
    )
    
    avatar = forms.ImageField(
       label = "Avatar",
       widget=forms.FileInput(), required=False  
    )
    
    class Meta:
        model = Auth_User
        fields = ["first_name", "last_name", "email", "password", "is_active", "avatar"]
        
        
class UsuarioModForm(forms.ModelForm):
    
    first_name = forms.CharField(
        label = "Nombres",
        widget=forms.TextInput(attrs={"placeholder": "Introducir nombres", "class": "form-input", "size": "30"})
    )

    last_name = forms.CharField(
        label = "Apellidos",
        widget=forms.TextInput(attrs={"placeholder": "Introducir apellidos", "class": "form-input", "size": "30"})
    )

    email = forms.CharField(
        label = "Correo electrónico",
        widget=forms.EmailInput(attrs={"placeholder": "Introducir correo", "class": "form-input", "size": "30"})
    )

    is_active = forms.ChoiceField(
        label = "Estado",
        choices=ESTADO,
        widget=forms.Select(attrs={"class": "form-select"})
    )
    
   
    avatar = forms.ImageField(
       label = "Avatar",
       widget=forms.FileInput(), required=False  
    )
    
    class Meta:
        model = AppAuthUser
        fields = ["first_name", "last_name", "email", "is_active", "avatar"]
        
     

class PerfilModForm(forms.ModelForm):
    
    first_name = forms.CharField(
        label = "Nombres",
        widget=forms.TextInput(attrs={"placeholder": "Introducir nombres", "class": "form-input", "size": "30"})
    )

    last_name = forms.CharField(
        label = "Apellidos",
        widget=forms.TextInput(attrs={"placeholder": "Introducir apellidos", "class": "form-input", "size": "30"})
    )

    email = forms.CharField(
        label = "Correo electrónico",
        widget=forms.EmailInput(attrs={"placeholder": "Introducir correo", "class": "form-input", "size": "30"})
    )

    is_active = forms.ChoiceField(
        label = "Estado",
        choices=ESTADO,
        widget=forms.Select(attrs={"class": "form-select"}) 
    )
    
   
    avatar = forms.ImageField(
       label = "Avatar",
       widget=forms.FileInput(), required=False  
    )
    
    class Meta:
        model = AppAuthUser
        fields = ["first_name", "last_name", "email", "is_active", "avatar"]


class TematicaForm(forms.ModelForm):
    
    nombre = forms.CharField(
        label = "Nombre",
        widget=forms.TextInput(attrs={"placeholder": "Introducir nombres", "class": "form-input", "size": "30"})
    )

    icono = forms.ImageField(
       label = "Icono", required=False,
       widget=forms.FileInput()   
    )
    class Meta:
        model = Tematica
        fields = ["nombre","icono"]



class PreguntaForm(forms.ModelForm):
    preg_orden = forms.IntegerField(
        label = "Orden",
        widget=forms.NumberInput()
    )
    
    pregunta = forms.CharField(
        label = "Pregunta",
        widget=forms.TextInput(attrs={"placeholder": "Ingresa la pregunta", "class": "form-input", "size": "30"})
    )

    puntos = forms.IntegerField(
        label = "Puntos",
        widget=forms.NumberInput(attrs={"placeholder": "Introducir Puntaje ", "class": "form-input", "size": "30"})  
    )

    tiempo = forms.IntegerField(
        label = "Tiempo",
        widget=forms.NumberInput(attrs={"placeholder": "Introducir Tiempo ", "class": "form-input", "size": "30"}) 
    )

    audio = forms.FileField(
        label = "Audio", required=False,
        widget=forms.FileInput(),
    )
    tematica_id_tematica=forms.ModelChoiceField(
        label='Trivia', 
        empty_label="(Seleccione una trivia)",
        queryset=Tematica.objects.all(), 
        widget=forms.Select()       
    )
    class Meta:
        model = Pregunta
        fields = ["preg_orden","pregunta","puntos","tiempo","audio", "tematica_id_tematica"]



ORDEN = (
    ('0', 'Asigne valor..'),
    ('1', '1'),
    ('2', '2'),
    ('3', '3'),
    ('4', '4'),
)

class AlternativaForm(forms.ModelForm):

    orden1 = 1
    orden2 = 2
    orden3 = 3
    orden4 = 4

    ORDEN_CHOICES = (
        (orden1, 1),
        (orden2, 2),
        (orden3, 3),
        (orden4, 4)
    )

    alt_orden = forms.ChoiceField(label="Num. alternativa", choices = ORDEN_CHOICES)

    class Meta:
        model = Alternativa
        fields = (
            'alt_orden',
            'alternativa',
            'es_correcta'
        )

AlternativaFormSet = inlineformset_factory(
    Pregunta,
    Alternativa,
    form=AlternativaForm,
    max_num=4,  # minimum number of forms that must be filled in
    extra=1,  # number of empty forms to display
    can_delete=False  # show a checkbox in each form to delete the row
)



class AuthGroupForm(forms.ModelForm):
    name = forms.CharField(
        label = "Nombre", 
        widget=forms.TextInput(attrs={"placeholder": "Ingresa grupo"})
    )

    class Meta:
        model = AuthGroup
        fields = ["name"]
        
class AuthGroupPermissionsform(forms.ModelForm):
   
    group = forms.ModelChoiceField(
        label='Trivia', 
        empty_label="(Seleccione un grupo)",
        queryset=AuthGroup.objects.all(), 
        widget=forms.Select()       
    )
    
    permission = forms.ModelChoiceField(
        label='Trivia', 
        empty_label="(Seleccione un permiso)",
        queryset=AuthPermission.objects.all(), 
        widget=forms.Select()       
    )

    class Meta:
        model = AuthGroupPermissions
        fields = "__all__"
        
class AvatarForm(forms.ModelForm):
    
    avatar = forms.ImageField(
       label = "Avatar",
       widget=forms.FileInput()   
    )
    nombre = forms.CharField(
        label = "Nombre",
        widget=forms.TextInput(attrs={"placeholder": "Introducir nombre", "class": "form-input", "size": "30"})
    )
    class Meta:
        model = Avatar
        fields = ["avatar","nombre"]

