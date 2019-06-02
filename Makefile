develop: install-requirements setup-git

upgrade: install-requirements

setup-git:
	pre-commit install
	git config branch.autosetuprebase always
	git config --bool flake8.strict true

install-requirements:
	poetry install
	cd frontend && npm install
	cd proxy && npm install
	npm install

generate-requirements:
	poetry run pip freeze > $@

test:
	poetry run py.test

reset-db:
	$(MAKE) drop-db
	$(MAKE) create-db
	poetry run atlas migrate

drop-db:
	dropdb --if-exists atlas

create-db:
	createdb -E utf-8 atlas

build-docker-image:
	docker build -t atlas .

run-docker-image:
	docker rm atlas || exit 0
	docker run --init -d -p 8000:8000/tcp --name atlas atlas
