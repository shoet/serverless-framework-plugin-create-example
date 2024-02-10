.PHONY: build clean deploy

clean:
	rm -rf ./.bin/**

build:
	sls package

deploy: clean build
	sls deploy --verbose
