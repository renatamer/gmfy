"""
Django settings for GamifiWork project.

Generated by 'django-admin startproject' using Django 3.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-5vconr#n)&wfhl3$(bvaac924slhfs81jt7t_0qc6+q6m4py4@'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Mandar Email recuperar contraseña por Gmail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'felixguerrak@gmail.com'
EMAIL_HOST_PASSWORD = 'niwthxyeeydoylga'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'GamifiWork G2 <noreply@gamifiwork.com>'
# Mandar Email recuperar contraseña por Gmail (lo de arriba)

ALLOWED_HOSTS = ["*"]

#Framework de mensajeria de django
MESSAGE_STORAGE="django.contrib.messages.storage.cookie.CookieStorage"

LOGIN_REDIRECT_URL= '/home/'
LOGOUT_REDIRECT_URL= '/'

# Application definition

INSTALLED_APPS = [
    'admin_interface',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app.apps.AppConfig',
    'colorfield',
    'crispy_forms',
    'crispy_tailwind',
    #'app',
   # 'audiofield',
]



X_FRAME_OPTIONS = 'SAMEORIGIN'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'GamifiWork.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

#Template formularios bootstrap
CRISPY_TEMPLATE_PACK = 'bootstrap4'

WSGI_APPLICATION = 'GamifiWork.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    #   'default': {
    #     'ENGINE': 'django.db.backends.oracle',
    #     'NAME': 'db202109082118_high',
    #     'USER': 'ADMIN',
    #     'PASSWORD': 'Yellowcard25+',

    #     'TEST': {
    #         'USER': 'default_test',
    #         'TBLSPACE': 'default_test_tbls',
    #         'TBLSPACE_TMP': 'default_test_tbls_tmp',
    #     },
    # },
    
    'default': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': 'db202111201851_high',
        'USER': 'ADMIN',
        'PASSWORD': 'C0nst3laciOn',

        'TEST': {
            'USER': 'default_test',
            'TBLSPACE': 'default_test_tbls',
            'TBLSPACE_TMP': 'default_test_tbls_tmp',
        },
    },
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'es'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'

import os

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

#Modelo de autentificación con correo y no username
AUTH_USER_MODEL='app.Auth_User'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

