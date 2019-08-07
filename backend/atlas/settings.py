"""
Atlas

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import logging
import os
from datetime import timedelta

import dj_database_url
import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    integrations=[CeleryIntegration(), DjangoIntegration(), RedisIntegration()],
    release=os.environ.get("BUILD_REVISION") or None,
    environment=(
        os.environ.get("SENTRY_ENVIRONMENT")
        or os.environ.get("NODE_ENV")
        or "development"
    ),
    traces_sample_rate=1.0,
    traceparent_v2=True,
)

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY") or "a weak ass secret key"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", False)

# This should be handled by upstream proxy
ALLOWED_HOSTS = ["*"]


# Application definition

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "health_check",
    "health_check.db",
    "graphene_django",
    "atlas",
    "django_celery_beat",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "atlas.middleware.auth.JWSTokenAuthenticationMiddleware",
]

ROOT_URLCONF = "atlas.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "atlas.wsgi.application"

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    "default": dj_database_url.config(
        default="postgresql://postgres@127.0.0.1:5432/postgres"
    )
}

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "atlas.User"

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

# STATIC_URL = "/static/"

# MEDIA_ROOT = os.path.join(
#     os.path.abspath(os.path.dirname(__file__)), os.pardir, "media/"
# )
# MEDIA_URL = "/media/"

CELERY_IMPORTS = ("atlas.tasks",)
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL") or "redis://127.0.0.1:6379/0"

CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"
CELERY_BEAT_SCHEDULE = {
    "atlas-sync-google": {
        "task": "atlas.tasks.sync_google",
        "schedule": timedelta(hours=1),
        "options": {"expires": 3600},
    }
}

GRAPHENE = {"SCHEMA": "atlas.root_schema.schema"}

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI") or "http://localhost:8080"
GOOGLE_DOMAIN = os.environ.get("GOOGLE_DOMAIN") or "sentry.io"
# TODO(dcramer): it'd be great to not be storing these in real columns
GOOGLE_FIELD_MAP = (
    # "column" => "SchemaName/FieldName"
    # system
    ("is_human", "System/Is_Human"),
    ("employee_type", "System/Employee_Type"),
    # core
    ("date_started", "Profile/Date_of_Hire"),
    ("date_of_birth", "Profile/Date_of_Birth"),
    # profile
    ("handle", "Profile/Handle"),
    ("pronouns", "Profile/Pronouns"),
    # social
    ("bio", "Profile/Bio"),
    ("linkedin", "Social/LinkedIn"),
    ("twitter", "Social/Twitter"),
    ("github", "Social/GitHub"),
    # games
    ("steam", "GamerTags/Steam"),
    ("xbox", "GamerTags/Xbox"),
    ("playstation", "GamerTags/PlayStation"),
    ("nintendo", "GamerTags/Nintendo"),
)

# Excepts a child field for every day of the week:
# Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
GOOGLE_SCHEDULE_FIELD = "Schedule"

if not GOOGLE_CLIENT_ID:
    logging.warning("You have not configured GOOGLE_CLIENT_ID.")
if not GOOGLE_CLIENT_SECRET:
    logging.warning("You have not configured GOOGLE_CLIENT_SECRET.")

# should we enable push updates for when local profiles are edited?
# its useful to disable this in development
GOOGLE_PUSH_UPDATES = not os.environ.get("DISABLE_GOOGLE_PUSH")

DEFAULT_SCHEDULE = [
    "OFF",
    "INOFFICE",
    "INOFFICE",
    "INOFFICE",
    "INOFFICE",
    "INOFFICE",
    "OFF",
]
