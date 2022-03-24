#!/bin/sh

[ -n "$CI" ] && exit 0

cd .. && npx husky install odd-platform-ui/.husky