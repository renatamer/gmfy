#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
#from django.contrib.auth.models import AbstractUser

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.forms.widgets import Select
from django.utils.translation import ugettext_lazy as _




#########################################################################################################
##RESPALDAR TODO PARA ABAJO ANTES DE IMPORTAR LOS MODELOS DE LAS TABLAS DE LA BD Y LUEGO VOLVER A PEGAR##
#########################################################################################################
class CustomUserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    def _create_user(self, email, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

opciones_estado = [
    [0, "Inactivo"],
    [1, "Activo"]
]

class Auth_User(AbstractUser):
    username = None
    id = models.BigAutoField(primary_key=True)
    password = models.CharField("Contraseña", max_length=128, blank=True, null=True)
    is_superuser = models.BooleanField("Superusuario", default=0, null=True)
    first_name = models.CharField("Nombres", max_length=150)
    last_name = models.CharField("Apellidos", max_length=150)
    is_active = models.BooleanField("Estado", default=1)
    email = models.EmailField("Correo", unique=True, max_length=254)
    avatar = models.ImageField(upload_to="avatar", blank=True, null=True)
    

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()


opciones_estado = [
    [0, "Inactivo"],
    [1, "Activo"]
]

import datetime

# choices=opciones_estado
class AppAuthUser(models.Model):
    id = models.BigAutoField(primary_key=True)
    password = models.CharField("Contraseña", max_length=128, blank=True, null=True)
    last_login = models.DateTimeField("Última conexión", blank=True, null=True)
    is_superuser = models.BooleanField("Superusuario", default=0, null=True)
    first_name = models.CharField("Nombres", max_length=150)
    last_name = models.CharField("Apellidos", max_length=150)
    is_staff = models.BooleanField("Administrador", default=0, null=True)
    is_active = models.BooleanField("Estado", default=1)
    date_joined = models.DateField("Fecha registro", default=datetime.date.today)
    email = models.EmailField("Correo", unique=True, max_length=254)
    avatar = models.ImageField(upload_to="avatar", blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'app_auth_user'
        verbose_name = "Usuario"
        ordering = ('id',)
        
    def __str__(self):
        cadena =self.first_name+ " "+self.last_name
        return cadena

class AppAuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    auth_user = models.ForeignKey(AppAuthUser, models.DO_NOTHING)
    group = models.ForeignKey('AuthGroup', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'app_auth_user_groups'
        unique_together = (('auth_user', 'group'),)


class AppAuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    auth_user = models.ForeignKey(AppAuthUser, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'app_auth_user_user_permissions'
        unique_together = (('auth_user', 'permission'),)


class AuditTematica(models.Model):
    id_audit = models.BigIntegerField(primary_key=True)
    accion = models.CharField(max_length=20)
    fecha = models.DateField(blank=True, null=True)
    usuario = models.CharField(max_length=20)

    class Meta:
        managed = True
        db_table = 'audit_tematica'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150, blank=True, null=True)
    objects=models.Manager()

    class Meta:
        managed = False
        db_table = 'auth_group'
    def __str__(self):
        return self.name
    


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)
        
   

class AuthPermission(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)
        
    def __str__(self):
        return self.name
        
class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200, blank=True, null=True)
    action_flag = models.IntegerField()
    change_message = models.TextField(blank=True, null=True)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AppAuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField(blank=True, null=True)
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'



class Avatar(models.Model):
    id = models. AutoField(primary_key=True)
    avatar = models.ImageField(upload_to="avatar", blank=True, null=True)
    nombre = models.CharField(max_length=30)
    
    class Meta:
        managed = True
        db_table = 'avatar'
        ordering = ('id',)
    
    def __str__(self):
        return self.nombre


class Tematica(models.Model):
    id_tematica = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    fecha = models.DateField("Fecha registro", default=datetime.date.today)
    icono = models.ImageField(upload_to="trivia", blank=True, null=True)

    class Meta:
        ordering = ('nombre',)

    def __str__(self):
        return self.nombre

class Pregunta(models.Model):
    id_pregunta = models.AutoField(primary_key=True)
    preg_orden=models.IntegerField()
    pregunta = models.CharField(max_length=150)
    puntos = models.IntegerField()
    tiempo = models.IntegerField()
    audio = models.FileField(upload_to='audio', blank=True, null=True)
    tematica_id_tematica = models.ForeignKey(Tematica, on_delete=models.CASCADE, db_column='tematica_id_tematica')

    class Meta:
        ordering = ('tematica_id_tematica', 'preg_orden',)

    def __str__(self):
        return self.pregunta

class Alternativa(models.Model):
    id_alternativa =models.AutoField(primary_key=True)
    alt_orden=models.IntegerField()
    alternativa = models.CharField(max_length=50, null=True)
    es_correcta = models.BooleanField(default=False)
    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE, db_column='pregunta_id_pregunta')

    class Meta:
        ordering = ('alt_orden',)

    def __str__(self):
        return self.alternativa
        
  
class Resultado(models.Model):
    id_resultado = models.AutoField(primary_key=True)
    trivia = models.CharField(max_length=150, null=True)
    numero_participantes = models.BigIntegerField(null=True)
    fecha = models.CharField(max_length=150, null=True)
    
    class Meta:
        managed = True
        ordering = ('fecha',)
        db_table = 'resultado'
        
    
   
    def __str__(self):
        cadena="Trivia ("+self.trivia+") "+" Fecha ("+self.fecha+")  "+" Numero de participantes (" + str(self.numero_participantes)+")"
        return cadena
    

class Ranking(models.Model):
    id_ranking = models.AutoField(primary_key=True)
    participante = models.CharField(max_length=50,null=True)
    puntos = models.IntegerField(null=True)  
    resultado = models.ForeignKey(Resultado, on_delete=models.CASCADE)

    class Meta:
        managed = True
        ordering = ('puntos',)
        db_table = 'ranking'
      







