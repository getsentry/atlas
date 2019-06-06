# Use an official Python runtime as a parent image
FROM python:3.7-slim-stretch

# add our user and group first to make sure their IDs get assigned consistently
RUN groupadd -r app && useradd -r -m -g app app

ENV PATH /usr/src/app/bin:/root/.poetry/bin:$PATH

ENV PYTHONUNBUFFERED 1

ENV PIP_NO_CACHE_DIR off
ENV PIP_DISABLE_PIP_VERSION_CHECK on
ENV PIP_VERSION 18.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN set -ex \
    && apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        curl \
        gcc \
        git \
        gosu \
        libffi-dev \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://raw.githubusercontent.com/sdispater/poetry/0.12.16/get-poetry.py | python \
  && poetry config settings.virtualenvs.create false

RUN pip install "pip==$PIP_VERSION"

COPY pyproject.toml poetry.lock /usr/src/app/
RUN poetry install --no-dev

COPY . /usr/src/app/
# ensure we've got full module install now
RUN poetry install --no-dev

ENV PATH /usr/src/app/bin:$PATH

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint"]

CMD ["gunicorn", "atlas.wsgi" "--log-file -"]
