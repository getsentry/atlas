develop: install-requirements setup-git

upgrade: install-requirements

setup-git:
	pre-commit install
	git config branch.autosetuprebase always
	git config --bool flake8.strict true

install-requirements:
	cd backend && poetry install
	cd frontend && npm install
	npm install

generate-requirements:
	cd backend && poetry run pip freeze > $@

test:
	cd backend && poetry run py.test

reset-db:
	$(MAKE) drop-db
	$(MAKE) create-db
	cd backend && poetry run atlas migrate

drop-db:
	dropdb --if-exists -h 127.0.0.1 -U postgres postgres

create-db:
	createdb -E utf-8 -h 127.0.0.1 -U postgres postgres

build-docker-images:
	docker build -t atlas-backend backend
	docker build -t atlas-frontend frontend

run-docker-images:
	docker rm atlas-backend || exit 0
	docker rm atlas-frontend || exit 0
	docker run --rm --init -d -p 8000:8000/tcp --name atlas-backend atlas-backend
	docker run --rm --init -d -p 3000:3000/tcp --name atlas-frontend atlas-frontend
