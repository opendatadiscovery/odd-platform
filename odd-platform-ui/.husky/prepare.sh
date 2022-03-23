#!/bin/sh

[ -n "$CI" ] && exit 0

cd .. && husky install odd-platform-ui/.husky