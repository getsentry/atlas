# Use an official Python runtime as a parent image
FROM python:3.8-slim-buster

# add our user and group first to make sure their IDs get assigned consistently
RUN groupadd -r app && useradd -r -m -g app app

ENV PATH /usr/src/app/bin:/root/.poetry/bin:$PATH

ENV PYTHONUNBUFFERED 1

ENV PIP_NO_CACHE_DIR off
ENV PIP_DISABLE_PIP_VERSION_CHECK on

ENV POETRY_VERSION 1.1.4

ENV NODE_ENV production

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

RUN curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python \
  && poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock /usr/src/app/
# HACK(dcramer): we need the atlas module to be installable at this stage
RUN mkdir atlas && touch atlas/__init__.py
RUN poetry install --no-dev

COPY . /usr/src/app/
# ensure we've got full module install now
RUN poetry install --no-dev

ENV PATH /usr/src/app/bin:$PATH

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint"]

CMD ["atlas", "web"]
